import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  try {
    const token = cookies().get('pro_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecte' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    const { data: pro } = await supabase
      .from('pros')
      .select('abonnement_fin, abonnement_actif')
      .eq('id', payload.id)
      .single()

    if (!pro) return NextResponse.json({ error: 'Pro introuvable' }, { status: 404 })

    const now = new Date()
    const fin = new Date(pro.abonnement_fin)
    const expire = !pro.abonnement_actif || fin < now

    return NextResponse.json({
      expire,
      abonnement_fin: pro.abonnement_fin,
      abonnement_actif: pro.abonnement_actif,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
