import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Récupérer l'ID de l'utilisateur connecté via son token
async function getUserIdFromToken() {
  const token = cookies().get('bookme_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    return payload.id as number
  } catch {
    return null
  }
}

// Vérifier si un salon est en favori
export async function GET(req: NextRequest) {
  const salonId = req.nextUrl.searchParams.get('salon_id')
  if (!salonId) return NextResponse.json({ error: 'Salon ID manquant' }, { status: 400 })

  const userId = await getUserIdFromToken()
  if (!userId) return NextResponse.json({ isFavorite: false }) // Non connecté = pas de favori

  const { data, error } = await supabase
    .from('favoris')
    .select('id')
    .eq('user_id', userId)
    .eq('salon_id', salonId)
    .single()

  return NextResponse.json({ isFavorite: !!data })
}

// Ajouter ou retirer un favori (Toggle)
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromToken()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { salon_id } = body

  if (!salon_id) return NextResponse.json({ error: 'Salon ID manquant' }, { status: 400 })

  // On vérifie s'il est déjà en favori
  const { data: existing } = await supabase
    .from('favoris')
    .select('id')
    .eq('user_id', userId)
    .eq('salon_id', salon_id)
    .single()

  if (existing) {
    // S'il existe, on le retire (Toggle Off)
    await supabase.from('favoris').delete().eq('id', existing.id)
    return NextResponse.json({ success: true, isFavorite: false })
  } else {
    // S'il n'existe pas, on l'ajoute (Toggle On)
    await supabase.from('favoris').insert([{ user_id: userId, salon_id: salon_id }])
    return NextResponse.json({ success: true, isFavorite: true })
  }
}
