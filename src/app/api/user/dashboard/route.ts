import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const token = cookies().get('bookme_token')?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    const userId = payload.id as number

    // 1. Infos utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('prenom, nom, email, telephone')
      .eq('id', userId)
      .single()

    // 2. Réservations (avec les infos du salon)
    const { data: reservations } = await supabase
      .from('reservations')
      .select('*, salons(nom, ville, image)')
      .eq('user_id', userId)
      .order('date_rdv', { ascending: false })

    // 3. Favoris (avec les infos du salon)
    const { data: favoris } = await supabase
      .from('favoris')
      .select('salons(id, nom, image, type_salon, ville)')
      .eq('user_id', userId)

    // Nettoyage de la structure des favoris pour le frontend
    const cleanFavoris = favoris?.map(f => f.salons).filter(Boolean) || []

    return NextResponse.json({ success: true, user, reservations: reservations || [], favoris: cleanFavoris })
  } catch (err) {
    return NextResponse.json({ error: 'Session invalide ou expirée' }, { status: 401 })
  }
}
