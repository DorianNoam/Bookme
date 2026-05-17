import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const supabase = createAdminClient()

    // Vérifier que la réservation appartient bien à l'utilisateur
    const { data: resa } = await supabase
      .from('reservations')
      .select('user_id, date_rdv')
      .eq('id', params.id)
      .single()

    if (!resa || resa.user_id !== decoded.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { error } = await supabase
      .from('reservations')
      .update({ statut: 'annule' })
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
