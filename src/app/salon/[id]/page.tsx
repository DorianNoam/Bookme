'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

type Salon = { 
  id: number; nom: string; adresse: string; ville: string; image: string; 
  type_salon: string; telephone: string; description: string; 
  ouverture: string; fermeture: string; jour_off: number 
}

type Service = { 
  id: number; nom: string; prix: number; duree: number; categorie_service: string;
  promo_pourcentage: number | null; promo_active: boolean
}

type VentePrivee = { id: number; nom: string; prix: number; duree: number; description: string }

type Avis = { id: number; note: number; commentaire: string; created_at: string; users: { prenom: string; nom: string } }

export default function SalonPage() {
  const params = useParams()
  const salonId = params.id as string

  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [avisList, setAvisList] = useState<Avis[]>([])
  const [isVip, setIsVip] = useState(false)
  const [ventesPrivees, setVentesPrivees] = useState<VentePrivee[]>([])
  const [pastReservationsCount, setPastReservationsCount] = useState(0)
  const [canReview, setCanReview] = useState(false)
  const [note, setNote] = useState(5)
  const [noteAccueil, setNoteAccueil] = useState(5)
  const [noteProprete, setNoteProprete] = useState(5)
  const [noteAmbiance, setNoteAmbiance] = useState(5)
  const [noteQualite, setNoteQualite] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('prestations')
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!salonId) return
    fetch('/api/salons/' + salonId)
      .then(r => r.json())
      .then(data => {
        setSalon(data.salon)
        setServices(data.services || [])
        setAvisList(data.avis || [])
        setIsVip(data.isVip || false)
        setVentesPrivees(data.ventesPrivees || [])
        setPastReservationsCount(data.pastReservationsCount || 0)
        if (data.pastReservationsCount && data.pastReservationsCount > 0) setCanReview(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch(`/api/favoris?salon_id=${salonId}`)
      .then(res => res.json())
      .then(data => { if (data.isFavorite !== undefined) { setIsFavorite(data.isFavorite); setIsLoggedIn(true) } })
      .catch(() => setIsLoggedIn(false))
  }, [salonId])

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    setReviewSubmitting(true)
    setReviewMessage('')
    try {
      const res = await fetch('/api/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: parseInt(salonId), note, note_accueil: noteAccueil, note_proprete: noteProprete, note_ambiance: noteAmbiance, note_qualite: noteQualite, commentaire })
      })
      const data = await res.json()
      if (res.ok) { setReviewMessage('Avis publie avec succes !'); setCommentaire(''); window.location.reload() }
      else setReviewMessage(data.error || 'Erreur')
    } catch { setReviewMessage('Erreur reseau') }
    setReviewSubmitting(false)
  }

  async function toggleFavorite() {
    try {
      const res = await fetch('/api/favoris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ salon_id: parseInt(salonId) }) })
      if (res.status === 401) { window.location.href = `/login?redirect=/salon/${salonId}`; return }
      const data = await res.json()
      if (data.success) setIsFavorite(data.isFavorite)
    } catch {}
  }

  const servicesParCategorie = services.reduce((acc, service) => {
    const cat = service.categorie_service || 'Autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement du salon...</div>
  if (!salon) return (
    <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#888', marginBottom: 20 }}>Salon introuvable.</p>
      <Link href="/search" style={{ color: OR, fontWeight: 700 }}>Retour a la recherche</Link>
    </div>
  )

  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>
      
      {/* HEADER */}
      <header style={{ background: '#fff', padding: '12px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <Link href="/search" style={{ color: '#777', fontSize: 13 }}>{'← Retour'}</Link>
          <div className="hide-mobile" style={{ display: 'flex', gap: 15 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ color: '#fff', background: NOIR, padding: '6px 16px', borderRadius: 4, fontSize: 14, fontWeight: 600 }}>Mon espace</Link>
            ) : (
              <>
                <Link href="/login" style={{ color: NOIR, fontSize: 14, fontWeight: 600 }}>Connexion</Link>
                <Link href="/register" style={{ color: '#fff', background: NOIR, padding: '6px 16px', borderRadius: 4, fontSize: 14, fontWeight: 600 }}>Inscription</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="salon-hero" style={{ position: 'relative', backgroundColor: NOIR, overflow: 'hidden' }}>
        <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, position: 'absolute', inset: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 16px', background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ color: OR, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>{salon.type_salon}</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
              <h1 className="salon-hero-title" style={{ fontWeight: 900, color: '#fff', margin: 0 }}>{salon.nom}</h1>
              <button onClick={toggleFavorite} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${isFavorite ? OR : 'rgba(255,255,255,0.2)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? OR : 'none'} stroke={isFavorite ? OR : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div className="salon-info-bar" style={{ color: '#eee', fontSize: 13, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <span>{'📍'} {salon.ville}</span>
              <span className="hide-mobile">{'📍'} {salon.adresse}</span>
              <span>{'📞'} {salon.telephone}</span>
              <span>{'⏱'} {salon.ouverture?.substring(0, 5)} - {salon.fermeture?.substring(0, 5)}</span>
              {salon.jour_off !== undefined && salon.jour_off !== null && salon.jour_off > 0 && salon.jour_off <= 7 && (
                <span style={{ color: '#ffaaaa' }}>Ferme le {jours[salon.jour_off === 7 ? 0 : salon.jour_off]}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px', marginTop: 30, display: 'flex', flexDirection: 'column', gap: 30 }}>
        
        {/* TABS - scrollable on mobile */}
        <div className="filters-bar" style={{ borderBottom: '2px solid #E0D8CE', gap: 24, paddingBottom: 0 }}>
          {['Prestations', 'Avis', 'Informations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              style={{
                background: 'none', border: 'none', padding: '0 0 14px 0', fontSize: 15, fontWeight: activeTab === tab.toLowerCase() ? 800 : 600,
                color: activeTab === tab.toLowerCase() ? NOIR : '#888',
                borderBottom: activeTab === tab.toLowerCase() ? `3px solid ${OR}` : '3px solid transparent',
                marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab} {tab === 'Avis' && `(${avisList.length})`}
            </button>
          ))}
        </div>

        {/* ════ TAB PRESTATIONS ════ */}
        {activeTab === 'prestations' && (
          <div>
            <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, marginBottom: 30 }}>{salon.description}</p>
            
            {/* VENTES PRIVEES VIP */}
            {isVip && ventesPrivees && ventesPrivees.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <div style={{ background: NOIR, borderRadius: '8px 8px 0 0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `2px solid ${OR}` }}>
                  <span style={{ fontSize: 22 }}>{'⭐'}</span>
                  <div>
                    <h2 style={{ color: OR, margin: 0, fontSize: 16, fontWeight: 800 }}>Offres Exclusives VIP</h2>
                    <p style={{ color: '#aaa', fontSize: 12, margin: '2px 0 0' }}>Merci pour votre fidelite ({pastReservationsCount} RDV). Offres reservees a nos clients fideles.</p>
                  </div>
                </div>
                <div style={{ background: '#fff', border: `1px solid ${NOIR}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                  {ventesPrivees.map((vp, index) => (
                    <div key={vp.id} className="service-card" style={{ borderBottom: index < ventesPrivees.length - 1 ? '1px solid #eee' : 'none', background: '#fff', border: 'none', borderRadius: 0 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: NOIR, marginBottom: 4 }}>{vp.nom}</div>
                        <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>{vp.description}</div>
                        <span style={{ color: '#999', fontSize: 12 }}>{'⏱'} {vp.duree} min</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: OR }}>{vp.prix.toLocaleString()} DA</span>
                        <Link href={`/booking?salon=${salon.id}&service=${vp.id}&type=vip`} style={{ background: OR, color: NOIR, padding: '10px 20px', borderRadius: 6, fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>Reserver VIP</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* PRESTATIONS */}
            {Object.entries(servicesParCategorie).map(([categorie, items]) => (
              <div key={categorie} style={{ marginBottom: 30 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: OR, textTransform: 'uppercase', letterSpacing: 2, borderBottom: '1px solid #E0D8CE', paddingBottom: 8, marginBottom: 14 }}>{categorie}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(service => {
                    const hasPromo = service.promo_active && service.promo_pourcentage && service.promo_pourcentage > 0
                    const promoPrice = hasPromo ? Math.round(service.prix - (service.prix * service.promo_pourcentage! / 100)) : service.prix
                    return (
                      <div key={service.id} className="service-card" style={{ background: '#fff', border: hasPromo ? '1px solid #ffcccb' : '1px solid #EDE5D8', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                        {hasPromo && (
                          <div style={{ position: 'absolute', top: 0, right: 0, background: '#d32f2f', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: '0 0 0 6px' }}>-{service.promo_pourcentage}%</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: NOIR, marginBottom: 3 }}>{service.nom}</div>
                          <div style={{ color: '#888', fontSize: 12 }}>{service.duree} min</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ textAlign: 'right' }}>
                            {hasPromo ? (
                              <div>
                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 13 }}>{service.prix.toLocaleString()} DA</span>
                                <div style={{ fontWeight: 900, fontSize: 18, color: '#d32f2f' }}>{promoPrice.toLocaleString()} DA</div>
                              </div>
                            ) : (
                              <div style={{ fontWeight: 800, fontSize: 17, color: NOIR }}>{service.prix > 0 ? service.prix.toLocaleString() + ' DA' : 'Sur devis'}</div>
                            )}
                          </div>
                          <Link href={`/booking?salon=${salon.id}&service=${service.id}`} style={{ background: hasPromo ? '#d32f2f' : NOIR, color: '#fff', padding: '10px 20px', borderRadius: 4, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>Reserver</Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ TAB INFORMATIONS ════ */}
        {activeTab === 'informations' && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: '20px' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: NOIR, marginBottom: 16 }}>A propos</h3>
            <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>{salon.description}</p>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: NOIR, marginBottom: 16 }}>Horaires</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {jours.map((jour, index) => (
                <div key={jour} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f0f0f0', color: salon.jour_off === index ? '#ffaaaa' : '#555', fontSize: 14 }}>
                  <span style={{ fontWeight: salon.jour_off === index ? 400 : 600 }}>{jour}</span>
                  <span>{salon.jour_off === index ? 'Ferme' : `${salon.ouverture?.substring(0, 5)} - ${salon.fermeture?.substring(0, 5)}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ TAB AVIS ════ */}
        {activeTab === 'avis' && (
          <div>
            {canReview ? (
              <div style={{ background: '#fff', border: `2px solid ${OR}`, borderRadius: 8, padding: '20px', marginBottom: 24 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: NOIR, marginBottom: 12 }}>Laisser un avis</h3>
                {reviewMessage && (
                  <div style={{ padding: 10, background: reviewMessage.includes('succes') ? '#d4edda' : '#f8d7da', color: reviewMessage.includes('succes') ? '#155724' : '#721c24', borderRadius: 6, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>{reviewMessage}</div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Note globale</label>
                  <select value={note} onChange={e => setNote(parseInt(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontFamily: 'Inter, sans-serif' }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n}/5)</option>)}
                  </select>
                </div>
                <div className="form-grid-2col" style={{ marginBottom: 12 }}>
                  {[
                    { label: 'Accueil', val: noteAccueil, set: setNoteAccueil },
                    { label: 'Proprete', val: noteProprete, set: setNoteProprete },
                    { label: 'Ambiance', val: noteAmbiance, set: setNoteAmbiance },
                    { label: 'Qualite', val: noteQualite, set: setNoteQualite },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{f.label}</label>
                      <select value={f.val} onChange={e => f.set(parseInt(e.target.value))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontFamily: 'Inter, sans-serif' }}>
                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}/5</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Votre commentaire</label>
                  <textarea rows={3} value={commentaire} onChange={e => setCommentaire(e.target.value)} placeholder="Partagez votre experience..." style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <button onClick={handleReviewSubmit as any} disabled={reviewSubmitting} style={{ background: OR, color: NOIR, border: 'none', padding: '12px 24px', borderRadius: 6, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', fontSize: 14 }}>
                  {reviewSubmitting ? 'Publication...' : 'Publier mon avis'}
                </button>
              </div>
            ) : isLoggedIn ? (
              <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 8, padding: 20, marginBottom: 24, textAlign: 'center', color: '#666', fontSize: 14 }}>
                Vous devez avoir effectue au moins un RDV <strong>termine</strong> pour laisser un avis.
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 8, padding: 20, marginBottom: 24, textAlign: 'center', color: '#666', fontSize: 14 }}>
                <Link href="/login" style={{ color: OR, fontWeight: 700 }}>Connectez-vous</Link> pour laisser un avis.
              </div>
            )}

            {avisList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, color: '#888', fontSize: 14 }}>
                Aucun avis pour le moment.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {avisList.map(avis => (
                  <div key={avis.id} style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 8, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ fontWeight: 800, color: NOIR, fontSize: 14 }}>{avis.users ? `${avis.users.prenom} ${avis.users.nom}` : 'Client Bookme'}</span>
                      <span style={{ color: OR, fontWeight: 800, fontSize: 13 }}>{'⭐'.repeat(avis.note)}</span>
                    </div>
                    <p style={{ color: '#555', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{avis.commentaire}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ STYLES RESPONSIVE ══ */}
      <style dangerouslySetInnerHTML={{__html: `
        .salon-hero { height: 350px; }
        .salon-hero-title { font-size: 42px; }
        @media (max-width: 768px) {
          .salon-hero { height: 260px; }
          .salon-hero-title { font-size: 26px; }
        }
      `}} />
    </div>
  )
}
