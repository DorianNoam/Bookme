import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import { sendBookingConfirmation, sendProNotification } from '@/lib/email'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { salon_id, service_id, employe_id, date_rdv, client_nom, client_prenom, client_email, client_telephone } = body

    if (!salon_id || !service_id || !date_rdv || !client_nom) {
      return NextResponse.json({ error: 'Donnees manquantes' }, { status: 400 })
    }

    let user_id: number | null = null
    const token = req.cookies.get('bookme_token')?.value
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload } = await jwtVerify(token, secret)
        user_id = payload.id as number
      } catch {}
    }

    // 1. Recuperer le service, le salon ET l'email du pro
    const [{ data: service }, { data: salon }] = await Promise.all([
      supabase.from('services').select('nom, prix, promo_active, promo_pourcentage').eq('id', service_id).single(),
      supabase.from('salons').select('nom, pro_id').eq('id', salon_id).single()
    ])

    if (!service) {
      return NextResponse.json({ error: 'Service introuvable' }, { status: 404 })
    }

    // Recuperer l'email du pro
    let proEmail: string | null = null
    if (salon?.pro_id) {
      const { data: pro } = await supabase.from('pros').select('email').eq('id', salon.pro_id).single()
      proEmail = pro?.email || null
    }

    // 2. Calculer le prix final
    let finalPrice = service.prix
    let finalName = service.nom

    if (service.promo_active && service.promo_pourcentage && service.promo_pourcentage > 0) {
      finalPrice = Math.round(service.prix - (service.prix * service.promo_pourcentage / 100))
      finalName = `${service.nom} (PROMO -${service.promo_pourcentage}%)`
    }

    // 3. Creer la reservation
    const { data: reservation, error } = await supabase
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

    // 4. Envoyer les emails (sans bloquer la reservation)
    if (process.env.RESEND_API_KEY) {
      const dateObj = new Date(date_rdv)
      const dateFormatted = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const timeFormatted = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
      const fullClientName = client_prenom ? `${client_prenom} ${client_nom}` : client_nom

      // Email au client
      if (client_email) {
        sendBookingConfirmation({
          clientEmail: client_email,
          clientName: fullClientName,
          salonName: salon?.nom || 'votre salon',
          serviceName: finalName,
          date: dateFormatted,
          time: timeFormatted,
          price: finalPrice,
        }).catch(err => console.error('Email client echoue:', err))
      }

      // Email au pro
      if (proEmail) {
        sendProNotification({
          proEmail,
          salonName: salon?.nom || 'votre salon',
          clientName: fullClientName,
          clientPhone: client_telephone || '',
          serviceName: finalName,
          date: dateFormatted,
          time: timeFormatted,
          price: finalPrice,
        }).catch(err => console.error('Email pro echoue:', err))
      }
    }

    return NextResponse.json({ success: true, reservation }, { status: 201 })
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

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecte' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    const body = await req.json()
    const { id, action } = body

    if (action === 'cancel' && id) {
      const { error } = await supabase
        .from('reservations')
        .update({ statut: 'annule' })
        .eq('id', id)
        .eq('user_id', payload.id)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
