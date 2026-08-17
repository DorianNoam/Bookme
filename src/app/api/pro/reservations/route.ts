import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

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

    const { error } = await supabase.from('reservations').insert([{
      salon_id: salon.id,
      employe_id: body.employe_id,
      client_nom: body.client_nom,
      client_email: body.client_email || null,
      client_telephone: body.client_telephone || null,
      service_id: body.service_id || null,
      service_nom: body.service_nom,
      service_prix: body.service_prix ? Number(body.service_prix) : 0,
      date_rdv: body.date_rdv,
      statut: 'confirme'
    }])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
