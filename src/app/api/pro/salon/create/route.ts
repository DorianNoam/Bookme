import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Genere un slug propre a partir du nom, de la ville et de l'id.
// Format : nom-ville-id (ex: "salon-nassiba-alger-37")
function makeSlug(nom: string, ville: string, id: number): string {
  const base = `${nom} ${ville} ${id}`
  return base
    .normalize('NFD')                     // separe les accents des lettres
    .replace(/[\u0300-\u036f]/g, '')      // supprime les accents
    .toLowerCase()
    .replace(/&/g, ' ')                    // enleve les &
    .replace(/[^a-z0-9]+/g, '-')           // tout ce qui n'est pas lettre/chiffre -> tiret
    .replace(/^-+|-+$/g, '')               // pas de tiret au debut/fin
    .replace(/-+/g, '-')                   // pas de doubles tirets
}

export async function POST(req: NextRequest) {
  try {
    // 1. Récupérer et vérifier le token du Pro
    const cookieStore = cookies()
    const token = cookieStore.get('bookme_pro_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Non autorisé.' }, { status: 401 })
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const proId = payload.id as number

    // 2. GARDE-FOU ANTI-DOUBLON : un pro = un seul salon
    const { data: existingSalon } = await supabase
      .from('salons')
      .select('id')
      .eq('pro_id', proId)
      .maybeSingle()

    if (existingSalon) {
      return NextResponse.json({
        success: false,
        error: 'Vous avez deja un etablissement.',
        salonId: existingSalon.id
      }, { status: 409 })
    }

    // 3. Récupérer les données du formulaire
    const { nom, adresse, ville, telephone, type_salon, description } = await req.json()
    if (!nom || !ville || !type_salon) {
      return NextResponse.json({ success: false, error: 'Veuillez remplir les champs obligatoires.' }, { status: 400 })
    }

    // 4. Insérer le salon dans la base de données
    const { data: salon, error } = await supabase
      .from('salons')
      .insert([{
        pro_id: proId,
        nom,
        adresse: adresse || '',
        ville,
        telephone: telephone || '',
        type_salon,
        description: description || '',
        image: '',
        instagram: '',
        ouverture: '09:00',
        fermeture: '19:00',
        jour_off: 5
      }])
      .select()
      .single()

    if (error || !salon) {
      return NextResponse.json({ success: false, error: `Erreur base de données: ${error?.message}` }, { status: 500 })
    }

    // 5. Generer et enregistrer le slug (l'id n'existe qu'apres l'insert)
    const slug = makeSlug(nom, ville, salon.id)
    const { error: slugError } = await supabase
      .from('salons')
      .update({ slug })
      .eq('id', salon.id)

    if (slugError) {
      console.error('Erreur generation slug:', slugError.message)
      // On ne bloque pas : le salon existe, il sera juste accessible via son id
      // en attendant. Mais on log pour le savoir.
    }

    return NextResponse.json({ success: true, salonId: salon.id, slug })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
