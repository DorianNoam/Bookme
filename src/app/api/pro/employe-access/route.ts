import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    // Verifier que c'est bien un pro (pas un employe)
    const token = req.cookies.get('bookme_pro_token')?.value
    if (!token) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    if (payload.role !== 'pro') {
      return NextResponse.json({ error: 'Seul le proprietaire peut gerer les acces.' }, { status: 403 })
    }

    const proId = payload.id as number
    const { data: salon } = await supabase.from('salons').select('id').eq('pro_id', proId).single()
    if (!salon) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })

    const { action, employe_id, email, password } = await req.json()

    // Activer l'acces agenda pour un employe
    if (action === 'enable_access') {
      if (!employe_id || !email || !password) {
        return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caracteres.' }, { status: 400 })
      }

      // Verifier que l'email n'est pas deja utilise par un pro ou un autre employe
      const { data: existingPro } = await supabase.from('pros').select('id').eq('email', email).single()
      if (existingPro) {
        return NextResponse.json({ error: 'Cet email est deja utilise par un compte pro.' }, { status: 400 })
      }

      const { data: existingEmp } = await supabase
        .from('employes')
        .select('id')
        .eq('email', email)
        .neq('id', employe_id)
        .single()
      if (existingEmp) {
        return NextResponse.json({ error: 'Cet email est deja utilise par un autre collaborateur.' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const { error } = await supabase
        .from('employes')
        .update({ email, password: hashedPassword, acces_agenda: true })
        .eq('id', employe_id)
        .eq('salon_id', salon.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Desactiver l'acces agenda
    if (action === 'disable_access') {
      if (!employe_id) return NextResponse.json({ error: 'ID employe requis.' }, { status: 400 })

      const { error } = await supabase
        .from('employes')
        .update({ email: null, password: null, acces_agenda: false })
        .eq('id', employe_id)
        .eq('salon_id', salon.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
