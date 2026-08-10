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

    // Verifier que la reservation appartient au salon du pro
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('pro_id', proId)
      .single()

    if (!salon) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

    const { data: resa } = await supabase
      .from('reservations')
      .select('salon_id')
      .eq('id', params.id)
      .single()

    if (!resa || resa.salon_id !== salon.id) {
      return NextResponse.json({ error: 'Reservation introuvable' }, { status: 403 })
    }

    // 1. Lecture des nouvelles donnees envoyees par le frontend
    const body = await req.json().catch(() => ({}))

    // 2. Preparation de la mise a jour dynamique
    const updateData: any = {}
    
    if (body.new_date_rdv) updateData.date_rdv = body.new_date_rdv
    if (body.employe_id) updateData.employe_id = body.employe_id
    if (body.statut) updateData.statut = body.statut

    // 3. Securite : Si le frontend n'envoie rien de nouveau, on garde ton ancien systeme d'annulation
    if (Object.keys(updateData).length === 0) {
      updateData.statut = 'annule'
    }

    // 4. Mise a jour dans Supabase
    const { error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
