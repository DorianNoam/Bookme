import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

// 1. Récupérer toutes les réservations du salon connecté
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_pro_token')?.value
    if (!token) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const proId = payload.id as number

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: salon } = await supabase.from('salons').select('id').eq('pro_id', proId).single()
    if (!salon) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('salon_id', salon.id)
      .neq('statut', 'annule') // On exclut les annulés de l'affichage
      .order('date_rdv', { ascending: true })

    if (error) throw error
    return NextResponse.json({ reservations: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// 2. Ajouter un rendez-vous manuel (sans user_id)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_pro_token')?.value
    if (!token) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const proId = payload.id as number

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: salon } = await supabase.from('salons').select('id').eq('pro_id', proId).single()
    if (!salon) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

    const body = await req.json()
    const { employe_id, service_nom, service_prix, client_nom, date_rdv } = body

    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        salon_id: salon.id,
        employe_id,
        service_nom,
        service_prix: Number(service_prix),
        client_nom,
        date_rdv,
        statut: 'confirme'
      }])
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
