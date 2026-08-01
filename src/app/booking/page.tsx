'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

type Salon = { id: number; nom: string; adresse: string; ville: string; image: string; jour_off?: number }
type Service = { id: number; nom: string; prix: number; duree: number }
type Creneau = { heure: string; emp_id: number }

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const salonId = searchParams.get('salon')
  const serviceId = searchParams.get('service')

  const [salon, setSalon] = useState<Salon | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [step, setStep] = useState(1)
  
  // États du calendrier
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [date, setDate] = useState('')
  
  // États des créneaux
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [ferme, setFerme] = useState(false)
  const [selectedCreneau, setSelectedCreneau] = useState<Creneau | null>(null)
  
  // États client
  const [clientNom, setClientNom] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientTelephone, setClientTelephone] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [loadingCreneaux, setLoadingCreneaux] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!salonId || !serviceId) return
    fetch('/api/salons/' + salonId)
      .then(r => r.json())
      .then(data => {
        setSalon(data.salon)
        const srv = (data.services || []).find((s: Service) => s.id === parseInt(serviceId))
        setService(srv || null)
        setLoading(false)
      })
  }, [salonId, serviceId])

  async function fetchCreneaux(d: string) {
    setLoadingCreneaux(true)
    setCreneaux([])
    setSelectedCreneau(null)
    try {
      const params = new URLSearchParams()
      params.set('salon_id', salonId!)
      params.set('service_id', serviceId!)
      params.set('date', d)
      const res = await fetch('/api/reservations/creneaux?' + params.toString())
      const data = await res.json()
      setCreneaux(data.creneaux || [])
      setFerme(data.ferme || false)
    } catch {
      setCreneaux([])
    } finally {
      setLoadingCreneaux(false)
      // Si on est à l'étape 1 et qu'on a cliqué sur une date, on passe à l'étape 2 automatiquement
      if (step === 1) setStep(2) 
    }
  }

  function handleDateSelect(dateObj: Date) {
    // Formatage YYYY-MM-DD robuste
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const d = String(dateObj.getDate()).padStart(2, '0')
    const formattedDate = `${y}-${m}-${d}`
    
    setDate(formattedDate)
    fetchCreneaux(formattedDate)
  }

  function handleCreneauSelect(c: Creneau) {
    setSelectedCreneau(c)
    setStep(3)
  }

  async function handleConfirm() {
    if (!clientNom.trim() || !clientEmail.trim() || !clientTelephone.trim()) { 
      setError('Veuillez remplir tous vos identifiants de contact.')
      return 
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salon_id: parseInt(salonId!),
          service_id: parseInt(serviceId!),
          employe_id: selectedCreneau!.emp_id,
          date_rdv: date + 'T' + selectedCreneau!.heure + ':00',
          client_nom: clientNom.trim(),
          client_email: clientEmail.trim(),
          client_telephone: clientTelephone.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Erreur lors de la réservation.')
      }
    } catch {
      setError('Erreur de connexion.')
    } finally {
      setSubmitting(false)
    }
  }

  // --- LOGIQUE DU CALENDRIER ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Lundi comme 1er jour

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  function formatDateFr(d: string) {
    if (!d) return ''
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', opts)
  }

  // --- RENDU ---
  if (!salonId || !serviceId) return (
    <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#888', marginBottom: 20 }}>Paramètres manquants.</p>
      <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>Retour à la recherche</Link>
    </div>
  )

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#999' }}>Chargement...</div>
  
  if (success) return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '50px 40px' }}>
          <div style={{ fontSize: 50, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: NOIR, marginBottom: 10 }}>Réservation confirmée !</h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 30, lineHeight: 1.6 }}>Votre rendez-vous au {salon?.nom} a été enregistré avec succès.</p>
          <Link href="/search" style={{ display: 'inline-block', background: NOIR, color: '#fff', padding: '12px 28px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Retour à la recherche</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>
      
      {/* HEADER SIMPLE */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0', marginBottom: 30 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <Link href={'/salon/' + salonId} style={{ color: '#777', fontSize: 14, textDecoration: 'none' }}>← Retour au salon</Link>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
        
        {/* RÉSUMÉ PRESTATION */}
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: NOIR }}>{salon?.nom}</div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>📍 {salon?.adresse}, {salon?.ville}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: NOIR }}>{service?.nom}</div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{service?.duree} min</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: OR, marginTop: 4 }}>{service?.prix ? service.prix.toLocaleString() + ' DA' : 'Sur devis'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr' : '1fr 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* COLONNE GAUCHE : CALENDRIER (Caché si étape 3) */}
          {step < 3 && (
            <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>1. Choisissez une date</h2>
              
              {/* Navigation Mois */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={prevMonth} disabled={currentMonth <= new Date(today.getFullYear(), today.getMonth(), 1)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: currentMonth <= new Date(today.getFullYear(), today.getMonth(), 1) ? 'default' : 'pointer', color: currentMonth <= new Date(today.getFullYear(), today.getMonth(), 1) ? '#ccc' : NOIR }}>◀</button>
                <div style={{ fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: NOIR }}>▶</button>
              </div>

              {/* Jours de la semaine */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, textAlign: 'center', marginBottom: 10 }}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                  <div key={d} style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' }}>{d}</div>
                ))}
              </div>

              {/* Grille des jours */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
                {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const isPast = dateObj < today
                  
                  // Format YYYY-MM-DD pour la comparaison
                  const y = dateObj.getFullYear()
                  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
                  const d = String(dateObj.getDate()).padStart(2, '0')
                  const dateStr = `${y}-${m}-${d}`
                  
                  const isSelected = date === dateStr

                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      onClick={() => handleDateSelect(dateObj)}
                      style={{
                        padding: '10px 0',
                        borderRadius: 4,
                        border: isSelected ? `2px solid ${OR}` : isPast ? '1px solid transparent' : '1px solid #E0D8CE',
                        background: isSelected ? OR : isPast ? '#f9f9f9' : '#fff',
                        color: isSelected ? '#fff' : isPast ? '#ccc' : NOIR,
                        cursor: isPast ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                        fontSize: 14,
                        transition: 'all 0.2s'
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* COLONNE DROITE : CRÉNEAUX (Caché si étape 3) */}
          {step === 2 && (
            <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px', animation: 'fadeIn 0.3s ease-in-out' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 8 }}>2. Heure du rendez-vous</h2>
              <div style={{ color: OR, fontSize: 13, fontWeight: 600, marginBottom: 20, textTransform: 'capitalize' }}>
                {formatDateFr(date)}
              </div>

              {loadingCreneaux ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 14 }}>Recherche des disponibilités...</div>
              ) : ferme ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#FFF4F4', borderRadius: 4, color: '#D32F2F', fontSize: 14 }}>
                  Le salon est fermé à cette date.
                </div>
              ) : creneaux.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#F9F9F9', borderRadius: 4, color: '#888', fontSize: 14 }}>
                  Plus aucun créneau disponible pour ce jour.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
                  {creneaux.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleCreneauSelect(c)}
                      style={{ 
                        padding: '12px 0', 
                        border: '1px solid #E0D8CE', 
                        borderRadius: 4, 
                        background: '#fff', 
                        color: NOIR, 
                        fontWeight: 700, 
                        fontSize: 14, 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = OR; e.currentTarget.style.color = OR }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E0D8CE'; e.currentTarget.style.color = NOIR }}
                    >
                      {c.heure}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ÉTAPE 3 — COORDONNÉES ET CONFIRMATION (Prend toute la largeur) */}
        {step === 3 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '40px', animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, margin: 0 }}>3. Vos coordonnées</h2>
              <button onClick={() => setStep(2)} style={{ color: OR, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ← Modifier la date/heure
              </button>
            </div>

            <div style={{ background: BG, borderRadius: 4, padding: '20px', marginBottom: 30, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Date du rendez-vous</div>
                <div style={{ fontWeight: 700, color: NOIR, textTransform: 'capitalize' }}>{formatDateFr(date)} à {selectedCreneau?.heure}</div>
              </div>
            </div>

            <div style={{ marginBottom: 24, textAlign: 'center', padding: '15px', background: '#FDFBF7', borderRadius: '4px', border: `1px dashed ${OR}40` }}>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Vous avez déjà un compte client ?</p>
              <Link href={`/login?redirect=/booking?salon=${salonId}&service=${serviceId}`} style={{ display: 'inline-block', color: OR, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                Se connecter pour aller plus vite
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Nom complet</label>
                <input value={clientNom} onChange={e => setClientNom(e.target.value)} placeholder="Ex: Amina Belkacem" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 15 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Email</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="amina@email.dz" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 15 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Téléphone</label>
                <input type="tel" value={clientTelephone} onChange={e => setClientTelephone(e.target.value)} placeholder="0555 12 34 56" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 15 }} />
              </div>
            </div>

            {error && <div style={{ background: '#FFF0F0', color: '#d32f2f', padding: '12px 16px', borderRadius: 4, fontSize: 14, marginBottom: 20, fontWeight: 500 }}>{error}</div>}

            <button onClick={handleConfirm} disabled={submitting} style={{ width: '100%', padding: '16px 0', background: submitting ? '#999' : NOIR, color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {submitting ? 'Enregistrement en cours...' : 'Confirmer le rendez-vous'}
            </button>
          </div>
        )}
      </div>
      
      {/* Animation d'apparition */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement du tunnel de réservation...</div>}>
      <BookingContent />
    </Suspense>
  )
}
