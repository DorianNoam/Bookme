import { sendAdminNewProNotification, sendProWelcome } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// --- GENERATION DE SLUG ---
// Produit une URL lisible du type "salon-yasmina-42".
// L'identifiant est ajoute a la fin pour garantir l'unicite meme si
// deux salons portent le meme nom.
function genererSlug(nom: string, id: number): string {
  const base = (nom || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')                  // decompose les caracteres accentues
    .replace(/[\u0300-\u036f]/g, '')   // retire les accents
    .replace(/[^a-z0-9]+/g, '-')       // tout le reste devient un tiret
    .replace(/^-+|-+$/g, '')           // nettoie les tirets de debut et de fin

  return `${base || 'salon'}-${id}`
}

// --- VALIDATION DU TELEPHONE ---
// Algerie en priorite : 05x / 06x / 07x sur 10 chiffres,
// avec ou sans indicatif +213 / 00213.
// On accepte aussi les formats internationaux courants (France, Tunisie, Maroc)
// pour les cas particuliers.
function telephoneValide(tel: string): boolean {
  const nettoye = (tel || '').replace(/[\s.\-()]/g, '')

  // Format algerien local : 0555123456
  if (/^0[5-7]\d{8}$/.test(nettoye)) return true

  // Format algerien international : +213555123456 ou 00213555123456
  if (/^(\+213|00213)[5-7]\d{8}$/.test(nettoye)) return true

  // Autres pays (France, Tunisie, Maroc) : format international generique
  if (/^(\+|00)(33|216|212)\d{8,9}$/.test(nettoye)) return true

  return false
}

export async function POST(req: NextRequest) {
  try {
    const {
      prenom, nom, email, password, telephone,
      salon_nom, type_salon, ville, adresse, instagram,
      latitude: latClient, longitude: lngClient
    } = await req.json()

    if (!prenom || !nom || !email || !password || !telephone) {
      return NextResponse.json({ success: false, error: 'Tous les champs personnels sont requis.' }, { status: 400 })
    }

    if (!telephoneValide(telephone)) {
      return NextResponse.json({
        success: false,
        error: 'Numero de telephone invalide. Format attendu : 0555 12 34 56.'
      }, { status: 400 })
    }

    // L'adresse est desormais obligatoire cote serveur, pas seulement
    // dans le formulaire. Sans adresse, le salon n'apparait ni sur la carte
    // ni dans la recherche par ville : il est invisible pour les clientes.
    if (!salon_nom || !ville || !adresse || !String(adresse).trim()) {
      return NextResponse.json({
        success: false,
        error: "Le nom du salon, la ville et l'adresse sont requis."
      }, { status: 400 })
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
      console.error('Erreur creation pro:', proError?.message)
      return NextResponse.json({ success: false, error: 'Erreur lors de la creation du compte.' }, { status: 500 })
    }

    // --- COORDONNEES GPS ---
    // Priorite absolue aux coordonnees fournies par le client : elles viennent
    // de Google Places Autocomplete et sont beaucoup plus fiables.
    // On ne bascule sur Nominatim que si le client n'a rien envoye.
    let latitude: number | null = null
    let longitude: number | null = null

    const latNum = Number(latClient)
    const lngNum = Number(lngClient)

    if (Number.isFinite(latNum) && Number.isFinite(lngNum) && latNum !== 0 && lngNum !== 0) {
      latitude = latNum
      longitude = lngNum
    } else {
      try {
        const queryStr = `${adresse}, ${ville}, Algérie`
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}`,
          { headers: { 'User-Agent': 'Bookmedz/1.0' } }
        )
        const geoData = await geoRes.json()

        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat)
          longitude = parseFloat(geoData[0].lon)
        }
        // Volontairement PAS de repli sur le centre-ville.
        // Placer un salon a plusieurs kilometres de sa vraie position est pire
        // que de ne pas l'afficher sur la carte : la cliente se deplace pour rien.
        // Le pro pourra corriger son adresse dans ses parametres.
      } catch (err) {
        console.error('Erreur de geocodage inscription:', err)
      }
    }

    const salonData: any = {
      pro_id: newPro.id,
      nom: String(salon_nom).trim(),
      type_salon: type_salon || 'Coiffure & soin cheveux',
      ville,
      adresse: String(adresse).trim(),
      telephone,
      instagram: instagram || '',
      description: '',
      image: '',
      ouverture: '09:00',
      fermeture: '19:00',
      jour_off: 5
    }

    if (latitude !== null && longitude !== null) {
      salonData.latitude = latitude
      salonData.longitude = longitude
    }

    // On recupere l'id du salon cree pour pouvoir generer son slug.
    const { data: newSalon, error: salonError } = await supabase
      .from('salons')
      .insert([salonData])
      .select('id')
      .single()

    // --- ROLLBACK MANUEL : pas de pro orphelin ---
    // Si la creation du salon echoue, on supprime le pro qu'on vient de creer
    // et on renvoie une vraie erreur, au lieu de laisser un compte sans salon.
    if (salonError || !newSalon) {
      console.error('Erreur creation salon:', salonError?.message)
      await supabase.from('pros').delete().eq('id', newPro.id)
      return NextResponse.json({
        success: false,
        error: "Erreur lors de la creation de votre etablissement. Veuillez reessayer."
      }, { status: 500 })
    }

    // --- SLUG ---
    // Le slug contient l'id, il ne peut donc etre calcule qu'apres l'insertion.
    // Un echec ici n'est pas bloquant : la page salon sait encore repondre sur
    // l'ancienne URL numerique, et le trigger SQL sert de second filet.
    const slug = genererSlug(salonData.nom, newSalon.id)
    const { error: slugError } = await supabase
      .from('salons')
      .update({ slug })
      .eq('id', newSalon.id)

    if (slugError) {
      console.error('Erreur generation slug:', slugError.message)
    }

    if (process.env.RESEND_API_KEY) {
      const finDate = new Date()
      finDate.setFullYear(finDate.getFullYear() + 1)

      sendProWelcome({
        proEmail: email,
        proName: prenom || nom,
        salonName: salon_nom,
        abonnementFin: finDate.toISOString().split('T')[0],
      }).catch(err => console.error('Email bienvenue pro echoue:', err))

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
  } catch (err: any) {
    console.error('Erreur inscription pro:', err?.message)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
