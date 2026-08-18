import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getProSalonId(): Promise<number | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('bookme_pro_token')?.value
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const proId = payload.id as number

    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('pro_id', proId)
      .single()

    return salon?.id || null
  } catch {
    return null
  }
}

// GET : Recuperer la fiche clients aggregee
export async function GET() {
  const salonId = await getProSalonId()
  if (!salonId) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    // 1. Recuperer toutes les reservations du salon
    const { data: reservations, error: resError } = await supabase
      .from('reservations')
      .select('id, client_nom, client_telephone, client_email, service_nom, service_prix, date_rdv, statut, user_id')
      .eq('salon_id', salonId)
      .order('date_rdv', { ascending: false })

    if (resError) throw resError

    // 2. Recuperer la blacklist du salon
    const { data: blacklist } = await supabase
      .from('salon_blacklist')
      .select('client_telephone, client_nom, raison, created_at')
      .eq('salon_id', salonId)

    const blacklistSet = new Set((blacklist || []).map(b => b.client_telephone))
    const blacklistMap = new Map((blacklist || []).map(b => [b.client_telephone, b]))

    // 3. Agreger les donnees par client
    // On utilise client_telephone comme cle primaire, sinon client_nom
    const clientsMap = new Map<string, {
      key: string
      client_nom: string
      client_telephone: string | null
      client_email: string | null
      user_id: number | null
      total_rdv: number
      rdv_honores: number
      annulations: number
      no_shows: number
      ca_total: number
      dernier_rdv: string
      premier_rdv: string
      services_frequents: Record<string, number>
    }>()

    for (const r of (reservations || [])) {
      // Determiner la cle unique du client
      const key = r.client_telephone || r.client_nom || 'inconnu'
      
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          key,
          client_nom: r.client_nom || 'Client inconnu',
          client_telephone: r.client_telephone || null,
          client_email: r.client_email || null,
          user_id: r.user_id || null,
          total_rdv: 0,
          rdv_honores: 0,
          annulations: 0,
          no_shows: 0,
          ca_total: 0,
          dernier_rdv: r.date_rdv,
          premier_rdv: r.date_rdv,
          services_frequents: {},
        })
      }

      const client = clientsMap.get(key)!

      // Mettre a jour le nom/email si plus recent et disponible
      if (r.client_email && !client.client_email) client.client_email = r.client_email
      if (r.client_telephone && !client.client_telephone) client.client_telephone = r.client_telephone
      if (r.user_id && !client.user_id) client.user_id = r.user_id

      client.total_rdv++

      if (r.statut === 'annule') {
        client.annulations++
      } else if (r.statut === 'absent' || r.statut === 'no_show') {
        client.no_shows++
      } else {
        // confirme, termine, ou autre = honore
        client.rdv_honores++
        client.ca_total += Number(r.service_prix) || 0
      }

      // Dates
      if (r.date_rdv > client.dernier_rdv) client.dernier_rdv = r.date_rdv
      if (r.date_rdv < client.premier_rdv) client.premier_rdv = r.date_rdv

      // Services frequents
      if (r.service_nom) {
        client.services_frequents[r.service_nom] = (client.services_frequents[r.service_nom] || 0) + 1
      }
    }

    // 4. Convertir en tableau et ajouter le statut blacklist
    const clients = Array.from(clientsMap.values()).map(c => {
      // Trouver le service le plus demande
      const topService = Object.entries(c.services_frequents)
        .sort(([, a], [, b]) => b - a)[0]

      return {
        ...c,
        service_prefere: topService ? topService[0] : null,
        is_blacklisted: c.client_telephone ? blacklistSet.has(c.client_telephone) : false,
        blacklist_info: c.client_telephone ? blacklistMap.get(c.client_telephone) || null : null,
        services_frequents: undefined, // ne pas envoyer au client
      }
    })

    // 5. Stats globales
    const stats = {
      total_clients: clients.length,
      clients_fideles: clients.filter(c => c.rdv_honores >= 3).length,
      clients_a_surveiller: clients.filter(c => c.no_shows >= 2 || c.annulations >= 3).length,
      ca_total: clients.reduce((sum, c) => sum + c.ca_total, 0),
      blacklistes: clients.filter(c => c.is_blacklisted).length,
    }

    return NextResponse.json({
      success: true,
      clients,
      stats,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST : Blacklister ou debloquer un client
export async function POST(req: NextRequest) {
  const salonId = await getProSalonId()
  if (!salonId) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    const { action, client_telephone, client_nom, raison } = await req.json()

    if (!client_telephone) {
      return NextResponse.json({ error: 'Numero de telephone requis pour blacklister un client.' }, { status: 400 })
    }

    if (action === 'blacklist') {
      const { error } = await supabase
        .from('salon_blacklist')
        .upsert({
          salon_id: salonId,
          client_telephone,
          client_nom: client_nom || null,
          raison: raison || null,
        }, { onConflict: 'salon_id,client_telephone' })

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Client blackliste.' })
    }

    if (action === 'unblacklist') {
      const { error } = await supabase
        .from('salon_blacklist')
        .delete()
        .eq('salon_id', salonId)
        .eq('client_telephone', client_telephone)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Client debloque.' })
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
