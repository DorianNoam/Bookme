'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'
const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Plage horaire affichee dans l'agenda (9:00 -> 20:00)
const DAY_START_H = 9
const DAY_END_H = 20

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

function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '')
  // Deja au format international avec + → on enleve juste le +
  if (cleaned.startsWith('+')) return cleaned.slice(1)
  // Format 00XXX → on enleve les 00
  if (cleaned.startsWith('00')) return cleaned.slice(2)
  // Numeros locaux commencant par 0 → detection du pays par pattern
  if (cleaned.startsWith('0') && cleaned.length >= 9) {
    const afterZero = cleaned.slice(1)
    // Algerie : 05/06/07 + 8 chiffres = 10 chiffres total
    if (/^[567]\d{8}$/.test(afterZero)) return '213' + afterZero
    // France : 06/07/01/02/03/04/05/09 + 8 chiffres = 10 chiffres total
    if (/^[1-9]\d{8}$/.test(afterZero) && cleaned.length === 10) return '33' + afterZero
    // Tunisie : 0 + 8 chiffres = 9 chiffres total
    if (cleaned.length === 9) return '216' + afterZero
    // Maroc : 06/07/05 + 8 chiffres = 10 chiffres total
    return '212' + afterZero
  }
  // Deja un format international sans + ni 00
  return cleaned
}

// AAAA-MM-JJ en local (sans decalage de fuseau)
function toYMD(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// JJ/MM/AAAA a partir d'une chaine AAAA-MM-JJ
function formatFr(ymd: string) {
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}`
}

// Attribution de colonnes pour les RDV qui se chevauchent (meme employe / meme jour).
// Chaque event recoit .col (index de colonne) et .cols (nb total de colonnes de son groupe).
function assignColumns<T extends { _start: number; _end: number }>(events: T[]): (T & { col: number; cols: number })[] {
  const sorted = [...events].sort((a, b) => a._start - b._start || a._end - b._end) as (T & { col?: number; cols?: number })[]
  const result: (T & { col: number; cols: number })[] = []
  let cluster: (T & { col?: number; cols?: number })[] = []
  let clusterEnd = -Infinity

  const flush = () => {
    if (cluster.length === 0) return
    const colEnds: number[] = [] // derniere fin de chaque colonne
    for (const ev of cluster) {
      let placed = false
      for (let c = 0; c < colEnds.length; c++) {
        if (ev._start >= colEnds[c]) { ev.col = c; colEnds[c] = ev._end; placed = true; break }
      }
      if (!placed) { ev.col = colEnds.length; colEnds.push(ev._end) }
    }
    const total = colEnds.length
    for (const ev of cluster) { ev.cols = total; result.push(ev as T & { col: number; cols: number }) }
    cluster = []
    clusterEnd = -Infinity
  }

  for (const ev of sorted) {
    if (cluster.length && ev._start >= clusterEnd) flush()
    cluster.push(ev)
    clusterEnd = Math.max(clusterEnd, ev._end)
  }
  flush()
  return result
}

type Props = {
  employes: any[];
  services: any[];
  reservations: any[];
  view: 'day' | 'week' | 'month';
  targetDateStr: string;
  salonName: string;
  salonId: number;
  dateOuverture: string | null;
  fermetures: any[];
  isOwner: boolean;
}

export default function InteractiveAgenda({ employes, services, reservations, view, targetDateStr, salonName, salonId, dateOuverture, fermetures, isOwner }: Props) {
  const router = useRouter()
  const targetDate = new Date(targetDateStr)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false)
  const [ficheMode, setFicheMode] = useState<'fiche' | 'edit'>('fiche')
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedEmploye, setSelectedEmploye] = useState(employes[0]?.id || '')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [selectedDate, setSelectedDate] = useState(targetDateStr.split('T')[0])
  
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientTelephone, setClientTelephone] = useState('')
  
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '')
  const [serviceName, setServiceName] = useState(services[0]?.nom || '')
  const [servicePrice, setServicePrice] = useState(services[0]?.prix?.toString() || '0')
  
  const [activeRdv, setActiveRdv] = useState<any>(null)

  // --- Statut du salon (date d'ouverture + fermetures) ---
  const [showStatut, setShowStatut] = useState(false)
  const [statutLoading, setStatutLoading] = useState(false)
  const [ouvertureInput, setOuvertureInput] = useState(dateOuverture || '')
  const [fDebut, setFDebut] = useState('')
  const [fFin, setFFin] = useState('')
  const [fMotif, setFMotif] = useState('')

  // Duree d'un RDV en minutes. Cherche plusieurs champs possibles, sinon 30 min par defaut.
  const getDuree = (rdv: any): number => {
    const direct = Number(rdv.duree ?? rdv.duree_min ?? rdv.duration ?? rdv.service_duree ?? 0)
    if (direct > 0) return direct
    const svc = services.find((s: any) => s.id === rdv.service_id || s.nom === rdv.service_nom)
    const sd = svc ? Number(svc.duree ?? svc.duree_min ?? svc.duration ?? 0) : 0
    if (sd > 0) return sd
    return 30
  }

  // Un jour est-il ferme ? (avant ouverture OU dans une plage de fermeture)
  const getClosure = (d: Date): { closed: boolean; reason: string } => {
    const ymd = toYMD(d)
    if (dateOuverture && ymd < dateOuverture) return { closed: true, reason: 'Avant ouverture' }
    for (const f of fermetures) {
      if (ymd >= f.date_debut && ymd <= f.date_fin) return { closed: true, reason: f.motif || 'Ferme' }
    }
    return { closed: false, reason: '' }
  }

  const saveOuverture = async () => {
    setStatutLoading(true)
    await fetch('/api/pro/statut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ouverture', date: ouvertureInput || null })
    })
    setStatutLoading(false)
    router.refresh()
  }

  const addFermeture = async () => {
    if (!fDebut || !fFin) { alert('Choisis une date de debut et une date de fin.'); return }
    if (fFin < fDebut) { alert('La date de fin doit etre apres la date de debut.'); return }
    setStatutLoading(true)
    await fetch('/api/pro/statut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_fermeture', date_debut: fDebut, date_fin: fFin, motif: fMotif || null })
    })
    setFDebut(''); setFFin(''); setFMotif('')
    setStatutLoading(false)
    router.refresh()
  }

  const deleteFermeture = async (id: number) => {
    if (!confirm('Supprimer cette periode de fermeture ?')) return
    setStatutLoading(true)
    await fetch('/api/pro/statut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_fermeture', id })
    })
    setStatutLoading(false)
    router.refresh()
  }

  const handleSlotClick = (empId: number, heure: string, dateObj: Date) => {
    setSelectedEmploye(empId)
    setSelectedTime(heure.length === 4 ? `0${heure}` : heure)
    setSelectedDate(dateObj.toISOString().split('T')[0])
    setClientName('')
    setClientEmail('')
    setClientTelephone('')
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
    setFicheMode('fiche')
    setIsFicheModalOpen(true)
  }

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
        client_email: clientEmail || null,
        client_telephone: clientTelephone || null,
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
    
    setIsFicheModalOpen(false)
    setFicheMode('fiche')
    setIsLoading(false)
    router.refresh()
  }

  function buildWhatsAppMessage(rdv: any): string {
    const dateObj = new Date(rdv.date_rdv)
    const dateStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeStr = String(dateObj.getHours()).padStart(2, '0') + 'h' + String(dateObj.getMinutes()).padStart(2, '0')
    const clientFirstName = rdv.client_prenom || rdv.client_nom
    const msg = `Bonjour ${clientFirstName}, je vous confirme votre RDV du ${dateStr} à ${timeStr} chez ${salonName} pour ${rdv.service_nom}. À bientôt !`
    return encodeURIComponent(msg)
  }

  // ═══════════════════════════════════════════════════════════
  // VUE JOUR — positionnement proportionnel (heure + duree)
  // ═══════════════════════════════════════════════════════════
  const renderDayView = () => {
    const startH = DAY_START_H
    const hoursCount = DAY_END_H - startH
    const HOUR_H = 64
    const bodyHeight = hoursCount * HOUR_H
    const nbSlots = hoursCount * 2 // creneaux de 30 min

    return (
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 500 }}>
          {/* Header employes */}
          <div style={{ display: 'flex', borderBottom: '2px solid #eee', background: '#fafafa' }}>
            <div style={{ width: 56, flexShrink: 0, borderRight: '1px solid #eee' }} />
            {employes.map((emp: any) => (
              <div key={emp.id} style={{ flex: 1, padding: '10px 4px', textAlign: 'center', fontWeight: 800, fontSize: 'clamp(11px, 2vw, 14px)', color: NOIR, borderRight: '1px solid #eee' }}>{emp.nom}</div>
            ))}
          </div>

          {/* Corps */}
          <div style={{ display: 'flex' }}>
            {/* Gouttiere des heures */}
            <div style={{ width: 56, flexShrink: 0, position: 'relative', height: bodyHeight, borderRight: '1px solid #eee', background: '#fafafa' }}>
              {Array.from({ length: hoursCount }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: i * HOUR_H, left: 0, right: 0, padding: '2px 6px 0 0', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#999' }}>
                  {`${startH + i}:00`}
                </div>
              ))}
            </div>

            {/* Colonnes employes */}
            {employes.map((emp: any) => {
              const empRes = reservations
                .filter((r: any) => r.employe_id === emp.id)
                .map((r: any) => {
                  const d = new Date(r.date_rdv)
                  const start = d.getHours() * 60 + d.getMinutes()
                  return { ...r, _start: start, _end: start + getDuree(r) }
                })
              const laid = assignColumns(empRes)

              return (
                <div key={emp.id} style={{ flex: 1, position: 'relative', height: bodyHeight, borderRight: '1px solid #f5f5f5' }}>
                  {/* Creneaux cliquables (fond) + lignes de repere */}
                  {Array.from({ length: nbSlots }).map((_, i) => {
                    const h = startH + Math.floor(i / 2)
                    const m = i % 2 === 0 ? 0 : 30
                    const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                    return (
                      <div key={i} onClick={() => handleSlotClick(emp.id, t, targetDate)} className="agenda-slot"
                        style={{ position: 'absolute', left: 0, right: 0, top: i * (HOUR_H / 2), height: HOUR_H / 2, borderTop: m === 0 ? '1px solid #eee' : '1px dashed #f2f2f2', cursor: 'pointer' }} />
                    )
                  })}

                  {/* Rendez-vous positionnes */}
                  {laid.map((rdv: any, idx: number) => {
                    let top = ((rdv._start - startH * 60) / 60) * HOUR_H
                    let h = ((rdv._end - rdv._start) / 60) * HOUR_H
                    if (top < 0) { h += top; top = 0 }
                    if (top >= bodyHeight) return null
                    if (top + h > bodyHeight) h = bodyHeight - top
                    h = Math.max(h, 22)

                    const gap = 3
                    const wPct = 100 / rdv.cols
                    const left = `calc(${rdv.col * wPct}% + ${gap}px)`
                    const width = `calc(${wPct}% - ${2 * gap}px)`

                    const showService = h >= 42
                    const showPrice = h >= 58
                    const d = new Date(rdv.date_rdv)
                    const timeLabel = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')

                    return (
                      <div key={idx} onClick={(e) => handleRdvClick(e, rdv)}
                        style={{ position: 'absolute', top, height: h, left, width, background: '#FFF8EE', borderLeft: `3px solid ${OR}`, borderRadius: '0 4px 4px 0', padding: showService ? '4px 6px' : '2px 6px', overflow: 'hidden', cursor: 'grab', zIndex: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: NOIR, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{rdv.client_nom}</div>
                        {showService && <div style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{rdv.service_nom}</div>}
                        {showPrice && <div style={{ fontSize: 11, fontWeight: 700, color: OR, lineHeight: 1.3 }}>{timeLabel} · {rdv.service_prix} DA</div>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '2px solid #eee', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>{reservations.length} rendez-vous</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: OR }}>{reservations.reduce((sum: number, r: any) => sum + (r.service_prix || 0), 0)} DA</span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // VUE SEMAINE — positionnement proportionnel par jour
  // ═══════════════════════════════════════════════════════════
  const renderWeekView = () => {
    const startH = DAY_START_H
    const hoursCount = DAY_END_H - startH
    const HOUR_H = 48
    const bodyHeight = hoursCount * HOUR_H
    const nbSlots = hoursCount * 2
    const monday = getMonday(targetDate)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      return d
    })
    const today = new Date()

    return (
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 640 }}>
          {/* Header jours */}
          <div style={{ display: 'flex', borderBottom: '2px solid #eee', background: '#fafafa' }}>
            <div style={{ width: 44, flexShrink: 0, borderRight: '1px solid #eee' }} />
            {days.map((day, i) => {
              const isToday = isSameDay(day, today)
              const clo = getClosure(day)
              return (
                <div key={i} style={{ flex: 1, padding: '8px 2px', textAlign: 'center', borderRight: '1px solid #eee', background: clo.closed ? '#fdf0f0' : isToday ? '#FFF8EE' : 'transparent' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>{JOURS_COURTS[i]}</div>
                  <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 900, color: clo.closed ? '#c0392b' : isToday ? OR : NOIR, marginTop: 2 }}>{day.getDate()}</div>
                  {clo.closed && <div style={{ fontSize: 8, fontWeight: 700, color: '#c0392b', textTransform: 'uppercase' }}>Ferme</div>}
                </div>
              )
            })}
          </div>

          {/* Corps */}
          <div style={{ display: 'flex' }}>
            {/* Gouttiere des heures */}
            <div style={{ width: 44, flexShrink: 0, position: 'relative', height: bodyHeight, borderRight: '1px solid #eee', background: '#fafafa' }}>
              {Array.from({ length: hoursCount }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: i * HOUR_H, left: 0, right: 0, padding: '2px 4px 0 0', textAlign: 'right', fontSize: 10, fontWeight: 600, color: '#bbb' }}>{`${startH + i}h`}</div>
              ))}
            </div>

            {/* Colonnes jours */}
            {days.map((day, di) => {
              const isToday = isSameDay(day, today)
              const clo = getClosure(day)
              const dayRes = reservations
                .filter((r: any) => isSameDay(new Date(r.date_rdv), day))
                .map((r: any) => {
                  const d = new Date(r.date_rdv)
                  const start = d.getHours() * 60 + d.getMinutes()
                  return { ...r, _start: start, _end: start + getDuree(r) }
                })
              const laid = assignColumns(dayRes)

              return (
                <div key={di} style={{ flex: 1, position: 'relative', height: bodyHeight, borderRight: '1px solid #f8f8f8', background: clo.closed ? 'rgba(192,57,43,0.04)' : isToday ? 'rgba(184,146,42,0.03)' : 'transparent' }}>
                  {/* Creneaux cliquables + lignes de repere */}
                  {Array.from({ length: nbSlots }).map((_, i) => {
                    const h = startH + Math.floor(i / 2)
                    const m = i % 2 === 0 ? 0 : 30
                    const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                    return (
                      <div key={i} onClick={() => handleSlotClick(employes[0]?.id || 1, t, day)} className="agenda-slot"
                        style={{ position: 'absolute', left: 0, right: 0, top: i * (HOUR_H / 2), height: HOUR_H / 2, borderTop: m === 0 ? '1px solid #f0f0f0' : '1px dashed #f6f6f6', cursor: 'pointer' }} />
                    )
                  })}

                  {/* Rendez-vous positionnes */}
                  {laid.map((rdv: any, idx: number) => {
                    let top = ((rdv._start - startH * 60) / 60) * HOUR_H
                    let hh = ((rdv._end - rdv._start) / 60) * HOUR_H
                    if (top < 0) { hh += top; top = 0 }
                    if (top >= bodyHeight) return null
                    if (top + hh > bodyHeight) hh = bodyHeight - top
                    hh = Math.max(hh, 18)

                    const gap = 2
                    const wPct = 100 / rdv.cols
                    const left = `calc(${rdv.col * wPct}% + ${gap}px)`
                    const width = `calc(${wPct}% - ${2 * gap}px)`
                    const showService = hh >= 34

                    return (
                      <div key={idx} onClick={(e) => handleRdvClick(e, rdv)}
                        style={{ position: 'absolute', top, height: hh, left, width, background: '#FFF8EE', borderLeft: `2px solid ${OR}`, borderRadius: '0 3px 3px 0', padding: '2px 4px', overflow: 'hidden', cursor: 'grab', zIndex: 5, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: NOIR, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.15 }}>{rdv.client_nom}</div>
                        {showService && <div style={{ fontSize: 9, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.15 }}>{rdv.service_nom}</div>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
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
              const clo = getClosure(cell)

              return (
                <Link key={ci} href={`/pro/agenda?view=day&date=${formatDateForUrl(cell)}`} style={{ minHeight: 'clamp(60px, 12vw, 90px)', padding: 'clamp(4px, 1vw, 8px)', borderRight: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit', background: clo.closed ? '#fdf0f0' : isToday ? '#FFF8EE' : 'transparent', opacity: isPast ? 0.5 : 1, display: 'flex', flexDirection: 'column', transition: 'background 0.15s' }}>
                  <div style={{ fontSize: 'clamp(12px, 2.5vw, 16px)', fontWeight: isToday ? 900 : 600, color: clo.closed ? '#c0392b' : isToday ? OR : NOIR, marginBottom: 4 }}>{dayNum}</div>
                  {clo.closed && <div style={{ background: '#fdecec', color: '#c0392b', borderRadius: 3, padding: '1px 4px', fontSize: 'clamp(8px, 1.6vw, 10px)', fontWeight: 700, textAlign: 'center', marginBottom: 2 }}>Ferme</div>}
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

  // Statut du jour (pour la pastille de l'encart)
  const nowClosure = getClosure(new Date())
  const notYetOpen = dateOuverture ? toYMD(new Date()) < dateOuverture : false
  let statusLabel = 'Ouvert'
  let statusColor = '#1baf7a'
  if (notYetOpen) {
    statusLabel = `Ouverture le ${formatFr(dateOuverture as string)}`
    statusColor = '#eda100'
  } else if (nowClosure.closed) {
    statusLabel = `Ferme aujourd'hui${nowClosure.reason ? ' — ' + nowClosure.reason : ''}`
    statusColor = '#d32f2f'
  }

  // Bandeau de fermeture pour la vue Jour
  const dayClosure = view === 'day' ? getClosure(targetDate) : { closed: false, reason: '' }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.agenda-slot:hover { background: #fdfdfd !important; }`}} />

      {/* ═══ ENCART : STATUT DU SALON (patron uniquement) ═══ */}
      {isOwner && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 16, overflow: 'hidden' }}>
          <button
            onClick={() => setShowStatut(v => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3vw, 20px)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 800, color: NOIR }}>Statut du salon</div>
                <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{statusLabel}</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: OR, flexShrink: 0 }}>{showStatut ? 'Fermer' : 'Gerer'}</span>
          </button>

          {showStatut && (
            <div style={{ padding: 'clamp(14px, 3vw, 20px)', borderTop: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Date d'ouverture */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{"Date d'ouverture"}</div>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                  {"Tant que cette date n'est pas atteinte, aucun creneau n'est reservable par les clients. Laisse vide si le salon est deja ouvert."}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input type="date" value={ouvertureInput} onChange={e => setOuvertureInput(e.target.value)} style={{ flex: 1, minWidth: 150, padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
                  <button onClick={saveOuverture} disabled={statutLoading} style={{ padding: '10px 18px', background: NOIR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
                  {ouvertureInput && (
                    <button onClick={() => setOuvertureInput('')} disabled={statutLoading} style={{ padding: '10px 14px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Effacer</button>
                  )}
                </div>
              </div>

              {/* Fermetures exceptionnelles */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Fermetures exceptionnelles</div>

                {fermetures.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#bbb', margin: '0 0 12px 0' }}>Aucune fermeture programmee.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {fermetures.map((f: any) => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', background: '#faf8f4', borderRadius: 8, borderLeft: `3px solid ${OR}` }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NOIR }}>
                            {f.date_debut === f.date_fin ? formatFr(f.date_debut) : `${formatFr(f.date_debut)} au ${formatFr(f.date_fin)}`}
                          </div>
                          {f.motif && <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.motif}</div>}
                        </div>
                        <button onClick={() => deleteFermeture(f.id)} disabled={statutLoading} style={{ flexShrink: 0, padding: '6px 12px', background: '#fff', color: '#d32f2f', border: '1px solid #f0d0d0', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Supprimer</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire d'ajout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#fafafa', padding: 12, borderRadius: 8 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 130 }}>
                      <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Du</label>
                      <input type="date" value={fDebut} onChange={e => { setFDebut(e.target.value); if (!fFin || fFin < e.target.value) setFFin(e.target.value) }} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 130 }}>
                      <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Au</label>
                      <input type="date" value={fFin} min={fDebut} onChange={e => setFFin(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
                    </div>
                  </div>
                  <input type="text" placeholder="Motif (optionnel) : conges, travaux..." value={fMotif} onChange={e => setFMotif(e.target.value)} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
                  <button onClick={addFermeture} disabled={statutLoading} style={{ padding: 12, background: OR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{statutLoading ? '...' : '+ Ajouter la fermeture'}</button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Bandeau : jour ferme (vue Jour) */}
      {dayClosure.closed && (
        <div style={{ background: '#fff4f4', border: '1px solid #f3c0c0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#b3261e' }}>
            {`Salon ferme ce jour${dayClosure.reason ? ' — ' + dayClosure.reason : ''}. Les clients ne peuvent pas reserver.`}
          </div>
        </div>
      )}

      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}

      {/* MODALE : AJOUTER UN RDV */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 450 }}>
            <h2 style={{ marginBottom: 24, color: NOIR, fontWeight: 900 }}>Bloquer un creneau</h2>
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
                <input type="email" placeholder="Email du client (optionnel)" value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
                <input type="tel" placeholder="Tel (optionnel)" value={clientTelephone} onChange={e => setClientTelephone(e.target.value)} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>
              <p style={{ fontSize: 11, color: '#999', margin: '-8px 0 0 0' }}>Si renseignes, le client recevra un rappel automatique avant son RDV.</p>

              <div style={{ display: 'flex', gap: 12 }}>
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

      {/* MODALE : FICHE CLIENT + MODIFIER */}
      {isFicheModalOpen && activeRdv && (
        <div
          onClick={() => { setIsFicheModalOpen(false); setFicheMode('fiche') }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div style={{
              background: NOIR, color: '#fff', padding: '20px 24px', borderRadius: '12px 12px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {activeRdv.client_prenom ? `${activeRdv.client_prenom} ${activeRdv.client_nom}` : activeRdv.client_nom}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  {ficheMode === 'fiche' ? 'Fiche client' : 'Modifier le creneau'}
                </div>
              </div>
              <button
                onClick={() => { setIsFicheModalOpen(false); setFicheMode('fiche') }}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Contenu : Mode FICHE */}
            {ficheMode === 'fiche' && (
              <div style={{ padding: 24 }}>

                {/* Contact */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Contact</div>

                  {activeRdv.client_telephone ? (
                    <a href={`tel:${activeRdv.client_telephone}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      background: '#f8f8f8', borderRadius: 8, textDecoration: 'none', color: NOIR, marginBottom: 8
                    }}>
                      <span style={{ fontSize: 18 }}>📞</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{activeRdv.client_telephone}</span>
                    </a>
                  ) : (
                    <div style={{ padding: '10px 14px', background: '#f8f8f8', borderRadius: 8, color: '#bbb', fontSize: 13, marginBottom: 8 }}>
                      Pas de telephone renseigne
                    </div>
                  )}

                  {activeRdv.client_email ? (
                    <a href={`mailto:${activeRdv.client_email}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      background: '#f8f8f8', borderRadius: 8, textDecoration: 'none', color: NOIR, marginBottom: 8
                    }}>
                      <span style={{ fontSize: 18 }}>✉️</span>
                      <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeRdv.client_email}</span>
                    </a>
                  ) : (
                    <div style={{ padding: '10px 14px', background: '#f8f8f8', borderRadius: 8, color: '#bbb', fontSize: 13, marginBottom: 8 }}>
                      {"Pas d'email renseigne"}
                    </div>
                  )}
                </div>

                {/* Prestation */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Prestation</div>
                  <div style={{ padding: 14, background: '#faf8f4', borderRadius: 8, borderLeft: `3px solid ${OR}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NOIR, marginBottom: 4 }}>{activeRdv.service_nom}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: OR }}>{activeRdv.service_prix?.toLocaleString()} DA</div>
                  </div>
                </div>

                {/* Date & Heure */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Date et heure</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: NOIR }}>
                    {(() => {
                      const d = new Date(activeRdv.date_rdv)
                      const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      const timeStr = String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0')
                      return `${dateStr} à ${timeStr}`
                    })()}
                  </div>
                </div>

                {/* Bouton WhatsApp */}
                {activeRdv.client_telephone && (
                  
                    href={`https://wa.me/${formatPhoneForWhatsApp(activeRdv.client_telephone)}?text=${buildWhatsAppMessage(activeRdv)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      width: '100%', padding: 14, background: '#25D366', color: '#fff', border: 'none',
                      borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', cursor: 'pointer', marginBottom: 10
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contacter sur WhatsApp
                  </a>
                )}

                {/* Bouton Appeler */}
                {activeRdv.client_telephone && (
                  
                    href={`tel:${activeRdv.client_telephone}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: 12, background: '#fff', color: NOIR,
                      border: `2px solid ${NOIR}`, borderRadius: 8, fontSize: 14, fontWeight: 700,
                      textDecoration: 'none', cursor: 'pointer', marginBottom: 10
                    }}
                  >
                    📞 Appeler
                  </a>
                )}

                {/* Bouton Modifier */}
                <button
                  onClick={() => setFicheMode('edit')}
                  style={{
                    width: '100%', padding: 12, background: '#f5f5f5', color: '#666',
                    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  ✏️ Modifier le creneau
                </button>
              </div>
            )}

            {/* Contenu : Mode EDIT */}
            {ficheMode === 'edit' && (
              <div style={{ padding: 24 }}>
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Deplacer le creneau</label>
                  <select value={selectedEmploye} onChange={e => setSelectedEmploye(Number(e.target.value))} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, width: '100%' }}>
                    {employes.map(emp => <option key={emp.id} value={emp.id}>{emp.nom}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
                    <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button type="button" onClick={() => setFicheMode('fiche')} disabled={isLoading} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#666' }}>← Retour</button>
                    <button type="submit" disabled={isLoading} style={{ flex: 1, padding: 14, background: OR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{isLoading ? '...' : 'Confirmer'}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
