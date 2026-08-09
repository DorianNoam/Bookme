export const dynamic = 'force-dynamic'

import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import LogoutButton from '@/app/pro/components/LogoutButton'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

// ── Helpers ──────────────────────────────────────────────────────────

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

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS_NOMS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

// ── Page principale ──────────────────────────────────────────────────

export default async function ProAgendaPage({
  searchParams,
}: {
  searchParams: { date?: string; view?: string }
}) {
  // 1. Auth
  const cookieStore = cookies()
  const token = cookieStore.get('bookme_pro_token')?.value

  if (!token) {
    redirect('/pro/login')
  }

  let proId: number
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    proId = payload.id as number
  } catch {
    redirect('/pro/login')
  }

  // 2. Params
  const view = (searchParams.view === 'week' || searchParams.view === 'month') ? searchParams.view : 'day'
  const targetDate = searchParams.date ? new Date(searchParams.date + 'T12:00:00') : new Date()

  // 3. Supabase
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: salon } = await supabase
    .from('salons')
    .select('id, nom')
    .eq('pro_id', proId)
    .single()

  if (!salon) redirect('/pro/dashboard')

  const { data: employes } = await supabase
    .from('employes')
    .select('*')
    .eq('salon_id', salon.id)

  // 4. Calcul de la plage de dates selon la vue
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
    .select('*')
    .eq('salon_id', salon.id)
    .gte('date_rdv', rangeStart.toISOString())
    .lte('date_rdv', rangeEnd.toISOString())
    .neq('statut', 'annule')
    .order('date_rdv', { ascending: true })

  const allReservations = reservations || []

  // 5. Navigation prev/next
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

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>

      {/* HEADER */}
      <header style={{ background: NOIR, color: '#fff', padding: '12px 16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          <div style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900, flexShrink: 0 }}>
            Bookme<span style={{ color: OR }}>.dz</span>
            <span style={{ fontWeight: 400, fontSize: 'clamp(11px, 2vw, 14px)', color: '#888', marginLeft: 6 }}>Pro</span>
          </div>
          <nav style={{
            display: 'flex',
            gap: 'clamp(8px, 2vw, 20px)',
            alignItems: 'center'
          }}>
            <Link href="/pro/dashboard" style={{
              color: '#aaa',
              fontSize: 'clamp(12px, 2vw, 14px)',
              textDecoration: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Dashboard
            </Link>
            <Link href="/pro/agenda" style={{
              color: OR,
              fontSize: 'clamp(12px, 2vw, 14px)',
              textDecoration: 'none',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              Agenda
            </Link>
            <Link href="/pro/settings" style={{
              color: '#aaa',
              fontSize: 'clamp(12px, 2vw, 14px)',
              textDecoration: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Param.
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(16px, 4vw, 30px) 16px' }}>

        {/* ONGLETS DE VUE + Aujourd'hui */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {(['day', 'week', 'month'] as const).map((v) => {
            const label = v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'
            const isActive = view === v
            return (
              <Link
                key={v}
                href={`/pro/agenda?view=${v}&date=${formatDateForUrl(targetDate)}`}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 24px)',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#fff' : NOIR,
                  background: isActive ? NOIR : '#fff',
                  border: `1px solid ${isActive ? NOIR : '#ddd'}`,
                  textDecoration: 'none',
                  borderRadius: v === 'day' ? '6px 0 0 6px' : v === 'month' ? '0 6px 6px 0' : '0',
                  marginLeft: v === 'day' ? 0 : -1,
                  whiteSpace: 'nowrap'
                }}
              >
                {label}
              </Link>
            )
          })}

          <Link
            href={`/pro/agenda?view=${view}&date=${formatDateForUrl(new Date())}`}
            style={{
              padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px)',
              fontSize: 'clamp(11px, 2vw, 13px)',
              fontWeight: 700,
              color: OR,
              background: 'transparent',
              border: `1px solid ${OR}`,
              textDecoration: 'none',
              borderRadius: 6,
              marginLeft: 'clamp(8px, 2vw, 15px)',
              whiteSpace: 'nowrap'
            }}
          >
            {"Aujourd'hui"}
          </Link>
        </div>

        {/* NAVIGATION PREV / DATE / NEXT */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          background: '#fff',
          padding: 'clamp(8px, 2vw, 12px) clamp(10px, 2.5vw, 20px)',
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          gap: 8
        }}>
          <Link
            href={`/pro/agenda?view=${view}&date=${formatDateForUrl(prevDate)}`}
            style={{
              padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 16px)',
              border: `1px solid ${NOIR}`,
              color: NOIR,
              borderRadius: 4,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 'clamp(18px, 3vw, 13px)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {'\u2190'}
          </Link>

          <h2 style={{
            fontSize: 'clamp(13px, 3vw, 18px)',
            fontWeight: 800,
            color: NOIR,
            textTransform: 'capitalize',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.3
          }}>
            {displayTitle}
          </h2>

          <Link
            href={`/pro/agenda?view=${view}&date=${formatDateForUrl(nextDate)}`}
            style={{
              padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 16px)',
              background: NOIR,
              color: '#fff',
              borderRadius: 4,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 'clamp(18px, 3vw, 13px)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {'\u2192'}
          </Link>
        </div>

        {/* ────── VUE JOUR ────── */}
        {view === 'day' && (
          <DayView employes={employes || []} reservations={allReservations} />
        )}

        {/* ────── VUE SEMAINE ────── */}
        {view === 'week' && (
          <WeekView monday={getMonday(targetDate)} reservations={allReservations} view={view} />
        )}

        {/* ────── VUE MOIS ────── */}
        {view === 'month' && (
          <MonthView year={targetDate.getFullYear()} month={targetDate.getMonth()} reservations={allReservations} view={view} />
        )}

      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VUE JOUR
// ═══════════════════════════════════════════════════════════════════

function DayView({ employes, reservations }: { employes: any[]; reservations: any[] }) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 9)

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ minWidth: 500 }}>
        {/* En-tete employes */}
        <div style={{ display: 'flex', borderBottom: '2px solid #eee', background: '#fafafa' }}>
          <div style={{ width: 56, flexShrink: 0, padding: 10, borderRight: '1px solid #eee' }}></div>
          {employes.map((emp: any) => (
            <div key={emp.id} style={{
              flex: 1,
              padding: '10px 4px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: 'clamp(11px, 2vw, 14px)',
              color: NOIR,
              borderRight: '1px solid #eee',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {emp.nom}
            </div>
          ))}
        </div>

        {/* Lignes heures */}
        {hours.map(hour => (
          <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{
              width: 56,
              flexShrink: 0,
              padding: '12px 4px',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#999',
              borderRight: '1px solid #eee'
            }}>
              {`${hour}:00`}
            </div>
            {employes.map((emp: any) => {
              const rdv = reservations.find((r: any) => {
                const rdvHour = new Date(r.date_rdv).getHours()
                return rdvHour === hour && r.employe_id === emp.id
              })
              return (
                <div key={emp.id} style={{
                  flex: 1,
                  padding: 6,
                  minHeight: 48,
                  borderRight: '1px solid #f5f5f5',
                  background: rdv ? '#FFF8EE' : 'transparent'
                }}>
                  {rdv && (
                    <div style={{ borderLeft: `3px solid ${OR}`, paddingLeft: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: NOIR, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rdv.client_nom}</div>
                      <div style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rdv.service_nom}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: OR }}>{rdv.service_prix} DA</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Compteur du jour */}
      <div style={{
        padding: '12px 16px',
        borderTop: '2px solid #eee',
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>
          {reservations.length} rendez-vous
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>
          {reservations.reduce((sum: number, r: any) => sum + (r.service_prix || 0), 0)} DA
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VUE SEMAINE
// ═══════════════════════════════════════════════════════════════════

function WeekView({ monday, reservations, view }: { monday: Date; reservations: any[]; view: string }) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 9)
  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })
  const today = new Date()

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ minWidth: 600 }}>
        {/* En-tete jours de la semaine */}
        <div style={{ display: 'flex', borderBottom: '2px solid #eee', background: '#fafafa' }}>
          <div style={{ width: 48, flexShrink: 0, padding: 8, borderRight: '1px solid #eee' }}></div>
          {days.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={i} style={{
                flex: 1,
                padding: '8px 2px',
                textAlign: 'center',
                borderRight: '1px solid #eee',
                background: isToday ? '#FFF8EE' : 'transparent'
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>
                  {JOURS_COURTS[i]}
                </div>
                <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 900, color: isToday ? OR : NOIR, marginTop: 2 }}>
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Grille heures x jours */}
        {hours.map(hour => (
          <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{
              width: 48,
              flexShrink: 0,
              padding: '8px 2px',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#bbb',
              borderRight: '1px solid #eee'
            }}>
              {`${hour}h`}
            </div>
            {days.map((day, i) => {
              const dayReservations = reservations.filter((r: any) => {
                const rd = new Date(r.date_rdv)
                return isSameDay(rd, day) && rd.getHours() === hour
              })
              const isToday = isSameDay(day, today)
              return (
                <div key={i} style={{
                  flex: 1,
                  padding: 2,
                  minHeight: 40,
                  borderRight: '1px solid #f8f8f8',
                  background: isToday ? 'rgba(184,146,42,0.03)' : 'transparent'
                }}>
                  {dayReservations.map((rdv: any, idx: number) => (
                    <div key={idx} style={{
                      background: '#FFF8EE',
                      borderLeft: `2px solid ${OR}`,
                      borderRadius: '0 3px 3px 0',
                      padding: '3px 4px',
                      marginBottom: 2,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: NOIR, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rdv.client_nom}</div>
                      <div style={{ fontSize: 9, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rdv.service_nom}</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Resume de la semaine */}
      <div style={{
        padding: '12px 16px',
        borderTop: '2px solid #eee',
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>
          {reservations.length} RDV cette semaine
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>
          {reservations.reduce((sum: number, r: any) => sum + (r.service_prix || 0), 0)} DA
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VUE MOIS
// ═══════════════════════════════════════════════════════════════════

function MonthView({ year, month, reservations, view }: { year: number; month: number; reservations: any[]; view: string }) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()

  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const countByDay: Record<number, number> = {}
  const revenueByDay: Record<number, number> = {}
  reservations.forEach((r: any) => {
    const d = new Date(r.date_rdv).getDate()
    countByDay[d] = (countByDay[d] || 0) + 1
    revenueByDay[d] = (revenueByDay[d] || 0) + (r.service_prix || 0)
  })

  const rows: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      {/* En-tete jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #eee', background: '#fafafa' }}>
        {JOURS_COURTS.map(j => (
          <div key={j} style={{
            padding: 'clamp(6px, 1.5vw, 12px) 4px',
            textAlign: 'center',
            fontSize: 'clamp(10px, 2vw, 12px)',
            fontWeight: 700,
            color: '#888',
            textTransform: 'uppercase'
          }}>
            {j}
          </div>
        ))}
      </div>

      {/* Cases du mois */}
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
          {row.map((cell, ci) => {
            if (!cell) {
              return <div key={ci} style={{ minHeight: 'clamp(60px, 12vw, 90px)', background: '#fafafa', borderRight: '1px solid #f0f0f0' }} />
            }
            const dayNum = cell.getDate()
            const count = countByDay[dayNum] || 0
            const revenue = revenueByDay[dayNum] || 0
            const isToday = isSameDay(cell, today)
            const isPast = cell < today && !isToday

            return (
              <Link
                key={ci}
                href={`/pro/agenda?view=day&date=${formatDateForUrl(cell)}`}
                style={{
                  minHeight: 'clamp(60px, 12vw, 90px)',
                  padding: 'clamp(4px, 1vw, 8px)',
                  borderRight: '1px solid #f0f0f0',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: isToday ? '#FFF8EE' : 'transparent',
                  opacity: isPast ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  fontSize: 'clamp(12px, 2.5vw, 16px)',
                  fontWeight: isToday ? 900 : 600,
                  color: isToday ? OR : NOIR,
                  marginBottom: 4,
                }}>
                  {dayNum}
                </div>
                {count > 0 && (
                  <div style={{
                    background: count >= 5 ? OR : '#f0ead6',
                    color: count >= 5 ? '#fff' : NOIR,
                    borderRadius: 3,
                    padding: 'clamp(2px, 0.5vw, 4px) clamp(3px, 1vw, 6px)',
                    fontSize: 'clamp(9px, 1.8vw, 11px)',
                    fontWeight: 700,
                    marginBottom: 2,
                    textAlign: 'center',
                  }}>
                    {count} RDV
                  </div>
                )}
                {revenue > 0 && (
                  <div style={{ fontSize: 'clamp(9px, 1.8vw, 11px)', fontWeight: 600, color: OR, textAlign: 'center' }}>
                    {revenue} DA
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      ))}

      {/* Resume du mois */}
      <div style={{
        padding: '12px 16px',
        borderTop: '2px solid #eee',
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>
          {reservations.length} RDV ce mois
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>
          {reservations.reduce((sum: number, r: any) => sum + (r.service_prix || 0), 0)} DA
        </span>
      </div>
    </div>
  )
}
