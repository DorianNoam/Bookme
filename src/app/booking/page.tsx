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

  function formatDate(d: string) {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', opts)
  }

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
          <p style={{ color: '#888', fontSize: 14, marginBottom: 30, lineHeight: 1.6 }}>Votre rendez-vous a été enregistré avec succès.</p>
          <Link href="/search" style={{ display: 'inline-block', background: NOIR, color: '#fff', padding: '12px 28px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Retour à la recherche</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 20px' }}>
        
        {/* ÉTAPE 1 — DATE */}
        {step === 1 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Choisissez une date</h2>
            <input type="date" min={getMinDate()} value={date} onChange={e => handleDateSelect(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 16, fontFamily: 'Inter, sans-serif', color: NOIR, cursor: 'pointer' }} />
          </div>
        )}

        {/* ÉTAPE 2 — CRÉNEAUX */}
        {step === 2 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, margin: 0 }}>Choisissez un créneau</h2>
              <button onClick={() => setStep(1)} style={{ color: OR, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Changer la date</button>
            </div>
            {creneaux.length === 0 && !loadingCreneaux ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Aucun créneau disponible.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                {creneaux.map((c, i) => (
                  <button key={i} onClick={() => handleCreneauSelect(c)} style={{ padding: '12px 0', border: '1px solid #E0D8CE', borderRadius: 4, background: '#fff', color: NOIR, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{c.heure}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 3 — CONFIRMATION ET INFOS CLIENT */}
        {step === 3 && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '30px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: NOIR, margin: 0 }}>Vos coordonnées</h2>
              <button onClick={() => setStep(2)} style={{ color: OR, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Changer le créneau</button>
            </div>

            <div style={{ marginBottom: 24, textAlign: 'center', padding: '15px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Vous avez déjà un compte ?</p>
              <Link href={`/login?redirect=/booking?salon=${salonId}&service=${serviceId}`} style={{ display: 'inline-block', color: OR, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Se connecter pour aller plus vite</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6 }}>Nom complet</label>
                <input value={clientNom} onChange={e => setClientNom(e.target.value)} placeholder="Ex: Amina Belkacem" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="amina@email.dz" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6 }}>Téléphone</label>
                <input type="tel" value={clientTelephone} onChange={e => setClientTelephone(e.target.value)} placeholder="0555 12 34 56" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14 }} />
              </div>
            </div>

            {error && <div style={{ background: '#FFF0F0', color: '#d32f2f', padding: '10px 14px', borderRadius: 4, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button onClick={handleConfirm} disabled={submitting} style={{ width: '100%', padding: '14px 0', background: submitting ? '#999' : OR, color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </button>
          </div>
        )}
      </div>
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
