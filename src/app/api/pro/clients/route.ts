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

// GET : Recuperer les clients (liste ou detail d un seul client)
export async function GET(req: NextRequest) {
  const salonId = await getProSalonId()
  if (!salonId) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const clientKey = searchParams.get('client_key')

  // ═══ MODE DETAIL : un seul client ═══
  if (clientKey) {
    try {
      // Recuperer toutes les reservations de ce client
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('id, service_nom, service_prix, date_rdv, statut, employe_id, employes(nom)')
        .eq('salon_id', salonId)
        .or(`client_telephone.eq.${clientKey},client_nom.eq.${clientKey}`)
        .order('date_rdv', { ascending: false })

      if (resError) throw resError

      // Recuperer les metadata client (si existantes)
      const { data: clientMeta } = await supabase
        .from('salon_clients')
        .select('*')
        .eq('salon_id', salonId)
        .eq('client_telephone', clientKey)
        .single()

      // Recuperer le nom/prenom/email depuis la reservation la plus recente
      const { data: latestResa } = await supabase
        .from('reservations')
        .select('client_nom, client_prenom, client_email, client_telephone')
        .eq('salon_id', salonId)
        .or(`client_telephone.eq.${clientKey},client_nom.eq.${clientKey}`)
        .order('date_rdv', { ascending: false })
        .limit(1)
        .single()

      // Verifier blacklist
      const { data: blacklistEntry } = await supabase
        .from('salon_blacklist')
        .select('raison, created_at')
        .eq('salon_id', salonId)
        .eq('client_telephone', clientKey)
        .single()

      // Agreger les stats
      const allResas = reservations || []
      const activeResas = allResas.filter(r => r.statut !== 'annule')
      const annulations = allResas.filter(r => r.statut === 'annule').length
      const noShows = allResas.filter(r => r.statut === 'absent' || r.statut === 'no_show').length
      const caTotal = activeResas.reduce((s, r) => s + (r.service_prix || 0), 0)

      return NextResponse.json({
        success: true,
        client: {
          client_nom: clientMeta?.client_nom || latestResa?.client_nom || clientKey,
          client_prenom: clientMeta?.client_prenom || latestResa?.client_prenom || '',
          client_email: clientMeta?.client_email || latestResa?.client_email || '',
          client_telephone: clientMeta?.client_telephone || latestResa?.client_telephone || clientKey,
          date_naissance: clientMeta?.date_naissance || null,
          notes: clientMeta?.notes || '',
        },
        stats: {
          total_rdv: allResas.length,
          rdv_honores: activeResas.length - noShows,
          annulations,
          no_shows: noShows,
          ca_total: caTotal,
        },
        reservations: allResas,
        is_blacklisted: !!blacklistEntry,
        blacklist_info: blacklistEntry || null,
      })
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // ═══ MODE LISTE : tous les clients ═══
  try {
    const { data: reservations, error: resError } = await supabase
      .from('reservations')
      .select('id, client_nom, client_telephone, client_email, service_nom, service_prix, date_rdv, statut, user_id')
      .eq('salon_id', salonId)
      .order('date_rdv', { ascending: false })

    if (resError) throw resError

    const { data: blacklist } = await supabase
      .from('salon_blacklist')
      .select('client_telephone, client_nom, raison, created_at')
      .eq('salon_id', salonId)

    const blacklistSet = new Set((blacklist || []).map(b => b.client_telephone))
    const blacklistMap = new Map((blacklist || []).map(b => [b.client_telephone, b]))

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
      if (r.client_email && !client.client_email) client.client_email = r.client_email
      if (r.client_telephone && !client.client_telephone) client.client_telephone = r.client_telephone
      if (r.user_id && !client.user_id) client.user_id = r.user_id

      client.total_rdv++

      if (r.statut === 'annule') {
        client.annulations++
      } else if (r.statut === 'absent' || r.statut === 'no_show') {
        client.no_shows++
      } else {
        client.rdv_honores++
        client.ca_total += Number(r.service_prix) || 0
      }

      if (r.date_rdv > client.dernier_rdv) client.dernier_rdv = r.date_rdv
      if (r.date_rdv < client.premier_rdv) client.premier_rdv = r.date_rdv

      if (r.service_nom) {
        client.services_frequents[r.service_nom] = (client.services_frequents[r.service_nom] || 0) + 1
      }
    }

    const clients = Array.from(clientsMap.values()).map(c => {
      const topService = Object.entries(c.services_frequents)
        .sort(([, a], [, b]) => b - a)[0]

      return {
        ...c,
        service_prefere: topService ? topService[0] : null,
        is_blacklisted: c.client_telephone ? blacklistSet.has(c.client_telephone) : false,
        blacklist_info: c.client_telephone ? blacklistMap.get(c.client_telephone) || null : null,
        services_frequents: undefined,
      }
    })

    const stats = {
      total_clients: clients.length,
      clients_fideles: clients.filter(c => c.rdv_honores >= 3).length,
      clients_a_surveiller: clients.filter(c => c.no_shows >= 2 || c.annulations >= 3).length,
      ca_total: clients.reduce((sum, c) => sum + c.ca_total, 0),
      blacklistes: clients.filter(c => c.is_blacklisted).length,
    }

    return NextResponse.json({ success: true, clients, stats })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST : Blacklist, unblacklist, ou mise a jour client
export async function POST(req: NextRequest) {
  const salonId = await getProSalonId()
  if (!salonId) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action } = body

    // ═══ MISE A JOUR DES INFOS CLIENT ═══
    if (action === 'update_client') {
      const { client_telephone, client_nom, client_prenom, client_email, date_naissance, notes } = body

      if (!client_telephone) {
        return NextResponse.json({ error: 'Telephone requis.' }, { status: 400 })
      }

      // Upsert dans salon_clients
      const { error } = await supabase
        .from('salon_clients')
        .upsert({
          salon_id: salonId,
          client_telephone,
          client_nom: client_nom || null,
          client_prenom: client_prenom || null,
          client_email: client_email || null,
          date_naissance: date_naissance || null,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'salon_id,client_telephone' })

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Informations client mises a jour.' })
    }

    // ═══ BLACKLIST ═══
    if (action === 'blacklist') {
      const { client_telephone, client_nom, raison } = body
      if (!client_telephone) {
        return NextResponse.json({ error: 'Numero de telephone requis.' }, { status: 400 })
      }

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

    // ═══ UNBLACKLIST ═══
    if (action === 'unblacklist') {
      const { client_telephone } = body
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
