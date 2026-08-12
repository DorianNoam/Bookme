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

    // 1. Chercher d'abord dans les pros (proprietaires)
    const { data: pro } = await supabase
      .from('pros')
      .select('*')
      .eq('email', email)
      .single()

    if (pro) {
      const match = await bcrypt.compare(password, pro.password)
      if (!match) {
        return NextResponse.json({ success: false, error: 'Identifiants incorrects.' }, { status: 401 })
      }

      const token = await new SignJWT({ id: pro.id, role: 'pro' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

      const response = NextResponse.json({ success: true, role: 'pro' })
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
    }

    // 2. Sinon chercher dans les employes avec acces agenda
    const { data: employe } = await supabase
      .from('employes')
      .select('*')
      .eq('email', email)
      .eq('acces_agenda', true)
      .single()

    if (employe) {
      const match = await bcrypt.compare(password, employe.password)
      if (!match) {
        return NextResponse.json({ success: false, error: 'Identifiants incorrects.' }, { status: 401 })
      }

      // Le token employe contient le salon_id et le role
      const token = await new SignJWT({
        id: employe.id,
        role: 'employe',
        salon_id: employe.salon_id,
        nom: employe.nom
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

      const response = NextResponse.json({ success: true, role: 'employe' })
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
    }

    // 3. Aucun compte trouve
    return NextResponse.json({ success: false, error: 'Identifiants incorrects.' }, { status: 401 })

  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
