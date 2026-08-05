
export const dynamic = 'force-dynamic'
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default async function ProAgendaPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  // 1. Vérification de la session
  const cookieStore = cookies()
  const token = cookieStore.get('bookme_pro_token')?.value

  if (!token) redirect('/pro/login')

  let proId;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    proId = payload.id as number
  } catch (err) {
    redirect('/pro/login')
  }

  // 2. Gestion de la date sélectionnée (Aujourd'hui par défaut)
  const targetDate = searchParams.date ? new Date(searchParams.date) : new Date()
  
  // Calcul pour les boutons Jour Précédent / Jour Suivant
  const prevDate = new Date(targetDate)
  prevDate.setDate(prevDate.getDate() - 1)
  const nextDate = new Date(targetDate)
  nextDate.setDate(nextDate.getDate() + 1)

  const formatDateForUrl = (d: Date) => d.toISOString().split('T')[0]
  const displayDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // 3. Connexion Supabase
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Récupérer le salon
  const { data: salon } = await supabase
    .from('salons')
    .select('id, nom')
    .eq('pro_id', proId)
    .single()

  if (!salon) redirect('/pro/dashboard')

  // Récupérer les employés du salon
  const { data: employes } = await supabase
    .from('employes')
    .select('*')
    .eq('salon_id', salon.id)

  // Récupérer les réservations pour la journée sélectionnée
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*')
    .eq('salon_id', salon.id)
    .gte('date_rdv', startOfDay.toISOString())
    .lte('date_rdv', endOfDay.toISOString())
    .neq('statut', 'annule')

  // 4. Construction de la grille horaire (de 09:00 à 19:00)
  const hours = Array.from({ length: 11 }, (_, i) => i + 9) 

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      
      {/* HEADER DE NAVIGATION PRO */}
      <header style={{ background: NOIR, color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>
          Bookme<span style={{ color: OR }}>.dz</span> <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>| Agenda</span>
        </div>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/pro/dashboard" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
          <Link href="/pro/agenda" style={{ color: OR, fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>Agenda</Link>
          <Link href="/pro/logout" style={{ color: '#ff6b6b', fontSize: 13, textDecoration: 'none', fontWeight: 700, marginLeft: 10 }}>Déconnexion</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 20px' }}>
        
        {/* CONTROLES DU CALENDRIER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, background: '#fff', padding: '15px 20px', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <Link href={`/pro/agenda?date=${formatDateForUrl(prevDate)}`} style={{ padding: '8px 16px', border: `1px solid ${NOIR}`, color: NOIR, borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            ← Jour précédent
          </Link>
          
          <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, textTransform: 'capitalize', margin: 0 }}>
            {displayDate}
          </h2>
          
          <Link href={`/pro/agenda?date=${formatDateForUrl(nextDate)}`} style={{ padding: '8px 16px', background: NOIR, color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Jour suivant →
          </Link>
        </div>

        {/* LA GRILLE DE L'AGENDA */}
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <div style={{ minWidth: 800 }}>
            
            {/* EN-TÊTE DES EMPLOYÉS */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', background: '#fafafa' }}>
              <div style={{ width: 80, flexShrink: 0, padding: 15, borderRight: '1px solid #eee' }}></div>
              {employes?.map(emp => (
                <div key={emp.id} style={{ flex: 1, padding: 15, textAlign: 'center', fontWeight: 800, color: NOIR, borderRight: '1px solid #eee' }}>
                  {emp.nom}
                </div>
              ))}
            </div>

            {/* LIGNES DES HEURES */}
            {hours.map(hour => (
              <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                
                {/* Colonne des heures */}
                <div style={{ width: 80, flexShrink: 0, padding: 15, textAlign: 'center', fontWeight: 700, color: '#888', fontSize: 13, borderRight: '1px solid #eee', background: '#fafafa' }}>
                  {hour}:00
                </div>

                {/* Cellules pour chaque employé */}
                {employes?.map(emp => {
                  // Chercher si cet employé a une réservation à cette heure précise
                  const rdv = reservations?.find(r => {
                    const rdvHour = new Date(r.date_rdv).getHours()
                    return r.employe_id === emp.id && rdvHour === hour
                  })

                  return (
                    <div key={`${hour}-${emp.id}`} style={{ flex: 1, padding: 10, borderRight: '1px solid #eee', position: 'relative', minHeight: 80 }}>
                      {rdv && (
                        <div style={{ background: 'rgba(184, 146, 42, 0.1)', borderLeft: `4px solid ${OR}`, padding: '10px', borderRadius: 4, height: '100%' }}>
                          <div style={{ fontWeight: 800, color: NOIR, fontSize: 13 }}>{rdv.client_nom}</div>
                          <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>{rdv.service_nom}</div>
                          <div style={{ color: OR, fontWeight: 700, fontSize: 12 }}>{rdv.service_prix} DA</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
            
          </div>
        </div>
      </main>
    </div>
  )
}
