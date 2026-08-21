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

    // Recuperer le salon, le service, les employes ET les fermetures
    const [salonRes, serviceRes, employesRes, fermeturesRes] = await Promise.all([
      supabase.from('salons').select('ouverture, fermeture, jour_off, pause_active, pause_debut, pause_fin, date_ouverture').eq('id', salon_id).single(),
      supabase.from('services').select('duree').eq('id', service_id).single(),
      supabase.from('employes').select('*').eq('salon_id', salon_id),
      supabase.from('salon_fermetures').select('date_debut, date_fin').eq('salon_id', salon_id),
    ])

    if (!salonRes.data || !serviceRes.data) {
      return NextResponse.json({ error: 'Donnees introuvables' }, { status: 404 })
    }

    const salon    = salonRes.data
    const duree    = serviceRes.data.duree
    const employes = (employesRes.data && employesRes.data.length > 0)
      ? employesRes.data
      : [{ id: 0, nom: 'Patron', salon_id: salon_id }]

    // Verifier jour de fermeture hebdomadaire
    const dateObj    = new Date(date + 'T00:00:00')
    const jourSemaine = dateObj.getDay() || 7 // 1=Lun ... 7=Dim
    if (salon.jour_off !== 0 && jourSemaine === salon.jour_off) {
      return NextResponse.json({ creneaux: [], ferme: true })
    }

    // Avant la date d'ouverture du salon => aucun creneau reservable
    if (salon.date_ouverture && date < salon.date_ouverture) {
      return NextResponse.json({ creneaux: [], ferme: true })
    }

    // Dans une periode de fermeture exceptionnelle => aucun creneau reservable
    const fermetures = fermeturesRes.data || []
    const estFerme = fermetures.some((f: any) => date >= f.date_debut && date <= f.date_fin)
    if (estFerme) {
      return NextResponse.json({ creneaux: [], ferme: true })
    }

    // Recuperer les reservations existantes du jour
    const { data: reservations } = await supabase
      .from('reservations')
      .select('employe_id, date_rdv, services(duree)')
      .eq('salon_id', salon_id)
      .gte('date_rdv', date + 'T00:00:00')
      .lt('date_rdv',  date + 'T23:59:59')
      .neq('statut', 'annule')

    // Generer les creneaux
    const [hOuv, mOuv] = salon.ouverture.split(':').map(Number)
    const [hFer, mFer] = salon.fermeture.split(':').map(Number)
    const startMin = hOuv * 60 + mOuv
    const endMin   = hFer * 60 + mFer

    // Pause midi
    let pauseStartMin = 0
    let pauseEndMin = 0
    if (salon.pause_active && salon.pause_debut && salon.pause_fin) {
      const [hPD, mPD] = salon.pause_debut.split(':').map(Number)
      const [hPF, mPF] = salon.pause_fin.split(':').map(Number)
      pauseStartMin = hPD * 60 + mPD
      pauseEndMin = hPF * 60 + mPF
    }

    const creneaux: { heure: string; emp_id: number }[] = []
    for (let t = startMin; t + duree <= endMin; t += 30) {
      const tsDebut = t
      const tsFin   = t + duree

      // Verifier si le creneau chevauche la pause
      if (salon.pause_active && pauseEndMin > pauseStartMin) {
        if (tsDebut < pauseEndMin && tsFin > pauseStartMin) continue
      }

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
