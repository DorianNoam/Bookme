import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const salon_id   = parseInt(searchParams.get('salon_id')   || '0')
    const service_id = parseInt(searchParams.get('service_id') || '0')
    const date       = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const emp_id     = parseInt(searchParams.get('emp') || '-1')

    const supabase = createAdminClient()

    // Récupérer le salon et le service
    const [salonRes, serviceRes, employesRes] = await Promise.all([
      supabase.from('salons').select('ouverture, fermeture, jour_off').eq('id', salon_id).single(),
      supabase.from('services').select('duree').eq('id', service_id).single(),
      supabase.from('employes').select('*').eq('salon_id', salon_id),
    ])

    if (!salonRes.data || !serviceRes.data) {
      return NextResponse.json({ error: 'Données introuvables' }, { status: 404 })
    }

    const salon    = salonRes.data
    const duree    = serviceRes.data.duree
    const employes = employesRes.data || []

    // Vérifier jour de fermeture
    const dateObj    = new Date(date + 'T00:00:00')
    const jourSemaine = dateObj.getDay() || 7 // 1=Lun ... 7=Dim

    if (salon.jour_off !== 0 && jourSemaine === salon.jour_off) {
      return NextResponse.json({ creneaux: [], ferme: true })
    }

    // Récupérer les réservations existantes du jour
    const { data: reservations } = await supabase
      .from('reservations')
      .select('employe_id, date_rdv, services(duree)')
      .eq('salon_id', salon_id)
      .gte('date_rdv', date + 'T00:00:00')
      .lt('date_rdv',  date + 'T23:59:59')
      .neq('statut', 'annule')

    // Générer les créneaux
    const [hOuv, mOuv] = salon.ouverture.split(':').map(Number)
    const [hFer, mFer] = salon.fermeture.split(':').map(Number)
    const startMin = hOuv * 60 + mOuv
    const endMin   = hFer * 60 + mFer

    const creneaux: { heure: string; emp_id: number }[] = []

    for (let t = startMin; t + duree <= endMin; t += 30) {
      const tsDebut = t
      const tsFin   = t + duree

      const empsToCheck = emp_id === -1 ? employes : employes.filter(e => e.id === emp_id)

      let empLibreId: number | null = null
      for (const emp of empsToCheck) {
        const busy = (reservations || []).some((r: any) => {
          if (r.employe_id !== emp.id) return false
          const rdvStart = new Date(r.date_rdv)
          const rdvMin   = rdvStart.getHours() * 60 + rdvStart.getMinutes()
          const rdvDuree = r.services?.duree || 30
          const rdvEnd   = rdvMin + rdvDuree
          return rdvMin < tsFin && rdvEnd > tsDebut
        })
        if (!busy) { empLibreId = emp.id; break }
      }

      if (empLibreId !== null) {
        const hh = String(Math.floor(t / 60)).padStart(2, '0')
        const mm = String(t % 60).padStart(2, '0')
        creneaux.push({ heure: `${hh}:${mm}`, emp_id: empLibreId })
      }
    }

    return NextResponse.json({ creneaux, ferme: false })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
