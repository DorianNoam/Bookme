'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

type Salon = { id: number; nom: string; adresse: string; ville: string; image: string; jour_off?: number; ouverture?: string; fermeture?: string }
type Service = { id: number; nom: string; prix: number; duree: number }
type Creneau = { heure: string; emp_id: number }
type UserInfo = { id: number; prenom: string; nom: string; email: string; telephone: string }

function generateAllSlots(startStr = "09:00", endStr = "19:00") {
  const slots = []
  let [h, m] = startStr.substring(0, 5).split(':').map(Number)
  const [endH, endM] = endStr.substring(0, 5).split(':').map(Number)
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    m += 30
    if (m >= 60) { h += 1; m -= 60 }
  }
  return slots
}

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const salonId = searchParams.get('salon')
  const serviceId = searchParams.get('service')

  const [salon, setSalon] = useState<Salon | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [step, setStep] = useState(1)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [date, setDate] = useState('')

  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [ferme, setFerme] = useState(false)
  const [selectedCreneau, setSelectedCreneau] = useState<Creneau | null>(null)

  // ── Client info ──
  const [loggedUser, setLoggedUser] = useState<UserInfo | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [clientNom, setClientNom] = useState('')
  const [clientPrenom, setClientPrenom] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientTelephone, setClientTelephone] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadingCreneaux, setLoadingCreneaux] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Charger le salon + service
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

  // Verifier si le client est connecte
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.logged && data.user) {
          setLoggedUser(data.user)
          setClientNom(data.user.nom)
          setClientPrenom(data.user.prenom)
          setClientEmail(data.user.email)
          setClientTelephone(data.user.telephone || '')
        }
        setCheckingAuth(false)
      })
      .catch(() => setCheckingAuth(false))
  }, [])

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
      if (step === 1) setStep(2)
    }
  }

  function handleDateSelect(dateObj: Date) {
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
    const fullNom = clientPrenom ? `${clientPrenom} ${clientNom}`.trim() : clientNom.trim()
    if (!fullNom || !clientEmail.trim() || !clientTelephone.trim()) {
      setError('Veuillez remplir tous les champs de contact.')
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
          client_prenom: clientPrenom.trim(),
          client_email: clientEmail.trim(),
          client_telephone: clientTelephone.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Erreur lors de la reservation.')
      }
    } catch {
      setError('Erreur de connexion.')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"]

  function prevMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)) }
  function nextMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)) }

  function formatDateFr(d: string) {
    if (!d) return ''
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', opts)
  }

  // ── Guards ──
  if (!salonId || !serviceId) return (
    <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#888', marginBottom: 20 }}>Parametres manquants.</p>
      <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>Retour a la recherche</Link>
    </div>
  )

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#999' }}>Chargement...</div>

  // ── Ecran de succes ──
  if (success) return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '50px 40px' }}>
          <div style={{ fontSize: 50, marginBottom: 20 }}>{'✅'}</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: NOIR, marginBottom: 10 }}>Reservation confirmee !</h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
            Votre rendez-vous au <strong>{salon?.nom}</strong> a ete enregistre.
          </p>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 30, lineHeight: 1.6 }}>
            <strong>{formatDateFr(date)}</strong> a <strong>{selectedCreneau?.heure.substring(0, 5)}</strong>
            <br />{service?.nom} — {service?.prix?.toLocaleString()} DA
          </p>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 30 }}>
            Paiement sur place. Presentez-vous 5 min avant votre rendez-vous.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {loggedUser && (
              <Link href="/dashboard" style={{ display: 'inline-block', background: OR, color: '#fff', padding: '12px 28px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Mes rendez-vous
              </Link>
            )}
            <Link href="/search" style={{ display: 'inline-block', background: NOIR, color: '#fff', padding: '12px 28px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Retour a la recherche
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Page principale ──
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>

      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0', marginBottom: 30 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <Link href={'/salon/' + salonId} style={{ color: '#777', fontSize: 14, textDecoration: 'none' }}>{'← Retour au salon'}</Link>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>

        {/* Resume salon + service */}
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: NOIR }}>{salon?.nom}</div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{'📍'} {salon?.adresse}, {salon?.ville}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: NOIR }}>{service?.nom}</div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{service?.duree} min</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: OR, marginTop: 4 }}>{service?.prix ? service.prix.toLocaleString() + ' DA' : 'Sur devis'}</div>
          </div>
        </div>

        {/* Indicateur connecte */}
        {!checkingAuth && loggedUser && (
          <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 4, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#155724', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{'✓'} Connecte en tant que <strong>{loggedUser.prenom} {loggedUser.nom}</strong> — vos infos seront pre-remplies</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr' : '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* ════ ETAPE 1 : Calendrier ════ */}
          {step < 3 && (
            <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>1. Choisissez une date</h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={prevMonth} disabled={currentMonth <= new Date(today.getFullYear(), today.getMonth(), 1)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#999' }}>{'◀'}</button>
                <span style={{ fontWeight: 800, fontSize: 16, color: NOIR, textTransform: 'capitalize' }}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#999' }}>{'▶'}</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 10 }}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(j => (
                  <div key={j} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#bbb', padding: '6px 0' }}>{j}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {Array.from({ length: startOffset }).map((_, i) => <div key={'e' + i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
                  const isPast = dayDate < today
                  const jourSemaine = dayDate.getDay() || 7
                  const isOff = salon?.jour_off === jourSemaine
                  const isDisabled = isPast || isOff
                  const formatted = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                  const isSelected = date === formatted

                  return (
                    <button
                      key={dayNum}
                      disabled={isDisabled}
                      onClick={() => handleDateSelect(dayDate)}
                      style={{
                        padding: '10px 0', border: isSelected ? `2px solid ${OR}` : '1px solid #f0f0f0',
                        borderRadius: 4, background: isSelected ? '#FFF8EE' : isDisabled ? '#fafafa' : '#fff',
                        color: isDisabled ? '#ddd' : isSelected ? OR : NOIR, fontWeight: isSelected ? 800 : 600,
                        fontSize: 14, cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {dayNum}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ════ ETAPE 2 : Creneaux ════ */}
          {step < 3 && (
            <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>2. Choisissez un creneau</h2>

              {!date && <p style={{ color: '#bbb', fontSize: 14 }}>{'← Selectionnez une date'}</p>}

              {date && loadingCreneaux && <p style={{ color: '#999', fontSize: 14 }}>Chargement des creneaux...</p>}

              {date && !loadingCreneaux && ferme && (
                <div style={{ background: '#FFF5F5', padding: 20, borderRadius: 4, textAlign: 'center' }}>
                  <p style={{ color: '#d32f2f', fontWeight: 600, fontSize: 14 }}>Ferme ce jour-la</p>
                </div>
              )}

              {date && !loadingCreneaux && !ferme && creneaux.length === 0 && (
                <p style={{ color: '#999', fontSize: 14 }}>Aucun creneau disponible pour cette date.</p>
              )}

              {date && !loadingCreneaux && !ferme && creneaux.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {(() => {
                    const allSlots = generateAllSlots(salon?.ouverture || "09:00", salon?.fermeture || "19:00")
                    const availableSet = new Set(creneaux.map(c => c.heure.substring(0, 5)))

                    return allSlots.map(time => {
                      const isAvailable = availableSet.has(time)
                      const isSelected = selectedCreneau?.heure.substring(0, 5) === time
                      const creneau = creneaux.find(c => c.heure.substring(0, 5) === time)

                      return (
                        <button
                          key={time}
                          disabled={!isAvailable}
                          onClick={() => isAvailable && creneau && handleCreneauSelect(creneau)}
                          style={{
                            padding: '12px 8px',
                            border: isSelected ? `2px solid ${OR}` : isAvailable ? '1px solid #E0D8CE' : '1px solid #F0F0F0',
                            borderRadius: 4,
                            background: isSelected ? '#FFF8EE' : isAvailable ? '#fff' : '#FAFAFA',
                            color: isSelected ? OR : isAvailable ? NOIR : '#CCC',
                            fontWeight: 700, fontSize: 14,
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            textDecoration: isAvailable ? 'none' : 'line-through',
                          }}
                        >
                          {time}
                        </button>
                      )
                    })
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════ ETAPE 3 : Coordonnees ════ */}
        {step === 3 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '40px', animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, margin: 0 }}>3. Vos coordonnees</h2>
              <button onClick={() => setStep(2)} style={{ color: OR, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {'← Modifier la date/heure'}
              </button>
            </div>

            {/* Resume du RDV */}
            <div style={{ background: BG, borderRadius: 4, padding: '20px', marginBottom: 30, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Date du rendez-vous</div>
                <div style={{ fontWeight: 700, color: NOIR, textTransform: 'capitalize' }}>{formatDateFr(date)} a {selectedCreneau?.heure.substring(0, 5)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Prestation</div>
                <div style={{ fontWeight: 700, color: OR }}>{service?.nom} — {service?.prix?.toLocaleString()} DA</div>
              </div>
            </div>

            {/* ── SI CONNECTE : infos pre-remplies ── */}
            {loggedUser ? (
              <div>
                <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 4, padding: '14px 20px', marginBottom: 25, fontSize: 14, color: '#155724' }}>
                  {'✓'} Reservation au nom de <strong>{loggedUser.prenom} {loggedUser.nom}</strong> ({loggedUser.email})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Prenom</label>
                    <input value={clientPrenom} onChange={e => setClientPrenom(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Nom</label>
                    <input value={clientNom} onChange={e => setClientNom(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Email</label>
                    <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Telephone</label>
                    <input type="tel" value={clientTelephone} onChange={e => setClientTelephone(e.target.value)} placeholder="0555 12 34 56" style={inputStyle} />
                  </div>
                </div>
              </div>
            ) : (
              /* ── SI NON CONNECTE : choix login ou guest ── */
              <div>
                <div style={{ marginBottom: 24, textAlign: 'center', padding: '20px', background: '#FDFBF7', borderRadius: 4, border: `1px dashed ${OR}40` }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: NOIR, marginBottom: 8 }}>Vous avez deja un compte ?</p>
                  <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                    Connectez-vous pour pre-remplir vos infos et retrouver vos rendez-vous.
                  </p>
                  <Link
                    href={`/login?redirect=/booking?salon=${salonId}&service=${serviceId}`}
                    style={{ display: 'inline-block', background: OR, color: '#fff', padding: '10px 24px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                  >
                    Se connecter
                  </Link>
                  <span style={{ display: 'block', marginTop: 12, fontSize: 13, color: '#aaa' }}>ou continuez en renseignant vos coordonnees ci-dessous</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Prenom</label>
                    <input value={clientPrenom} onChange={e => setClientPrenom(e.target.value)} placeholder="Amina" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Nom</label>
                    <input value={clientNom} onChange={e => setClientNom(e.target.value)} placeholder="Belkacem" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Email</label>
                    <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="amina@email.dz" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 8 }}>Telephone</label>
                    <input type="tel" value={clientTelephone} onChange={e => setClientTelephone(e.target.value)} placeholder="0555 12 34 56" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {error && <div style={{ background: '#FFF0F0', color: '#d32f2f', padding: '12px 16px', borderRadius: 4, fontSize: 14, marginBottom: 20, fontWeight: 500 }}>{error}</div>}

            <button onClick={handleConfirm} disabled={submitting} style={{ width: '100%', padding: '16px 0', background: submitting ? '#999' : NOIR, color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {submitting ? 'Enregistrement en cours...' : 'Confirmer le rendez-vous'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#aaa' }}>
              Paiement sur place (especes ou virement). Aucun prelevement en ligne.
            </p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', border: '1px solid #E0D8CE', borderRadius: 4,
  fontSize: 15, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none',
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement du tunnel de reservation...</div>}>
      <BookingContent />
    </Suspense>
  )
}
