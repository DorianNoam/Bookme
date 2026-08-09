import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  // 1. Vérification de la session client
  const token = req.cookies.get('bookme_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Vous devez être connecté pour laisser un avis' }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.id as number

    const body = await req.json()
    const { salon_id, commentaire, note, note_accueil, note_proprete, note_ambiance, note_qualite } = body

    if (!salon_id || !note) {
      return NextResponse.json({ error: 'Données incomplètes (salon_id et note requis)' }, { status: 400 })
    }

    // 2. Vérification de la légitimité (le client a-t-il consommé dans ce salon ?)
    const { data: pastReservations, error: resaError } = await supabase
      .from('reservations')
      .select('id')
      .eq('user_id', userId)
      .eq('salon_id', salon_id)
      .eq('statut', 'termine')
      .limit(1)

    if (resaError || !pastReservations || pastReservations.length === 0) {
      return NextResponse.json(
        { error: 'Vous devez avoir effectué au moins un rendez-vous dans ce salon pour laisser un avis.' },
        { status: 403 }
      )
    }

    // 3. Insertion de l'avis dans la base de données
    const { error: insertError } = await supabase
      .from('avis')
      .insert({
        user_id: userId,
        salon_id,
        commentaire,
        note,
        note_accueil,
        note_proprete,
        note_ambiance,
        note_qualite
      })

    if (insertError) throw insertError

    return NextResponse.json({ success: true, message: 'Avis publié avec succès' })
    
  } catch (error) {
    console.error('Erreur POST /api/avis:', error)
    return NextResponse.json({ error: 'Erreur lors de la publication de l\'avis' }, { status: 500 })
  }
}
