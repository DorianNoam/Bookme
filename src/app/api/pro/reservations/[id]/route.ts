import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('bookme_pro_token')?.value
    if (!token) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const proId = payload.id as number

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: salon } = await supabase.from('salons').select('id').eq('pro_id', proId).single()
    if (!salon) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

    const { data: resa } = await supabase.from('reservations').select('salon_id').eq('id', params.id).single()
    if (!resa || resa.salon_id !== salon.id) {
      return NextResponse.json({ error: 'Reservation introuvable' }, { status: 403 })
    }

    // Récupérer les nouvelles données du frontend (s'il y en a)
    const body = await req.json().catch(() => ({}));
    
    const updateData: any = {};
    if (body.statut) updateData.statut = body.statut;
    if (body.date_rdv) updateData.date_rdv = body.date_rdv;
    if (body.employe_id) updateData.employe_id = body.employe_id;

    // Si aucune donnée n'est passée, on garde ton comportement d'annulation par défaut
    if (Object.keys(updateData).length === 0) updateData.statut = 'annule';

    const { error } = await supabase.from('reservations').update(updateData).eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
