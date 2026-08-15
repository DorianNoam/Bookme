import { NextRequest, NextResponse } from 'next/server'
import { sendContactMessage } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { nom, email, sujet, message } = await req.json()

    if (!nom || !email || !message) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants.' }, { status: 400 })
    }

    const result = await sendContactMessage({
      nom,
      email,
      sujet: sujet || 'Sans sujet',
      message
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Erreur lors de l'envoi." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
