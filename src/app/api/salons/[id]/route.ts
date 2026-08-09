import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

// On force Next.js à ne pas mettre cette page en cache pour que le statut VIP s'actualise instantanément
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const salonId = params.id

  // 1. Récupération des infos du salon
  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select('*, seuil_fidelite') // On s'assure de récupérer le seuil
    .eq('id', salonId)
    .single()

  if (salonError || !salon) {
    return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })
  }

  // 2. Récupération des données publiques standards (Services, Employés, Avis)
  const [servicesRes, employesRes, avisRes] = await Promise.all([
    supabase.from('services').select('id, salon_id, nom, prix, duree, categorie_service, promo_pourcentage, promo_active').eq('salon_id', salonId),
    supabase.from('employes').select('*').eq('salon_id', salonId),
    supabase.from('avis').select('*, users(prenom, nom)').eq('salon_id', salonId)
  ])

  // Variables VIP par défaut
  let isVip = false
  let ventesPrivees: any[] = []
  let pastReservationsCount = 0

  // 3. Détection automatique du statut VIP
  const token = req.cookies.get('bookme_token')?.value
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { payload } = await jwtVerify(token, secret)
      const userId = payload.id as number

      // Compter uniquement les rendez-vous terminés pour ce client dans CE salon
      const { count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonId)
        .eq('user_id', userId)
        .eq('statut', 'termine')

      pastReservationsCount = count || 0
      const seuil = salon.seuil_fidelite || 4 // 4 par défaut si non configuré

      // Le client a-t-il atteint le palier ?
      if (pastReservationsCount >= seuil) {
        isVip = true
        
        // S'il est VIP, on charge le catalogue des ventes privées
        const { data: vpData } = await supabase
          .from('ventes_privees')
          .select('*')
          .eq('salon_id', salonId)
          .order('created_at', { ascending: false })
          
        ventesPrivees = vpData || []
      }
    } catch (e) {
      // Si le token est expiré ou invalide, on ignore l'erreur silencieusement.
      // Le client sera simplement considéré comme non-connecté et verra l'affichage standard.
    }
  }

  return NextResponse.json({
    salon,
    services: servicesRes.data || [],
    employes: employesRes.data || [],
    avis: avisRes.data || [],
    isVip,
    ventesPrivees,
    pastReservationsCount // Pratique pour afficher "Plus que X RDV pour devenir VIP !" plus tard
  })
}
