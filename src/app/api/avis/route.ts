import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { salon_id, note, commentaire, note_accueil, note_proprete, note_ambiance, note_qualite } = await req.json()

    const supabase = createAdminClient()

    // Vérifier que l'user a bien eu un RDV dans ce salon
    const { data: resa } = await supabase
      .from('reservations')
      .select('id')
      .eq('salon_id', salon_id)
      .eq('user_id', decoded.id)
      .eq('statut', 'termine')
      .limit(1)
      .single()

    if (!resa) {
      return NextResponse.json({ error: 'Vous devez avoir eu un RDV pour noter' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('avis')
      .insert({
        user_id: decoded.id,
        salon_id,
        note,
        commentaire,
        note_accueil:  note_accueil  || 5,
        note_proprete: note_proprete || 5,
        note_ambiance: note_ambiance || 5,
        note_qualite:  note_qualite  || 5,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, avis: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
