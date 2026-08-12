import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getProId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('bookme_pro_token')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload.id as number
  } catch {
    return null
  }
}

async function getSalonId(proId: number): Promise<number | null> {
  const { data } = await supabase.from('salons').select('id').eq('pro_id', proId).single()
  return data?.id || null
}

// ══════════════════════════════════════════════════════════════════
// GET
// ══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const proId = await getProId(req)
  if (!proId) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { data: pro } = await supabase.from('pros').select('email').eq('id', proId).single()

  const { data: salon } = await supabase.from('salons').select('*').eq('pro_id', proId).single()
  if (!salon) return NextResponse.json({ error: 'Aucun salon trouve' }, { status: 404 })

  const [servicesRes, employesRes, catalogueRes, ventesPriveesRes] = await Promise.all([
    supabase.from('services').select('*').eq('salon_id', salon.id).order('categorie_service'),
    supabase.from('employes').select('*').eq('salon_id', salon.id).order('nom'),
    supabase.from('catalogue_services').select('*').order('categorie').order('nom'),
    supabase.from('ventes_privees').select('*').eq('salon_id', salon.id).order('created_at', { ascending: false })
  ])

  return NextResponse.json({
    salon,
    pro_email: pro?.email || '',
    services: servicesRes.data || [],
    employes: employesRes.data || [],
    catalogue: catalogueRes.data || [],
    ventes_privees: ventesPriveesRes.data || []
  })
}

// ══════════════════════════════════════════════════════════════════
// PATCH
// ══════════════════════════════════════════════════════════════════

export async function PATCH(req: NextRequest) {
  const proId = await getProId(req)
  if (!proId) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const salonId = await getSalonId(proId)
  if (!salonId) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

  const body = await req.json()
  const { nom, adresse, ville, telephone, description, ouverture, fermeture, jour_off, type_salon, image, seuil_fidelite, pro_email } = body

  // Mettre a jour l'email du pro si fourni
  if (pro_email !== undefined) {
    await supabase.from('pros').update({ email: pro_email }).eq('id', proId)
  }

  const updateData: any = { nom, adresse, ville, telephone, description, ouverture, fermeture, jour_off, type_salon }
  if (image !== undefined) updateData.image = image
  if (seuil_fidelite !== undefined) updateData.seuil_fidelite = parseInt(seuil_fidelite)

  const { error } = await supabase.from('salons').update(updateData).eq('id', salonId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// ══════════════════════════════════════════════════════════════════
// POST
// ══════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const proId = await getProId(req)
  if (!proId) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const salonId = await getSalonId(proId)
  if (!salonId) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

  const body = await req.json()

  if (body.action === 'add_service') {
    const { nom, prix, duree, categorie_service } = body
    if (!nom || !prix || !duree) return NextResponse.json({ error: 'Nom, prix et duree requis' }, { status: 400 })
    const { data, error } = await supabase.from('services').insert({ salon_id: salonId, nom, prix: parseInt(prix), duree: parseInt(duree), categorie_service: categorie_service || 'General' }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, service: data })
  }

  if (body.action === 'update_service') {
    const { id, prix, duree, categorie_service } = body
    if (!id || !prix || !duree) return NextResponse.json({ error: 'ID, prix et duree requis' }, { status: 400 })
    const { data, error } = await supabase.from('services').update({ prix: parseInt(prix), duree: parseInt(duree), categorie_service: categorie_service || undefined }).eq('id', id).eq('salon_id', salonId).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, service: data })
  }

  if (body.action === 'set_promo') {
    const { id, promo_pourcentage, promo_active, promo_debut, promo_fin } = body
    const { error } = await supabase.from('services').update({ promo_pourcentage: promo_pourcentage || null, promo_active: promo_active || false, promo_debut: promo_debut || null, promo_fin: promo_fin || null }).eq('id', id).eq('salon_id', salonId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'add_vente_privee') {
    const { nom, prix, duree, description } = body
    if (!nom || !prix || !duree) return NextResponse.json({ error: 'Nom, prix et duree requis' }, { status: 400 })
    const { data, error } = await supabase.from('ventes_privees').insert({ salon_id: salonId, nom, prix: parseInt(prix), duree: parseInt(duree), description }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, vente_privee: data })
  }

  if (body.action === 'update_vente_privee') {
    const { id, nom, prix, duree, description } = body
    if (!id || !nom || !prix || !duree) return NextResponse.json({ error: 'ID, nom, prix et duree requis' }, { status: 400 })
    const { data, error } = await supabase.from('ventes_privees').update({ nom, prix: parseInt(prix), duree: parseInt(duree), description }).eq('id', id).eq('salon_id', salonId).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, vente_privee: data })
  }

  if (body.action === 'add_employe') {
    const { nom } = body
    if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    const { data, error } = await supabase.from('employes').insert({ salon_id: salonId, nom }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, employe: data })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}

// ══════════════════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════════════════

export async function DELETE(req: NextRequest) {
  const proId = await getProId(req)
  if (!proId) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const salonId = await getSalonId(proId)
  if (!salonId) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

  const body = await req.json()

  if (body.action === 'delete_service') {
    const { error } = await supabase.from('services').delete().eq('id', body.id).eq('salon_id', salonId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'delete_vente_privee') {
    const { error } = await supabase.from('ventes_privees').delete().eq('id', body.id).eq('salon_id', salonId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'delete_employe') {
    const { error } = await supabase.from('employes').delete().eq('id', body.id).eq('salon_id', salonId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
