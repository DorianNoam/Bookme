import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingReminder } from '@/lib/email'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  // Securite : verifier le token cron de Vercel
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    // Calculer demain (fuseau Algerie = UTC+1)
    const now = new Date()
    const algeriaOffset = 1 // UTC+1
    const algeriaTime = new Date(now.getTime() + algeriaOffset * 60 * 60 * 1000)

    const tomorrow = new Date(algeriaTime)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0).toISOString()
    const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59).toISOString()

    // Recuperer tous les RDV de demain qui sont confirmes et ont un email client
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*, salons(nom)')
      .eq('statut', 'confirme')
      .gte('date_rdv', tomorrowStart)
      .lte('date_rdv', tomorrowEnd)
      .not('client_email', 'is', null)

    if (error) throw error
    if (!reservations || reservations.length === 0) {
      return NextResponse.json({ success: true, message: 'Aucun RDV demain.', sent: 0 })
    }

    let sent = 0
    let failed = 0

    for (const rdv of reservations) {
      if (!rdv.client_email) continue

      try {
        const dateObj = new Date(rdv.date_rdv)
        const timeFormatted = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
        const clientName = rdv.client_prenom ? `${rdv.client_prenom} ${rdv.client_nom}` : rdv.client_nom

        await sendBookingReminder({
          clientEmail: rdv.client_email,
          clientName,
          salonName: rdv.salons?.nom || 'votre salon',
          serviceName: rdv.service_nom,
          time: timeFormatted,
          price: rdv.service_prix,
        })
        sent++
      } catch (err) {
        console.error(`Rappel echoue pour RDV ${rdv.id}:`, err)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      total: reservations.length,
      sent,
      failed
    })
  } catch (err: any) {
    console.error('Erreur cron rappel:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
