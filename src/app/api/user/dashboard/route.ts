import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getUserId(): Promise<number | null> {
  const token = cookies().get('bookme_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    return payload.id as number
  } catch {
    return null
  }
}

// ── GET : Recuperer toutes les donnees du dashboard ──

export async function GET(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  try {
    const { data: user } = await supabase
      .from('users')
      .select('prenom, nom, email, telephone')
      .eq('id', userId)
      .single()

    const { data: reservations } = await supabase
      .from('reservations')
      .select('*, salons(id, nom, ville, image, type_salon)')
      .eq('user_id', userId)
      .order('date_rdv', { ascending: false })

    const { data: favoris } = await supabase
      .from('favoris')
      .select('salons(id, nom, image, type_salon, ville)')
      .eq('user_id', userId)

    const cleanFavoris = favoris?.map(f => f.salons).filter(Boolean) || []

    return NextResponse.json({ success: true, user, reservations: reservations || [], favoris: cleanFavoris })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── PATCH : Modifier les infos du profil ──

export async function PATCH(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  try {
    const body = await req.json()
    const { prenom, nom, telephone } = body

    if (!prenom || !nom) {
      return NextResponse.json({ error: 'Prenom et nom requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .update({ prenom, nom, telephone: telephone || '' })
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── DELETE : Supprimer le compte ──

export async function DELETE(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  try {
    // Supprimer les favoris
    await supabase.from('favoris').delete().eq('user_id', userId)

    // Supprimer les avis
    await supabase.from('avis').delete().eq('user_id', userId)

    // Dissocier les reservations (garder l historique pour le pro)
    await supabase.from('reservations').update({ user_id: null }).eq('user_id', userId)

    // Supprimer le user
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) throw error

    // Supprimer le cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('bookme_token')
    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
