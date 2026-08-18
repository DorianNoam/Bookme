export const dynamic = 'force-dynamic'

import AbonnementGuard from '@/components/AbonnementGuard'
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import LogoutButton from '@/app/pro/components/LogoutButton'
import DashboardCharts from './DashboardCharts'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default async function ProDashboardPage() {
  // 1. Auth
  const cookieStore = cookies()
  const token = cookieStore.get('bookme_pro_token')?.value
  if (!token) redirect('/pro/login')

  let proId: number
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    proId = payload.id as number
    if (payload.role === 'employe') redirect('/pro/agenda')
  } catch {
    redirect('/pro/login')
  }

  // 2. Supabase
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: pro } = await supabase.from('pros').select('prenom, nom').eq('id', proId).single()
  const { data: salon } = await supabase.from('salons').select('id, nom, ville').eq('pro_id', proId).single()

  if (!salon) {
    return (
      <AbonnementGuard>
      <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
        <Header pro={pro} activePage="dashboard" />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px, 5vw, 40px) 16px' }}>
          <div style={{ background: '#fff', padding: 'clamp(24px, 5vw, 40px)', borderRadius: 8, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: NOIR, marginBottom: 15 }}>Bienvenue sur Bookme Pro !</h2>
            <p style={{ color: '#666', marginBottom: 30, fontSize: 14 }}>Pour commencer a recevoir des reservations, configurez votre etablissement.</p>
            <Link href="/pro/salon/create" style={{ display: 'inline-block', background: OR, color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: 4, fontWeight: 700 }}>
              Creer mon salon
            </Link>
           </div>
        </main>
      </div>
      </AbonnementGuard>
    )
  }

  // 3. Plages de dates
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

  const weekStart = new Date(now)
  const dow = weekStart.getDay()
  weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // 4. Fetch reservations du mois (pour KPIs, top services, CA par jour)
  const { data: allResas } = await supabase
    .from('reservations')
    .select('id, salon_id, user_id, service_id, employe_id, service_nom, service_prix, client_nom, client_prenom, client_email, client_telephone, date_rdv, statut')
    .eq('salon_id', salon.id)
    .gte('date_rdv', monthStart)
    .lte('date_rdv', monthEnd)
    .order('date_rdv', { ascending: true })

  const resas = allResas || []
  const active = resas.filter(r => r.statut !== 'annule')
  const annules = resas.filter(r => r.statut === 'annule')

  const todayResas = active.filter(r => r.date_rdv >= todayStart && r.date_rdv <= todayEnd)
  const weekResas = active.filter(r => r.date_rdv >= weekStart.toISOString() && r.date_rdv <= weekEnd.toISOString())

  const caToday = todayResas.reduce((s, r) => s + (r.service_prix || 0), 0)
  const caWeek = weekResas.reduce((s, r) => s + (r.service_prix || 0), 0)
  const caMonth = active.reduce((s, r) => s + (r.service_prix || 0), 0)

  // 5. Top services du mois
  const serviceCount: Record<string, { count: number; revenue: number }> = {}
  active.forEach(r => {
    const name = r.service_nom || 'Inconnu'
    if (!serviceCount[name]) serviceCount[name] = { count: 0, revenue: 0 }
    serviceCount[name].count++
    serviceCount[name].revenue += r.service_prix || 0
  })
  const topServices = Object.entries(serviceCount)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  // 6. CA par jour de la semaine (mois en cours)
  const caByDow: number[] = [0, 0, 0, 0, 0, 0, 0]
  active.forEach(r => {
    const d = new Date(r.date_rdv).getDay()
    const idx = d === 0 ? 6 : d - 1
    caByDow[idx] += r.service_prix || 0
  })
  const maxCaDow = Math.max(...caByDow, 1)

  // 7. CA annuel par mois (pour le graphique interactif)
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString()

  const { data: yearResasDetailed } = await supabase
    .from('reservations')
    .select('service_nom, service_prix, date_rdv, statut')
    .eq('salon_id', salon.id)
    .gte('date_rdv', yearStart)
    .lte('date_rdv', yearEnd)
    .neq('statut', 'annule')

  // Agreger par mois avec details des services
  type MonthData = { ca: number; rdvCount: number; topServices: { name: string; count: number; revenue: number }[] }
  const monthlyData: MonthData[] = Array.from({ length: 12 }, () => ({ ca: 0, rdvCount: 0, topServices: [] }))
  const monthServiceMap: Record<number, Record<string, { count: number; revenue: number }>> = {}

  ;(yearResasDetailed || []).forEach(r => {
    const month = new Date(r.date_rdv).getMonth()
    monthlyData[month].ca += r.service_prix || 0
    monthlyData[month].rdvCount++
    if (!monthServiceMap[month]) monthServiceMap[month] = {}
    const name = r.service_nom || 'Inconnu'
    if (!monthServiceMap[month][name]) monthServiceMap[month][name] = { count: 0, revenue: 0 }
    monthServiceMap[month][name].count++
    monthServiceMap[month][name].revenue += r.service_prix || 0
  })

  for (let m = 0; m < 12; m++) {
    if (monthServiceMap[m]) {
      monthlyData[m].topServices = Object.entries(monthServiceMap[m])
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([name, data]) => ({ name, ...data }))
    }
  }

  const totalCaYear = monthlyData.reduce((s, m) => s + m.ca, 0)

  // 8. Donnees camembert (mois en cours)
  const allServicesSorted = Object.entries(serviceCount).sort(([, a], [, b]) => b.count - a.count)
  const totalServicesCount = allServicesSorted.reduce((s, [, d]) => s + d.count, 0)

  const servicesData = allServicesSorted.map(([name, data]) => ({
    name,
    count: data.count,
    revenue: data.revenue,
    pct: totalServicesCount > 0 ? Math.round((data.count / totalServicesCount) * 100) : 0,
  }))

  // 9. Stats avis
  const { data: avis } = await supabase
    .from('avis')
    .select('note')
    .eq('salon_id', salon.id)

  const nbAvis = avis?.length || 0
  const moyNote = nbAvis > 0 ? (avis!.reduce((s, a) => s + a.note, 0) / nbAvis).toFixed(1) : '-'

  return (
    <AbonnementGuard>
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      <Header pro={pro} activePage="dashboard" />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(16px, 4vw, 30px) 16px' }}>

        {/* Titre + lien agenda */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 900, color: NOIR, margin: 0 }}>{salon.nom}</h1>
            <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>{'📍'} {salon.ville}</p>
          </div>
          <Link href="/pro/agenda" style={{
            background: NOIR,
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            Voir l{"'"}agenda {'→'}
          </Link>
        </div>

        {/* KPIs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: 12,
          marginBottom: 24
        }}>
          <KpiCard label="RDV aujourd'hui" value={String(todayResas.length)} sub={`${caToday.toLocaleString()} DA`} accent={NOIR} />
          <KpiCard label="RDV cette semaine" value={String(weekResas.length)} sub={`${caWeek.toLocaleString()} DA`} accent={OR} />
          <KpiCard label="CA du mois" value={`${caMonth.toLocaleString()} DA`} sub={`${active.length} RDV confirmes`} accent="#2e7d32" />
          <KpiCard label="Annulations" value={String(annules.length)} sub={resas.length > 0 ? `${Math.round((annules.length / resas.length) * 100)}% du total` : '0%'} accent="#d32f2f" />
          <KpiCard label="Note moyenne" value={String(moyNote)} sub={`${nbAvis} avis`} accent={OR} />
        </div>

        {/* Top services + CA par jour */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 16,
          marginBottom: 24
        }}>

          {/* TOP SERVICES */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(16px, 3vw, 25px)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: NOIR, marginBottom: 16, marginTop: 0 }}>Top prestations du mois</h3>
            {topServices.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: 14 }}>Aucune prestation ce mois-ci.</p>
            ) : (
              <div>
                {topServices.map(([name, data], i) => (
                  <div key={name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < topServices.length - 1 ? '1px solid #f5f5f5' : 'none',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: i === 0 ? OR : '#eee',
                        color: i === 0 ? '#fff' : '#888',
                        fontSize: 11, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {i + 1}
                      </span>
                      <span style={{
                        fontSize: 13, fontWeight: 600, color: NOIR,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {name}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>{data.count}x</span>
                      <span style={{ fontSize: 11, color: '#999', marginLeft: 6 }}>{data.revenue.toLocaleString()} DA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CA PAR JOUR */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(16px, 3vw, 25px)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: NOIR, marginBottom: 16, marginTop: 0 }}>Top jours du mois (CA)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {JOURS.map((jour, i) => {
                const pct = maxCaDow > 0 ? (caByDow[i] / maxCaDow) * 100 : 0
                return (
                  <div key={jour} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: '#888', flexShrink: 0 }}>{jour}</span>
                    <div style={{ flex: 1, height: 20, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden', minWidth: 0 }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct > 0 ? `linear-gradient(90deg, ${OR}, #d4a83a)` : 'transparent',
                        borderRadius: 4,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <span style={{
                      width: 'clamp(50px, 12vw, 70px)',
                      textAlign: 'right',
                      fontSize: 11,
                      fontWeight: 700,
                      color: caByDow[i] > 0 ? NOIR : '#ccc',
                      flexShrink: 0
                    }}>
                      {caByDow[i] > 0 ? `${caByDow[i].toLocaleString()} DA` : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* GRAPHIQUES INTERACTIFS : CA ANNUEL + CAMEMBERT */}
        <DashboardCharts
          monthlyData={monthlyData}
          servicesData={servicesData}
          currentMonth={now.getMonth()}
          currentYear={now.getFullYear()}
          totalCaYear={totalCaYear}
          totalServicesMonth={totalServicesCount}
        />

      </main>
    </div>
    </AbonnementGuard>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Composants locaux
// ═══════════════════════════════════════════════════════════════════

function Header({ pro, activePage }: { pro: any; activePage: string }) {
  return (
    <header style={{ background: NOIR, color: '#fff', padding: '12px 16px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .pro-header-container { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
        .pro-header-nav { display: flex; gap: 20px; align-items: center; }
        @media (max-width: 768px) {
          .pro-header-container { flex-direction: column; align-items: flex-start; gap: 12px; }
          .pro-header-nav { width: 100%; overflow-x: auto; padding-bottom: 4px; gap: 24px; -ms-overflow-style: none; scrollbar-width: none; }
          .pro-header-nav::-webkit-scrollbar { display: none; }
        }
      `}} />
      <div className="pro-header-container">
        <div style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900, flexShrink: 0 }}>
          Bookme<span style={{ color: OR }}>dz</span>
          <span style={{ fontWeight: 400, fontSize: 'clamp(11px, 2vw, 14px)', color: '#888', marginLeft: 6 }}>Pro</span>
        </div>
        <nav className="pro-header-nav">
          <Link href="/pro/dashboard" style={{ color: activePage === 'dashboard' ? OR : '#aaa', fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: activePage === 'dashboard' ? 700 : 600, whiteSpace: 'nowrap' }}>Dashboard</Link>
          <Link href="/pro/agenda" style={{ color: activePage === 'agenda' ? OR : '#aaa', fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: activePage === 'agenda' ? 700 : 600, whiteSpace: 'nowrap' }}>Agenda</Link>
          <Link href="/pro/settings" style={{ color: activePage === 'settings' ? OR : '#aaa', fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: activePage === 'settings' ? 700 : 600, whiteSpace: 'nowrap' }}>Parametres</Link>
          <div style={{ whiteSpace: 'nowrap' }}><LogoutButton /></div>
        </nav>
      </div>
    </header>
  )
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{
      background: '#fff',
      padding: 'clamp(14px, 3vw, 22px)',
      borderRadius: 8,
      borderLeft: `4px solid ${accent}`,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <div style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 900, color: NOIR, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 5 }}>{sub}</div>
    </div>
  )
}
