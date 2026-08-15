import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { token, type, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Donnees manquantes' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caracteres' }, { status: 400 })

    const table = type === 'pro' ? 'pros' : 'users'
    const { data: user } = await supabase
      .from(table)
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single()

    if (!user) return NextResponse.json({ error: 'Lien invalide ou expire' }, { status: 400 })

    const expires = new Date(user.reset_token_expires)
    if (expires < new Date()) return NextResponse.json({ error: 'Ce lien a expire. Veuillez refaire une demande.' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 10)

    await supabase.from(table).update({
      mot_de_passe: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    }).eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
