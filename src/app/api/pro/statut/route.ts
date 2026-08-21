import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Renvoie l'id du salon du PRO connecte.
// Les employes ne peuvent pas gerer le statut du salon (retourne null).
async function getOwnerSalonId(): Promise<number | null> {
  const token = cookies().get('bookme_pro_token')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const role = (payload.role as string) || 'pro'
    if (role === 'employe') return null
    const proId = payload.id as number
    if (!proId) return null
    const supabase = db()
    const { data } = await supabase.from('salons').select('id').eq('pro_id', proId).single()
    return data?.id ?? null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const salonId = await getOwnerSalonId()
  if (!salonId) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const supabase = db()
  const action = body?.action

  // --- Definir / effacer la date d'ouverture ---
  if (action === 'ouverture') {
    const date = body.date ? String(body.date) : null
    const { error } = await supabase
      .from('salons')
      .update({ date_ouverture: date })
      .eq('id', salonId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // --- Ajouter une periode de fermeture ---
  if (action === 'add_fermeture') {
    const date_debut = body.date_debut ? String(body.date_debut) : null
    const date_fin = body.date_fin ? String(body.date_fin) : null
    if (!date_debut || !date_fin) {
      return NextResponse.json({ error: 'Dates requises' }, { status: 400 })
    }
    if (date_fin < date_debut) {
      return NextResponse.json({ error: 'Date de fin avant la date de debut' }, { status: 400 })
    }
    const motif = body.motif ? String(body.motif).slice(0, 200) : null
    const { error } = await supabase
      .from('salon_fermetures')
      .insert({ salon_id: salonId, date_debut, date_fin, motif })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // --- Supprimer une periode de fermeture (uniquement celles du salon) ---
  if (action === 'delete_fermeture') {
    const id = Number(body.id)
    if (!id) return NextResponse.json({ error: 'Id requis' }, { status: 400 })
    const { error } = await supabase
      .from('salon_fermetures')
      .delete()
      .eq('id', id)
      .eq('salon_id', salonId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
