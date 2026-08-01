'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

type Salon = { id: number; nom: string; adresse: string; ville: string; image: string }
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
  const [date, setDate] = useState('')
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [ferme, setFerme] = useState(false)
  const [selectedCreneau, setSelectedCreneau] = useState<Creneau | null>(null)
  const [clientNom, setClientNom] = useState('')
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

  function getMinDate() {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

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
    }
  }

  function handleDateSelect(d: string) {
    setDate(d)
    fetchCreneaux(d)
    setStep(2)
  }

  function handleCreneauSelect(c: Creneau) {
    setSelectedCreneau(c)
    setStep(3)
  }

  async function handleConfirm() {
    if (!clientNom.trim()) { setError('Veuillez entrer votre nom.'); return }
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

  function formatDate(d: string) {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', opts)
  }

  if (!salonId || !serviceId) return (
    <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#888', marginBottom: 20 }}>Parametres manquants.</p>
      <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>Retour a la recherche</Link>
    </div>
  )

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#999' }}>Chargement...</div>
  if (!salon || !service) return <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Inter, sans-serif' }}><p>Prestation introuvable.</p><Link href="/search" style={{ color: OR, fontWeight: 700 }}>Retour</Link></div>

  if (success) return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
        </div>
      </header>
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '50px 40px' }}>
          <div style={{ fontSize: 50, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: NOIR, marginBottom: 10 }}>Reservation confirmee !</h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 30, lineHeight: 1.6 }}>Votre rendez-vous a ete enregistre avec succes.</p>
          <div style={{ background: BG, borderRadius: 4, padding: '20px 24px', textAlign: 'left', marginBottom: 30 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Recapitulatif</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: '#888', fontSize: 13 }}>Salon</span><span style={{ fontWeight: 700, color: NOIR, fontSize: 13 }}>{salon.nom}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: '#888', fontSize: 13 }}>Prestation</span><span style={{ fontWeight: 700, color: NOIR, fontSize: 13 }}>{service.nom}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: '#888', fontSize: 13 }}>Date</span><span style={{ fontWeight: 700, color: NOIR, fontSize: 13 }}>{formatDate(date)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: '#888', fontSize: 13 }}>Heure</span><span style={{ fontWeight: 700, color: NOIR, fontSize: 13 }}>{selectedCreneau?.heure}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888', fontSize: 13 }}>Prix</span><span style={{ fontWeight: 800, color: OR, fontSize: 15 }}>{service.prix > 0 ? service.prix.toLocaleString() + ' DA' : 'Sur devis'}</span></div>
          </div>
          <Link href="/search" style={{ display: 'inline-block', background: NOIR, color: '#fff', padding: '12px 28px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Retour a la recherche</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <Link href={'/salon/' + salonId} style={{ color: '#777', fontSize: 14, textDecoration: 'none' }}>← Retour au salon</Link>
        </div>
      </header>

      {/* PROGRESS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '16px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0 }}>
          {[{ n: 1, label: 'Date' }, { n: 2, label: 'Creneau' }, { n: 3, label: 'Confirmation' }].map((s, i) => (
            <div key={s.n} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s.n ? OR : '#E0D8CE', color: step >= s.n ? '#fff' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{s.n}</div>
              <span style={{ fontSize: 13, fontWeight: step >= s.n ? 700 : 500, color: step >= s.n ? NOIR : '#999' }}>{s.label}</span>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? OR : '#E0D8CE', marginLeft: 10 }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 20px' }}>

        {/* RESUME */}
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
            <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: NOIR }}>{salon.nom}</div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>📍 {salon.adresse}{salon.ville ? ', ' + salon.ville : ''}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: NOIR }}>{service.nom}</div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{service.duree} min</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: OR, marginTop: 4 }}>{service.prix > 0 ? service.prix.toLocaleString() + ' DA' : 'Sur devis'}</div>
          </div>
        </div>

        {/* ETAPE 1 — DATE */}
        {step === 1 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Etape 1</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Choisissez une date</h2>
            <input
              type="date"
              min={getMinDate()}
              value={date}
              onChange={e => handleDateSelect(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 16, fontFamily: 'Inter, sans-serif', color: NOIR, cursor: 'pointer' }}
            />
          </div>
        )}

        {/* ETAPE 2 — CRENEAUX */}
        {step === 2 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Etape 2</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, margin: 0 }}>Choisissez un creneau</h2>
              <button onClick={() => setStep(1)} style={{ color: OR, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Changer la date</button>
            </div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>{formatDate(date)}</div>

            {loadingCreneaux ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chargement des creneaux...</div>
            ) : ferme ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Le salon est ferme ce jour. Veuillez choisir une autre date.</div>
            ) : creneaux.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Aucun creneau disponible ce jour.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                {creneaux.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleCreneauSelect(c)}
                    style={{ padding: '12px 0', border: '1px solid #E0D8CE', borderRadius: 4, background: selectedCreneau?.heure === c.heure ? OR : '#fff', color: selectedCreneau?.heure === c.heure ? '#fff' : NOIR, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: '0.15s' }}
                  >
                    {c.heure}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ETAPE 3 — CONFIRMATION */}
        {step === 3 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Etape 3</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, margin: 0 }}>Confirmez votre reservation</h2>
              <button onClick={() => setStep(2)} style={{ color: OR, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Changer le creneau</button>
            </div>

            <div style={{ background: BG, borderRadius: 4, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: '#888', fontSize: 13 }}>Date</span><span style={{ fontWeight: 700, color: NOIR, fontSize: 13 }}>{formatDate(date)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: '#888', fontSize: 13 }}>Heure</span><span style={{ fontWeight: 700, color: NOIR, fontSize: 13 }}>{selectedCreneau?.heure}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: '#888', fontSize: 13 }}>Prestation</span><span style={{ fontWeight: 700, color: NOIR, fontSize: 13 }}>{service.nom} ({service.duree} min)</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888', fontSize: 13 }}>Prix</span><span style={{ fontWeight: 800, color: OR, fontSize: 16 }}>{service.prix > 0 ? service.prix.toLocaleString() + ' DA' : 'Sur devis'}</span></div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6 }}>Votre nom complet</label>
              <input
                value={clientNom}
                onChange={e => setClientNom(e.target.value)}
                placeholder="Ex: Amina Belkacem"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, fontFamily: 'Inter, sans-serif', color: NOIR }}
              />
            </div>

            {error && <div style={{ background: '#FFF0F0', color: '#d32f2f', padding: '10px 14px', borderRadius: 4, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button
              onClick={handleConfirm}
              disabled={submitting}
              style={{ width: '100%', padding: '14px 0', background: submitting ? '#999' : OR, color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', letterSpacing: 0.5 }}
            >
              {submitting ? 'Reservation en cours...' : 'Confirmer la reservation'}
            </button>

            <p style={{ textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 14 }}>Paiement sur place en especes ou par virement.</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: NOIR, padding: '28px 0', textAlign: 'center', color: '#444', fontSize: 13, marginTop: 40 }}>
        Bookme.dz — La beaute a portee de clic en Algerie
      </footer>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement...</div>}>
      <BookingContent />
    </Suspense>
  )
}
