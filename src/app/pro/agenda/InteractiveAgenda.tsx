'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'
const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

type Props = {
  employes: any[];
  reservations: any[];
  view: 'day' | 'week' | 'month';
  targetDateStr: string;
}

export default function InteractiveAgenda({ employes, reservations, view, targetDateStr }: Props) {
  const router = useRouter()
  const targetDate = new Date(targetDateStr)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedEmploye, setSelectedEmploye] = useState(employes[0]?.id || 1)
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [selectedDate, setSelectedDate] = useState(targetDateStr.split('T')[0])
  
  const [clientName, setClientName] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [activeRdv, setActiveRdv] = useState<any>(null)

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const handleSlotClick = (empId: number, heure: string, dateObj: Date) => {
    setSelectedEmploye(empId)
    setSelectedTime(heure.length === 4 ? `0${heure}` : heure)
    setSelectedDate(dateObj.toISOString().split('T')[0])
    setClientName('')
    setServiceName('')
    setServicePrice('')
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const dateRdv = `${selectedDate}T${selectedTime}:00`
    
    await fetch('/api/pro/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employe_id: selectedEmploye, client_nom: clientName, service_nom: serviceName, service_prix: servicePrice, date_rdv: dateRdv })
    })
    
    setIsAddModalOpen(false)
    setIsLoading(false)
    router.refresh() // Rafraîchit les données du Server Component
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const dateRdv = `${selectedDate}T${selectedTime}:00`

    await fetch(`/api/pro/reservations/${activeRdv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employe_id: selectedEmploye, date_rdv: dateRdv })
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

  // J'ai conservé la logique d'appel conditionnel pour tes vues
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.agenda-slot:hover { background: #fdfdfd !important; }`}} />
      
      {view === 'day' && renderDayView()}
      {/* On réintégrera le renderWeekView et renderMonthView avec la même logique onClick ensuite */}

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
                <input type="text" placeholder="Prestation" value={serviceName} onChange={e => setServiceName(e.target.value)} required style={{ flex: 2, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
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
