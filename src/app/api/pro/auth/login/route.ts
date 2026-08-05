import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email et mot de passe requis.' }, { status: 400 })
    }

    // 1. Chercher le pro dans la base de données
    const { data: pro, error } = await supabase
      .from('pros')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !pro) {
      return NextResponse.json({ success: false, error: 'Identifiants incorrects.' }, { status: 401 })
    }

    // 2. Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, pro.password)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Identifiants incorrects.' }, { status: 401 })
    }

    // 3. Créer le token JWT spécifique aux pros
    const token = await new SignJWT({ id: pro.id, role: 'pro' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

    // 4. Configurer la réponse avec le cookie 'bookme_pro_token'
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'bookme_pro_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    })

    return response
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
