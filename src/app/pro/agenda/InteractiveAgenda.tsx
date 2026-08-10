'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'
const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getMonday(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatDateForUrl(d: Date) {
  return d.toISOString().split('T')[0]
}

type Props = {
  employes: any[];
  services: any[]; // Nouvel argument
  reservations: any[];
  view: 'day' | 'week' | 'month';
  targetDateStr: string;
}

export default function InteractiveAgenda({ employes, services, reservations, view, targetDateStr }: Props) {
  const router = useRouter()
  const targetDate = new Date(targetDateStr)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedEmploye, setSelectedEmploye] = useState(employes[0]?.id || '')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [selectedDate, setSelectedDate] = useState(targetDateStr.split('T')[0])
  
  const [clientName, setClientName] = useState('')
  // Nouveaux états pour la liste déroulante des prestations
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '')
  const [serviceName, setServiceName] = useState(services[0]?.nom || '')
  const [servicePrice, setServicePrice] = useState(services[0]?.prix?.toString() || '0')
  
  const [activeRdv, setActiveRdv] = useState<any>(null)

  const handleSlotClick = (empId: number, heure: string, dateObj: Date) => {
    setSelectedEmploye(empId)
    setSelectedTime(heure.length === 4 ? `0${heure}` : heure)
    setSelectedDate(dateObj.toISOString().split('T')[0])
    setClientName('')
    // Réinitialise avec le premier service de la base
    setSelectedServiceId(services[0]?.id || '')
    setServiceName(services[0]?.nom || '')
    setServicePrice(services[0]?.prix?.toString() || '0')
    setIsAddModalOpen(true)
  }

  const handleRdvClick = (e: React.MouseEvent, rdv: any) => {
    e.stopPropagation()
    setActiveRdv(rdv)
    setSelectedEmploye(rdv.employe_id)
    const dateObj = new Date(rdv.date_rdv)
    setSelectedDate(dateObj.toISOString().split('T')[0])
    setSelectedTime(dateObj.toTimeString().substring(0, 5))
    setIsEditModalOpen(true)
  }

  // Gère le changement de prestation dans la modale
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = Number(e.target.value)
    setSelectedServiceId(sId)
    const svc = services.find(s => s.id === sId)
    if (svc) {
      setServiceName(svc.nom)
      setServicePrice(svc.prix.toString())
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const dateRdv = `${selectedDate}T${selectedTime}:00`
    
    await fetch('/api/pro/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        employe_id: selectedEmploye, 
        client_nom: clientName, 
        service_id: selectedServiceId || null, 
        service_nom: serviceName, 
        service_prix: servicePrice, 
        date_rdv: dateRdv 
      })
    })
    
    setIsAddModalOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const dateRdv = `${selectedDate}T${selectedTime}:00`

    await fetch(`/api/pro/reservations/${activeRdv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employe_id: selectedEmploye, new_date_rdv: dateRdv })
    })
    
    setIsEditModalOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 11 }, (_, i) => i + 9)
    return (
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 500 }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #eee', background: '#fafafa' }}>
            <div style={{ width: 56, flexShrink: 0, padding: 10, borderRight: '1px solid #eee' }}></div>
            {employes.map((emp: any) => (
              <div key={emp.id} style={{ flex: 1, padding: '10px 4px', textAlign: 'center', fontWeight: 800, fontSize: 'clamp(11px, 2vw, 14px)', color: NOIR, borderRight: '1px solid #eee' }}>{emp.nom}</div>
            ))}
          </div>
          {hours.map(hour => (
            <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ width: 56, flexShrink: 0, padding: '12px 4px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#999', borderRight: '1px solid #eee' }}>{`${hour}:00`}</div>
              {employes.map((emp: any) => {
                const rdv = reservations.find((r: any) => new Date(r.date_rdv).getHours() === hour && r.employe_id === emp.id)
                return (
                  <div key={emp.id} onClick={() => handleSlotClick(emp.id, `${hour}:00`, targetDate)} style={{ flex: 1, padding: 6, minHeight: 48, borderRight: '1px solid #f5f5f5', background: rdv ? '#FFF8EE' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }} className="agenda-slot">
                    {rdv && (
                      <div onClick={(e) => handleRdvClick(e, rdv)} style={{ borderLeft: `3px solid ${OR}`, paddingLeft: 6, cursor: 'grab' }}>
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
        <div style={{ padding: '12px 16px', borderTop: '2px solid #eee', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>{reservations.length} rendez-vous</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>{reservations.reduce((sum: number, r: any) => sum + (r.service_prix || 0), 0)} DA</span>
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const hours = Array.from({ length: 11 }, (_, i) => i + 9)
    const monday = getMonday(targetDate)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      return d
    })
    const today = new Date()

    return (
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 600 }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #eee', background: '#fafafa' }}>
            <div style={{ width: 48, flexShrink: 0, padding: 8, borderRight: '1px solid #eee' }}></div>
            {days.map((day, i) => {
              const isToday = isSameDay(day, today)
              return (
                <div key={i} style={{ flex: 1, padding: '8px 2px', textAlign: 'center', borderRight: '1px solid #eee', background: isToday ? '#FFF8EE' : 'transparent' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>{JOURS_COURTS[i]}</div>
                  <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 900, color: isToday ? OR : NOIR, marginTop: 2 }}>{day.getDate()}</div>
                </div>
              )
            })}
          </div>
          {hours.map(hour => (
            <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ width: 48, flexShrink: 0, padding: '8px 2px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#bbb', borderRight: '1px solid #eee' }}>{`${hour}h`}</div>
              {days.map((day, i) => {
                const dayReservations = reservations.filter((r: any) => isSameDay(new Date(r.date_rdv), day) && new Date(r.date_rdv).getHours() === hour)
                const isToday = isSameDay(day, today)
                return (
                  <div key={i} onClick={() => handleSlotClick(employes[0]?.id || 1, `${hour}:00`, day)} style={{ flex: 1, padding: 2, minHeight: 40, borderRight: '1px solid #f8f8f8', background: isToday ? 'rgba(184,146,42,0.03)' : 'transparent', cursor: 'pointer' }} className="agenda-slot">
                    {dayReservations.map((rdv: any, idx: number) => (
                      <div key={idx} onClick={(e) => handleRdvClick(e, rdv)} style={{ background: '#FFF8EE', borderLeft: `2px solid ${OR}`, borderRadius: '0 3px 3px 0', padding: '3px 4px', marginBottom: 2, cursor: 'grab' }}>
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
        <div style={{ padding: '12px 16px', borderTop: '2px solid #eee', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>{reservations.length} RDV cette semaine</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>{reservations.reduce((sum: number, r: any) => sum + (r.service_prix || 0), 0)} DA</span>
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #eee', background: '#fafafa' }}>
          {JOURS_COURTS.map(j => (
            <div key={j} style={{ padding: 'clamp(6px, 1.5vw, 12px) 4px', textAlign: 'center', fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{j}</div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
            {row.map((cell, ci) => {
              if (!cell) return <div key={ci} style={{ minHeight: 'clamp(60px, 12vw, 90px)', background: '#fafafa', borderRight: '1px solid #f0f0f0' }} />
              const dayNum = cell.getDate()
              const count = countByDay[dayNum] || 0
              const revenue = revenueByDay[dayNum] || 0
              const isToday = isSameDay(cell, today)
              const isPast = cell < today && !isToday

              return (
                <Link key={ci} href={`/pro/agenda?view=day&date=${formatDateForUrl(cell)}`} style={{ minHeight: 'clamp(60px, 12vw, 90px)', padding: 'clamp(4px, 1vw, 8px)', borderRight: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit', background: isToday ? '#FFF8EE' : 'transparent', opacity: isPast ? 0.5 : 1, display: 'flex', flexDirection: 'column', transition: 'background 0.15s' }}>
                  <div style={{ fontSize: 'clamp(12px, 2.5vw, 16px)', fontWeight: isToday ? 900 : 600, color: isToday ? OR : NOIR, marginBottom: 4 }}>{dayNum}</div>
                  {count > 0 && <div style={{ background: count >= 5 ? OR : '#f0ead6', color: count >= 5 ? '#fff' : NOIR, borderRadius: 3, padding: 'clamp(2px, 0.5vw, 4px) clamp(3px, 1vw, 6px)', fontSize: 'clamp(9px, 1.8vw, 11px)', fontWeight: 700, marginBottom: 2, textAlign: 'center' }}>{count} RDV</div>}
                  {revenue > 0 && <div style={{ fontSize: 'clamp(9px, 1.8vw, 11px)', fontWeight: 600, color: OR, textAlign: 'center' }}>{revenue} DA</div>}
                </Link>
              )
            })}
          </div>
        ))}
        <div style={{ padding: '12px 16px', borderTop: '2px solid #eee', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>{reservations.length} RDV ce mois</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>{reservations.reduce((sum: number, r: any) => sum + (r.service_prix || 0), 0)} DA</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.agenda-slot:hover { background: #fdfdfd !important; }`}} />
      
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}

      {/* MODALE : AJOUTER UN RDV */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 450 }}>
            <h2 style={{ marginBottom: 24, color: NOIR, fontWeight: 900 }}>Bloquer un créneau</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <select value={selectedEmploye} onChange={e => setSelectedEmploye(Number(e.target.value))} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, width: '100%' }}>
                {employes.map(emp => <option key={emp.id} value={emp.id}>{emp.nom}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
                <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>
              <input type="text" placeholder="Nom du client (ou motif)" value={clientName} onChange={e => setClientName(e.target.value)} required style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
              
              <div style={{ display: 'flex', gap: 12 }}>
                {/* MENU DEROULANT DES PRESTATIONS */}
                <select 
                  value={selectedServiceId} 
                  onChange={handleServiceChange} 
                  required 
                  style={{ flex: 2, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                >
                  <option value="" disabled>Prestation</option>
                  {services.map(svc => (
                    <option key={svc.id} value={svc.id}>{svc.nom}</option>
                  ))}
                </select>
                <input type="number" placeholder="Prix DA" value={servicePrice} onChange={e => setServicePrice(e.target.value)} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} disabled={isLoading} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#666' }}>Annuler</button>
                <button type="submit" disabled={isLoading} style={{ flex: 1, padding: 14, background: NOIR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{isLoading ? '...' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : MODIFIER UN RDV */}
      {isEditModalOpen && activeRdv && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 450 }}>
            <h2 style={{ marginBottom: 8, color: NOIR, fontWeight: 900 }}>Modifier le rendez-vous</h2>
            <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Client : <strong style={{ color: NOIR }}>{activeRdv.client_nom}</strong></p>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Déplacer le créneau</label>
              <select value={selectedEmploye} onChange={e => setSelectedEmploye(Number(e.target.value))} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, width: '100%' }}>
                {employes.map(emp => <option key={emp.id} value={emp.id}>{emp.nom}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
                <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isLoading} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#666' }}>Annuler</button>
                <button type="submit" disabled={isLoading} style={{ flex: 1, padding: 14, background: OR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{isLoading ? '...' : 'Confirmer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
