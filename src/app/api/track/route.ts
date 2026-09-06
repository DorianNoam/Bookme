// app/api/track/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// IMPORTANT : cette route utilise la cle service_role.
// A ajouter dans les variables d'environnement Vercel : SUPABASE_SERVICE_ROLE_KEY
// (Supabase > Project Settings > API > service_role secret)
// Ne JAMAIS prefixer cette variable par NEXT_PUBLIC_.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const TYPES_AUTORISES = ['vue_page', 'clic_reserver', 'reservation']
const SOURCES_AUTORISEES = ['direct', 'ig', 'qr', 'search', 'fb', 'tiktok', 'wa', 'maps', 'email']

// Filtrage grossier des robots : ils ne doivent pas gonfler les statistiques
// affichees au professionnel.
const MOTS_ROBOT = [
  'bot', 'crawl', 'spider', 'slurp', 'facebookexternalhit', 'preview',
  'headless', 'lighthouse', 'python-requests', 'curl', 'wget', 'axios',
  'phantom', 'puppeteer', 'monitor', 'pingdom', 'vercel-screenshot'
]

function estRobot(userAgent: string): boolean {
  const ua = (userAgent || '').toLowerCase()
  if (!ua) return true
  return MOTS_ROBOT.some(mot => ua.includes(mot))
}

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || ''
    if (estRobot(userAgent)) {
      // On repond 204 pour ne rien casser cote client, mais on n'enregistre rien.
      return new NextResponse(null, { status: 204 })
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Corps de requete invalide' }, { status: 400 })
    }

    const salonId = Number(body.salon_id)
    const type = String(body.type || '')
    const sourceBrute = String(body.source || 'direct')
    const sessionId = String(body.session_id || '').slice(0, 64) || null

    if (!Number.isInteger(salonId) || salonId <= 0) {
      return NextResponse.json({ error: 'salon_id invalide' }, { status: 400 })
    }

    if (!TYPES_AUTORISES.includes(type)) {
      return NextResponse.json({ error: 'type invalide' }, { status: 400 })
    }

    const source = SOURCES_AUTORISEES.includes(sourceBrute) ? sourceBrute : 'direct'

    const { error } = await supabaseAdmin.from('evenements').insert({
      salon_id: salonId,
      type,
      source,
      session_id: sessionId
    })

    if (error) {
      console.error('[track] Erreur insertion evenement :', error.message)
      // On ne remonte pas l'erreur au client : le tracking ne doit jamais
      // degrader l'experience de la visiteuse.
      return new NextResponse(null, { status: 204 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    console.error('[track] Erreur inattendue :', e?.message)
    return new NextResponse(null, { status: 204 })
  }
}
