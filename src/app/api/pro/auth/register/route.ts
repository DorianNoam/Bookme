import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { prenom, nom, email, password, telephone } = await req.json()

    if (!prenom || !nom || !email || !password || !telephone) {
      return NextResponse.json({ success: false, error: 'Tous les champs sont requis.' }, { status: 400 })
    }

    // 1. Vérifier si l'email existe déjà
    const { data: existingPro } = await supabase
      .from('pros')
      .select('id')
      .eq('email', email)
      .single()

    if (existingPro) {
      return NextResponse.json({ success: false, error: 'Cet email est déjà utilisé.' }, { status: 400 })
    }

    // 2. Hacher le mot de passe avec bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Insérer le nouveau professionnel (a_paye: 1 pour contourner temporairement un système de paiement)
    const { data: newPro, error } = await supabase
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

    if (error || !newPro) {
      return NextResponse.json({ success: false, error: 'Erreur lors de la création du compte.' }, { status: 500 })
    }

    // 4. Créer le token JWT
    const token = await new SignJWT({ id: newPro.id, role: 'pro' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

    // 5. Connecter l'utilisateur via cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'bookme_pro_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
