import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

// Fonction utilitaire pour authentifier le pro et récupérer son salon
async function getAuthAndSalon(req: NextRequest) {
  const token = req.cookies.get('bookme_pro_token')?.value
  if (!token) throw new Error('Non autorise')

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const { payload } = await jwtVerify(token, secret)
  const proId = payload.id as number

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select('*')
    .eq('pro_id', proId)
    .single()

  if (salonError || !salon) throw new Error('Salon introuvable')

  return { supabase, salon, proId }
}

export async function GET(req: NextRequest) {
  try {
    const { supabase, salon } = await getAuthAndSalon(req)

    // Récupération de toutes les données du salon
    const [servicesRes, ventesRes, employesRes, catalogueRes] = await Promise.all([
      supabase.from('services').select('*').eq('salon_id', salon.id).order('categorie_service').order('nom'),
      supabase.from('ventes_privees').select('*').eq('salon_id', salon.id).order('nom'),
      supabase.from('employes').select('*').eq('salon_id', salon.id).order('nom'),
      supabase.from('catalogue_services').select('*').order('categorie').order('nom')
    ])

    // Mapping pour s'assurer que le frontend reçoit bien "promo_fin" à partir de la colonne "promo_date_fin" de Supabase
    const servicesMapped = servicesRes.data?.map(s => ({
      ...s,
      promo_fin: s.promo_date_fin || null,
      promo_debut: null
    })) || []

    return NextResponse.json({
      salon,
      services: servicesMapped,
      ventes_privees: ventesRes.data || [],
      employes: employesRes.data || [],
      catalogue: catalogueRes.data || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, salon } = await getAuthAndSalon(req)
    const body = await req.json()

    const { error } = await supabase
      .from('salons')
      .update(body)
      .eq('id', salon.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, salon } = await getAuthAndSalon(req)
    const body = await req.json()
    const { action } = body

    // === GESTION DES PRESTATIONS ===
    if (action === 'add_service') {
      const { data, error } = await supabase.from('services').insert([{ ...body, action: undefined, salon_id: salon.id }]).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, service: data })
    }
    
    if (action === 'update_service') {
      const { id, prix, duree, categorie_service } = body
      const { data, error } = await supabase.from('services').update({ prix, duree, categorie_service }).eq('id', id).eq('salon_id', salon.id).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, service: data })
    }
    
    if (action === 'set_promo') {
      const { id, promo_pourcentage, promo_active, promo_nom, promo_fin } = body
      
      const { data, error } = await supabase
        .from('services')
        .update({ 
          promo_pourcentage, 
          promo_active,
          promo_nom: promo_nom || null,
          promo_date_fin: promo_fin || null // Enregistrement de la date de fin dans Supabase
        })
        .eq('id', id)
        .eq('salon_id', salon.id)
        .select()
        .single()
        
      if (error) throw error
      return NextResponse.json({ success: true, service: data })
    }
    
    // === GESTION DES VENTES PRIVÉES ===
    if (action === 'add_vente_privee') {
      const { data, error } = await supabase.from('ventes_privees').insert([{ ...body, action: undefined, salon_id: salon.id }]).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, vente_privee: data })
    }
    
    if (action === 'update_vente_privee') {
      const { id, nom, prix, duree, description } = body
      const { data, error } = await supabase.from('ventes_privees').update({ nom, prix, duree, description }).eq('id', id).eq('salon_id', salon.id).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, vente_privee: data })
    }
    
    // === GESTION DES EMPLOYÉS ===
    if (action === 'add_employe') {
      const { data, error } = await supabase.from('employes').insert([{ nom: body.nom, salon_id: salon.id }]).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, employe: data })
    }

    throw new Error('Action inconnue')
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { supabase, salon } = await getAuthAndSalon(req)
    const body = await req.json()
    const { action, id } = body

    if (action === 'delete_service') {
      const { error } = await supabase.from('services').delete().eq('id', id).eq('salon_id', salon.id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }
    if (action === 'delete_vente_privee') {
      const { error } = await supabase.from('ventes_privees').delete().eq('id', id).eq('salon_id', salon.id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }
    if (action === 'delete_employe') {
      const { error } = await supabase.from('employes').delete().eq('id', id).eq('salon_id', salon.id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    throw new Error('Action inconnue')
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
