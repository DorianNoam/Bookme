import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendPasswordReset } from '@/lib/email'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    const table = type === 'pro' ? 'pros' : 'users'
    const { data: user } = await supabase.from(table).select('id, prenom, nom, email').eq('email', email.toLowerCase().trim()).single()

    // On retourne toujours un succes pour ne pas reveler si l'email existe
    if (!user) return NextResponse.json({ success: true })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await supabase.from(table).update({
      reset_token: token,
      reset_token_expires: expires.toISOString(),
    }).eq('id', user.id)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bookmedz.com'
    const resetUrl = `${baseUrl}/reset-password?token=${token}&type=${type || 'client'}`

    await sendPasswordReset({
      email: user.email,
      name: user.prenom || user.nom || 'Utilisateur',
      resetUrl,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
