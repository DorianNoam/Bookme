import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecte' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.id as number

    const { prenom, nom, email, telephone } = await req.json()

    if (!prenom || !nom || !email || !telephone) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Cet email est deja utilise par un autre compte.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .update({ prenom, nom, email, telephone })
      .eq('id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
