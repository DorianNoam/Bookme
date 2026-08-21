import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
// On force Next.js a ne pas mettre cette page en cache pour que le statut VIP s'actualise instantanement
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const salonId = params.id
  // 1. Recuperation des infos du salon
  // On ajoute date_ouverture explicitement pour contourner le cache de schema sur select('*')
  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select('*, seuil_fidelite, date_ouverture')
    .eq('id', salonId)
    .single()
  if (salonError || !salon) {
    return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 })
  }
  // 2. Recuperation des donnees publiques standards (Services, Employes, Avis, Fermetures)
  // CORRECTION ICI : Ajout de promo_nom dans le select()
  const [servicesRes, employesRes, avisRes, fermeturesRes] = await Promise.all([
    supabase.from('services').select('id, nom, prix, duree, categorie_service, salon_id, promo_pourcentage, promo_active, promo_debut, promo_fin, promo_nom').eq('salon_id', salonId).order('categorie_service'),
    supabase.from('employes').select('*').eq('salon_id', salonId),
    supabase.from('avis').select('*, users(prenom, nom)').eq('salon_id', salonId),
    supabase.from('salon_fermetures').select('date_debut, date_fin').eq('salon_id', salonId).order('date_debut', { ascending: true })
  ])
  // Variables VIP par defaut
  let isVip = false
  let ventesPrivees: any[] = []
  let pastReservationsCount = 0
  // 3. Detection automatique du statut VIP
  const token = req.cookies.get('bookme_token')?.value
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { payload } = await jwtVerify(token, secret)
      const userId = payload.id as number
      // Compter uniquement les rendez-vous termines pour ce client dans CE salon
      const { count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonId)
        .eq('user_id', userId)
        .eq('statut', 'termine')
      pastReservationsCount = count || 0
      const seuil = salon.seuil_fidelite || 4 // 4 par defaut si non configure
      // Le client a-t-il atteint le palier ?
      if (pastReservationsCount >= seuil) {
        isVip = true
        
        // S'il est VIP, on charge le catalogue des ventes privees
        const { data: vpData } = await supabase
          .from('ventes_privees')
          .select('*')
          .eq('salon_id', salonId)
          .order('created_at', { ascending: false })
          
        ventesPrivees = vpData || []
      }
    } catch (e) {
      // Si le token est expire ou invalide, on ignore l'erreur silencieusement.
      // Le client sera simplement considere comme non-connecte et verra l'affichage standard.
    }
  }
  return NextResponse.json({
    salon,
    services: servicesRes.data || [],
    employes: employesRes.data || [],
    avis: avisRes.data || [],
    fermetures: fermeturesRes.data || [], // Utilise par la page booking pour griser les jours fermes
    isVip,
    ventesPrivees,
    pastReservationsCount // Pratique pour afficher "Plus que X RDV pour devenir VIP !" plus tard
  })
}
