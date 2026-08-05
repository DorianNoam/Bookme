import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    // 2. Récupérer les données du formulaire
    const { nom, adresse, ville, telephone, type_salon, description } = await req.json()

    if (!nom || !ville || !type_salon) {
      return NextResponse.json({ success: false, error: 'Veuillez remplir les champs obligatoires.' }, { status: 400 })
    }

    // 3. Insérer le salon dans la base de données
    // On met des horaires par défaut pour simplifier, le pro pourra les modifier plus tard
    const { data: salon, error } = await supabase
      .from('salons')
      .insert([{
        pro_id: proId,
        nom,
        adresse,
        ville, // Champ texte libre pour couvrir toute l'Algérie
        telephone,
        type_salon,
        description,
        ouverture: '09:00',
        fermeture: '19:00',
        jour_off: 5 // Vendredi par défaut
      }])
      .select()
      .single()

    if (error || !salon) {
      return NextResponse.json({ success: false, error: `Erreur base de données: ${error?.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, salonId: salon.id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
