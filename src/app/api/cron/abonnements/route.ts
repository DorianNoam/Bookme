import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAbonnementReminder } from '@/lib/email'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const now = new Date()
    const in30 = new Date(now); in30.setDate(in30.getDate() + 30)
    const in7 = new Date(now); in7.setDate(in7.getDate() + 7)
    const in3 = new Date(now); in3.setDate(in3.getDate() + 3)
    const today = now.toISOString().split('T')[0]
    const d30 = in30.toISOString().split('T')[0]
    const d7 = in7.toISOString().split('T')[0]
    const d3 = in3.toISOString().split('T')[0]

    const { data: pros } = await supabase
      .from('pros')
      .select('id, email, nom, prenom, abonnement_fin')
      .in('abonnement_fin', [d30, d7, d3, today])
      .eq('abonnement_actif', true)

    if (!pros || pros.length === 0) {
      return NextResponse.json({ message: 'Aucun rappel a envoyer', count: 0 })
    }

    let sent = 0
    for (const pro of pros) {
      const { data: salon } = await supabase
        .from('salons')
        .select('nom')
        .eq('pro_id', pro.id)
        .single()

      const fin = new Date(pro.abonnement_fin)
      const diff = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      await sendAbonnementReminder({
        proEmail: pro.email,
        proName: pro.prenom || pro.nom,
        salonName: salon?.nom || 'votre salon',
        abonnementFin: pro.abonnement_fin,
        joursRestants: Math.max(0, diff),
      })
      sent++
    }

    return NextResponse.json({ success: true, count: sent })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
