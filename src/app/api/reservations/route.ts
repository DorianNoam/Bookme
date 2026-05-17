import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { salon_id, service_id, employe_id, date_rdv, client_nom } = body

    if (!salon_id || !service_id || !date_rdv || !client_nom) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Récupérer l'user si connecté
    let user_id: number | null = null
    const token = req.cookies.get('bookme_token')?.value
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        user_id = decoded.id
      } catch {}
    }

    const supabase = createAdminClient()

    // Récupérer le service
    const { data: service } = await supabase
      .from('services')
      .select('nom, prix')
      .eq('id', service_id)
      .single()

    if (!service) {
      return NextResponse.json({ error: 'Service introuvable' }, { status: 404 })
    }

    // Créer la réservation
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        salon_id,
        user_id,
        service_id,
        employe_id: employe_id || null,
        service_nom:  service.nom,
        service_prix: service.prix,
        client_nom,
        date_rdv,
        statut: 'confirme',
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, reservation: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('reservations')
      .select('*, salons(nom, adresse), services(nom, duree)')
      .eq('user_id', decoded.id)
      .order('date_rdv', { ascending: false })

    if (error) throw error

    return NextResponse.json({ reservations: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
