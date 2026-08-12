import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { salon_id, service_id, employe_id, date_rdv, client_nom, client_prenom, client_email, client_telephone } = body

    if (!salon_id || !service_id || !date_rdv || !client_nom) {
      return NextResponse.json({ error: 'Donnees manquantes' }, { status: 400 })
    }

    // Recuperer le user_id si le client est connecte
    let user_id: number | null = null
    const token = req.cookies.get('bookme_token')?.value
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload } = await jwtVerify(token, secret)
        user_id = payload.id as number
      } catch {}
    }

    const supabase = createAdminClient()

    // 1. Recuperer le service AVEC les infos de promotion
    const { data: service } = await supabase
      .from('services')
      .select('nom, prix, promo_active, promo_pourcentage, promo_nom')
      .eq('id', service_id)
      .single()

    if (!service) {
      return NextResponse.json({ error: 'Service introuvable' }, { status: 404 })
    }

    // 2. Calculer le prix final et le nom final a enregistrer
    let finalPrice = service.prix
    let finalName = service.nom

    if (service.promo_active && service.promo_pourcentage && service.promo_pourcentage > 0) {
      finalPrice = Math.round(service.prix - (service.prix * service.promo_pourcentage / 100))
      
      // Ajouter le badge promo directement dans le nom du service pour le Dashboard
      if (service.promo_nom) {
        finalName = `${service.nom} (✨ ${service.promo_nom})`
      } else {
        finalName = `${service.nom} (PROMO -${service.promo_pourcentage}%)`
      }
    }

    // 3. Creer la reservation avec les informations remisées
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        salon_id,
        user_id,
        service_id,
        employe_id: employe_id || null,
        service_nom: finalName,
        service_prix: finalPrice,
        client_nom,
        client_prenom: client_prenom || null,
        client_email: client_email || null,
        client_telephone: client_telephone || null,
        date_rdv,
        statut: 'confirme',
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, reservation: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecte' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('reservations')
      .select('*, salons(id, nom, adresse, ville, image, type_salon)')
      .eq('user_id', payload.id)
      .order('date_rdv', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, reservations: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
