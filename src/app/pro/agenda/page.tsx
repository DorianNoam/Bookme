export const dynamic = 'force-dynamic'

import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import LogoutButton from '@/app/pro/components/LogoutButton'
import InteractiveAgenda from './InteractiveAgenda'
import AbonnementGuard from '@/components/AbonnementGuard'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

function formatDateForUrl(d: Date) {
  return d.toISOString().split('T')[0]
}

function getMonday(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const MOIS_NOMS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

export default async function ProAgendaPage({
  searchParams,
}: {
  searchParams: { date?: string; view?: string }
}) {
  // 1. Auth & Identification du rôle
  const cookieStore = cookies()
  const token = cookieStore.get('bookme_pro_token')?.value

  if (!token) {
    redirect('/pro/login')
  }

  let role = 'pro'
  let proId: number | null = null
  let salonIdFromToken: number | null = null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    role = (payload.role as string) || 'pro'
    
    if (role === 'employe') {
      salonIdFromToken = payload.salon_id as number
      if (!salonIdFromToken) redirect('/pro/login')
    } else {
      proId = payload.id as number
    }
  } catch {
    redirect('/pro/login')
  }

  const view = (searchParams.view === 'week' || searchParams.view === 'month') ? searchParams.view : 'day'
  const targetDate = searchParams.date ? new Date(searchParams.date + 'T12:00:00') : new Date()

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 2. Récupération du salon selon le rôle
  let salon: { id: number; nom: string } | null = null

  if (role === 'employe' && salonIdFromToken) {
    const { data } = await supabase
      .from('salons')
      .select('id, nom')
      .eq('id', salonIdFromToken)
      .single()
    salon = data
  } else if (proId) {
    const { data } = await supabase
      .from('salons')
      .select('id, nom')
      .eq('pro_id', proId)
      .single()
    salon = data
  }

  if (!salon) redirect('/pro/dashboard')

  // Récupération des employés ET des services du salon
  const { data: employes } = await supabase.from('employes').select('*').eq('salon_id', salon.id)
  const { data: services } = await supabase.from('services').select('*').eq('salon_id', salon.id).order('nom', { ascending: true })

  let rangeStart: Date
  let rangeEnd: Date

  if (view === 'day') {
    rangeStart = new Date(targetDate)
    rangeStart.setHours(0, 0, 0, 0)
    rangeEnd = new Date(targetDate)
    rangeEnd.setHours(23, 59, 59, 999)
  } else if (view === 'week') {
    rangeStart = getMonday(targetDate)
    rangeEnd = new Date(rangeStart)
    rangeEnd.setDate(rangeEnd.getDate() + 6)
    rangeEnd.setHours(23, 59, 59, 999)
  } else {
    rangeStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    rangeEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, salon_id, user_id, service_id, employe_id, service_nom, service_prix, client_nom, client_prenom, client_email, client_telephone, date_rdv, statut')
    .eq('salon_id', salon.id)
    .gte('date_rdv', rangeStart.toISOString())
    .lte('date_rdv', rangeEnd.toISOString())
    .neq('statut', 'annule')
    .order('date_rdv', { ascending: true })

  const allReservations = reservations || []

  let prevDate: Date
  let nextDate: Date
  let displayTitle: string

  if (view === 'day') {
    prevDate = new Date(targetDate)
    prevDate.setDate(prevDate.getDate() - 1)
    nextDate = new Date(targetDate)
    nextDate.setDate(nextDate.getDate() + 1)
    displayTitle = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } else if (view === 'week') {
    const monday = getMonday(targetDate)
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    prevDate = new Date(monday)
    prevDate.setDate(prevDate.getDate() - 7)
    nextDate = new Date(monday)
    nextDate.setDate(nextDate.getDate() + 7)
    displayTitle = `${monday.getDate()} - ${sunday.getDate()} ${MOIS_NOMS[sunday.getMonth()]} ${sunday.getFullYear()}`
  } else {
    prevDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1)
    nextDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1)
    displayTitle = `${MOIS_NOMS[targetDate.getMonth()]} ${targetDate.getFullYear()}`
  }

  return (
    <AbonnementGuard>
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      
      {/* HEADER RESPONSIVE */}
      <header style={{ background: NOIR, color: '#fff', padding: '12px 16px' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .pro-header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
          }
          .pro-header-nav {
            display: flex;
            gap: 20px;
            align-items: center;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          @media (max-width: 768px) {
            .pro-header-container {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
            .pro-header-nav {
              width: 100%;
              overflow-x: auto;
              padding-bottom: 4px;
              gap: 24px;
            }
          }
        `}} />
        
        <div className="pro-header-container">
          <div style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900, flexShrink: 0 }}>
            Bookme<span style={{ color: OR }}>dz</span>
            <span style={{ fontWeight: 400, fontSize: 'clamp(11px, 2vw, 14px)', color: '#888', marginLeft: 6 }}>
              {role === 'employe' ? 'Équipe' : 'Pro'}
            </span>
          </div>
          <nav className="pro-header-nav hide-scrollbar">
            {role !== 'employe' && (
              <Link href="/pro/dashboard" style={{ color: '#aaa', fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Dashboard</Link>
            )}
            <Link href="/pro/agenda" style={{ color: OR, fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>Agenda</Link>
            {role !== 'employe' && (
              <Link href="/pro/settings" style={{ color: '#aaa', fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Param.</Link>
            )}
            <div style={{ whiteSpace: 'nowrap' }}>
              <LogoutButton />
            </div>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(16px, 4vw, 30px) 16px' }}>
        
        {/* ONGLETS DES VUES (Jour / Semaine / Mois) */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 0, marginBottom: 16, flexWrap: 'nowrap', alignItems: 'center', overflowX: 'auto', paddingBottom: 4 }}>
          {(['day', 'week', 'month'] as const).map((v) => {
            const label = v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'
            const isActive = view === v
            return (
              <Link
                key={v}
                href={`/pro/agenda?view=${v}&date=${formatDateForUrl(targetDate)}`}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 24px)', fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#fff' : NOIR, background: isActive ? NOIR : '#fff', border: `1px solid ${isActive ? NOIR : '#ddd'}`, textDecoration: 'none',
                  borderRadius: v === 'day' ? '6px 0 0 6px' : v === 'month' ? '0 6px 6px 0' : '0', marginLeft: v === 'day' ? 0 : -1, whiteSpace: 'nowrap'
                }}
              >
                {label}
              </Link>
            )
          })}
          <Link href={`/pro/agenda?view=${view}&date=${formatDateForUrl(new Date())}`} style={{ padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px)', fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, color: OR, background: 'transparent', border: `1px solid ${OR}`, textDecoration: 'none', borderRadius: 6, marginLeft: 'clamp(8px, 2vw, 15px)', whiteSpace: 'nowrap' }}>
            {"Aujourd'hui"}
          </Link>
        </div>

        {/* NAVIGATION PREV / DATE / NEXT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: '#fff', padding: 'clamp(8px, 2vw, 12px) clamp(10px, 2.5vw, 20px)', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', gap: 8 }}>
          <Link href={`/pro/agenda?view=${view}&date=${formatDateForUrl(prevDate)}`} style={{ padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 16px)', border: `1px solid ${NOIR}`, color: NOIR, borderRadius: 4, textDecoration: 'none', fontWeight: 600 }}>{'\u2190'}</Link>
          <h2 style={{ fontSize: 'clamp(13px, 3vw, 18px)', fontWeight: 800, color: NOIR, textTransform: 'capitalize', margin: 0 }}>{displayTitle}</h2>
          <Link href={`/pro/agenda?view=${view}&date=${formatDateForUrl(nextDate)}`} style={{ padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 16px)', background: NOIR, color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 600 }}>{'\u2192'}</Link>
        </div>

        <InteractiveAgenda 
          employes={employes || []} 
          services={services || []}
          reservations={allReservations} 
          view={view as 'day' | 'week' | 'month'} 
          targetDateStr={targetDate.toISOString()}
          salonName={salon.nom}
        />

      </main>
    </div>
    </AbonnementGuard>
  )
}
