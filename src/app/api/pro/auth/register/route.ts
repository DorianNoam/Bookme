import { sendAdminNewProNotification, sendProWelcome } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const {
      prenom, nom, email, password, telephone,
      salon_nom, type_salon, ville, adresse, instagram
    } = await req.json()

    if (!prenom || !nom || !email || !password || !telephone) {
      return NextResponse.json({ success: false, error: 'Tous les champs personnels sont requis.' }, { status: 400 })
    }

    if (!salon_nom || !ville) {
      return NextResponse.json({ success: false, error: 'Le nom du salon et la ville sont requis.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Le mot de passe doit contenir au moins 6 caracteres.' }, { status: 400 })
    }

    const { data: existingPro } = await supabase
      .from('pros')
      .select('id')
      .eq('email', email)
      .single()

    if (existingPro) {
      return NextResponse.json({ success: false, error: 'Cet email est deja utilise.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: newPro, error: proError } = await supabase
      .from('pros')
      .insert([{
        prenom,
        nom,
        email,
        password: hashedPassword,
        telephone,
        a_paye: 1
      }])
      .select()
      .single()

    if (proError || !newPro) {
      return NextResponse.json({ success: false, error: 'Erreur lors de la creation du compte.' }, { status: 500 })
    }

    // --- NOUVEAU : GEOCODAGE AUTOMATIQUE OPENSTREETMAP ---
    let latitude = null
    let longitude = null

    if (adresse && ville) {
      try {
        const queryStr = `${adresse}, ${ville}, Algérie`
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}`, {
          headers: { 'User-Agent': 'Bookmedz/1.0' }
        })
        const geoData = await geoRes.json()
        
        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat)
          longitude = parseFloat(geoData[0].lon)
        }
      } catch (err) {
        console.error('Erreur de géocodage inscription:', err)
      }
    }

    const salonData: any = {
      pro_id: newPro.id,
      nom: salon_nom,
      type_salon: type_salon || 'Coiffure',
      ville,
      adresse: adresse || '',
      telephone,
      instagram: instagram || '',
      description: '',
      image: '',
      ouverture: '09:00',
      fermeture: '19:00',
      jour_off: 5
    }

    // NOUVEAU : Ajout des coordonnées si elles ont été trouvées
    if (latitude && longitude) {
      salonData.latitude = latitude
      salonData.longitude = longitude
    }

    const { error: salonError } = await supabase
      .from('salons')
      .insert([salonData])

    if (salonError) {
      console.error('Erreur creation salon:', salonError.message)
    }

    // Email de bienvenue ET notification Admin
    if (process.env.RESEND_API_KEY) {
      const finDate = new Date()
      finDate.setFullYear(finDate.getFullYear() + 1)
      
      // 1. Envoi au professionnel
      sendProWelcome({
        proEmail: email,
        proName: prenom || nom,
        salonName: salon_nom,
        abonnementFin: finDate.toISOString().split('T')[0],
      }).catch(err => console.error('Email bienvenue pro echoue:', err))

      // 2. Envoi a l'administrateur
      sendAdminNewProNotification({
        proName: `${prenom} ${nom}`,
        proEmail: email,
        proPhone: telephone,
        salonName: salon_nom,
      }).catch(err => console.error('Email alerte admin echoue:', err))
    }

    const token = await new SignJWT({ id: newPro.id, role: 'pro' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'bookme_pro_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    })

    return response
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
