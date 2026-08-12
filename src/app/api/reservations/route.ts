import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'
import { Resend } from 'resend'
import BookingConfirmation from '@/emails/BookingConfirmation'

// Initialisation de Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { salon_id, service_id, employe_id, date_rdv, client_nom, client_prenom, client_email, client_telephone } = body

    if (!salon_id || !service_id || !date_rdv || !client_nom) {
      return NextResponse.json({ error: 'Donnees manquantes' }, { status: 400 })
    }

    // Récupérer le user_id si le client est connecté
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

    // 1. Récupérer le service AVEC les infos de promotion et le salon
    const [{ data: service }, { data: salon }] = await Promise.all([
      supabase.from('services').select('nom, prix, promo_active, promo_pourcentage, promo_nom').eq('id', service_id).single(),
      supabase.from('salons').select('nom').eq('id', salon_id).single()
    ])

    if (!service) {
      return NextResponse.json({ error: 'Service introuvable' }, { status: 404 })
    }

    // 2. Calculer le prix final et le nom final à enregistrer
    let finalPrice = service.prix
    let finalName = service.nom

    if (service.promo_active && service.promo_pourcentage && service.promo_pourcentage > 0) {
      finalPrice = Math.round(service.prix - (service.prix * service.promo_pourcentage / 100))
      if (service.promo_nom) {
        finalName = `${service.nom} (✨ ${service.promo_nom})`
      } else {
        finalName = `${service.nom} (PROMO -${service.promo_pourcentage}%)`
      }
    }

    // 3. Créer la réservation dans Supabase
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

    // 4. Envoi de l'email de confirmation via Resend
    if (client_email) {
      try {
        const dateObj = new Date(date_rdv)
        const dateFormatted = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        const timeFormatted = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')

        await resend.emails.send({
          from: 'Bookme.dz <onboarding@resend.dev>', // L'adresse de test Resend
          to: [client_email], // Attention: en Sandbox, cet email DOIT être celui de ton compte Resend !
          subject: `Confirmation de votre rendez-vous au ${salon?.nom || 'Salon'}`,
          react: BookingConfirmation({
            clientName: client_prenom ? `${client_prenom} ${client_nom}` : client_nom,
            salonName: salon?.nom || 'votre salon',
            serviceName: finalName,
            date: dateFormatted,
            time: timeFormatted,
            price: finalPrice,
          }),
        })
      } catch (emailErr) {
        // En cas d'erreur Resend, on ne bloque pas la réservation pour l'utilisateur
        console.error("Erreur lors de l'envoi de l'email:", emailErr)
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

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecte' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    
    const body = await req.json()
    const { id, action } = body

    if (action === 'cancel' && id) {
      const supabase = createAdminClient()
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
