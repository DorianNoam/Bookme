import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) {
      return NextResponse.json({ logged: false }, { status: 200 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.id as number

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: user } = await supabase
      .from('users')
      .select('id, prenom, nom, email, telephone')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ logged: false }, { status: 200 })
    }

    return NextResponse.json({
      logged: true,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
      }
    })
  } catch {
    return NextResponse.json({ logged: false }, { status: 200 })
  }
}
