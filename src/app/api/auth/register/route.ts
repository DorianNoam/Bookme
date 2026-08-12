import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { prenom, nom, email, telephone, password } = await req.json()

    if (!prenom || !nom || !email || !telephone || !password) {
      return NextResponse.json({ success: false, error: 'Tous les champs sont requis.' }, { status: 400 })
    }

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single()
    if (existing) {
      return NextResponse.json({ success: false, error: 'Cet email est deja utilise.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { error } = await supabase
      .from('users')
      .insert([{ prenom, nom, email, telephone, password: hashedPassword }])

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
