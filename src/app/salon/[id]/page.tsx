'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

type Salon = { 
  id: number; 
  nom: string; 
  adresse: string; 
  ville: string; 
  image: string; 
  type_salon: string; 
  telephone: string; 
  description: string; 
  ouverture: string; 
  fermeture: string; 
  jour_off: number 
}

type Service = { 
  id: number; 
  nom: string; 
  prix: number; 
  duree: number; 
  categorie_service: string;
  promo_pourcentage: number | null;
  promo_active: boolean
}

// Nouveau type pour les Ventes Privées
type VentePrivee = {
  id: number;
  nom: string;
  prix: number;
  duree: number;
  description: string;
}

export default function SalonPage() {
  const params = useParams()
  const salonId = params.id as string

  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  
  // Nouveaux états pour la fonctionnalité VIP
  const [isVip, setIsVip] = useState(false)
  const [ventesPrivees, setVentesPrivees] = useState<VentePrivee[]>([])
  const [pastReservationsCount, setPastReservationsCount] = useState(0)
  
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
        // Hydratation des variables VIP
        setIsVip(data.isVip || false)
        setVentesPrivees(data.ventesPrivees || [])
        setPastReservationsCount(data.pastReservationsCount || 0)
        
        setLoading(false)
      })
      .catch(err => {
        console.error("Erreur de chargement", err)
        setLoading(false)
      })

    fetch(`/api/favoris?salon_id=${salonId}`)
      .then(res => res.json())
      .then(data => {
        if (data.isFavorite !== undefined) {
          setIsFavorite(data.isFavorite)
          setIsLoggedIn(true)
        }
      })
      .catch(() => setIsLoggedIn(false))
  }, [salonId])

  async function toggleFavorite() {
    try {
      const res = await fetch('/api/favoris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: parseInt(salonId) })
      })
      
      if (res.status === 401) {
        window.location.href = `/login?redirect=/salon/${salonId}`
        return
      }
      
      const data = await res.json()
      if (data.success) {
        setIsFavorite(data.isFavorite)
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris', error)
    }
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
      <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>Retour a la recherche</Link>
    </div>
  )

  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>
      
      {/* HEADER */}
      <header style={{ background: '#fff', padding: '15px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <Link href="/search" style={{ color: '#777', fontSize: 14, textDecoration: 'none' }}>{'← Retour aux resultats'}</Link>
          <div style={{ display: 'flex', gap: 15 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ color: '#fff', background: NOIR, padding: '6px 16px', borderRadius: 4, fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ color: NOIR, fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Connexion</Link>
                <Link href="/register" style={{ color: '#fff', background: NOIR, padding: '6px 16px', borderRadius: 4, fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Inscription</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ position: 'relative', height: 350, backgroundColor: NOIR, overflow: 'hidden' }}>
        <img 
          src={salon.image} 
          alt={salon.nom} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px', background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ color: OR, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              {salon.type_salon}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
              <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', margin: 0 }}>{salon.nom}</h1>
              
              <button 
                onClick={toggleFavorite}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: `1px solid ${isFavorite ? OR : 'rgba(255,255,255,0.2)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.2s ease'
                }}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? OR : 'none'} stroke={isFavorite ? OR : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div style={{ color: '#eee', fontSize: 15, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <span>{'📍'} {salon.adresse}, {salon.ville}</span>
              <span>{'📞'} {salon.telephone}</span>
              <span>{'⏱'} {salon.ouverture?.substring(0, 5)} - {salon.fermeture?.substring(0, 5)}</span>
              {salon.jour_off !== undefined && salon.jour_off !== null && (
                <span style={{ color: '#ffaaaa' }}>Ferme le {jours[salon.jour_off]}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 40, marginTop: 40, flexDirection: 'column' }}>
        
        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E0D8CE', gap: 40 }}>
          {['Prestations', 'Avis', 'Informations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              style={{
                background: 'none', border: 'none', padding: '0 0 16px 0', fontSize: 16, fontWeight: activeTab === tab.toLowerCase() ? 800 : 600,
                color: activeTab === tab.toLowerCase() ? NOIR : '#888',
                borderBottom: activeTab === tab.toLowerCase() ? `3px solid ${OR}` : '3px solid transparent',
                marginBottom: -2, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            
            {activeTab === 'prestations' && (
              <div>
                <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>{salon.description}</p>
                
                {/* ── SECTION VENTES PRIVÉES (Bandeau VIP) ── */}
                {isVip && ventesPrivees && ventesPrivees.length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <div style={{ 
                      background: '#0A0A0A', 
                      borderRadius: '8px 8px 0 0', 
                      padding: '15px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 15,
                      borderBottom: '2px solid #B8922A'
                    }}>
                      <span style={{ fontSize: 24 }}>⭐</span>
                      <div>
                        <h2 style={{ color: '#B8922A', margin: 0, fontSize: 18, fontWeight: 800 }}>Offres Exclusives VIP</h2>
                        <p style={{ color: '#aaa', fontSize: 13, margin: '4px 0 0 0' }}>
                          Merci pour votre fidélité ({pastReservationsCount} rendez-vous terminés). Ces offres vous sont strictement réservées.
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: '#fff', 
                      border: '1px solid #0A0A0A',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px', 
                      overflow: 'hidden' 
                    }}>
                      {ventesPrivees.map((vp: VentePrivee, index: number) => (
                        <div key={vp.id} style={{ 
                          padding: '20px', 
                          borderBottom: index < ventesPrivees.length - 1 ? '1px solid #eee' : 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0A0A0A', margin: '0 0 8px 0' }}>{vp.nom}</h3>
                            <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px 0', maxWidth: 600 }}>{vp.description}</p>
                            <span style={{ color: '#999', fontSize: 13 }}>⏱ {vp.duree} min</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                            <span style={{ fontSize: 20, fontWeight: 900, color: '#B8922A' }}>{vp.prix.toLocaleString()} DA</span>
                            <Link 
                              href={`/booking?salon=${salon.id}&service=${vp.id}&type=vip`}
                              style={{ 
                                background: '#B8922A', 
                                color: '#0A0A0A', 
                                textDecoration: 'none',
                                padding: '10px 24px', 
                                borderRadius: 6, 
                                fontWeight: 800, 
                                cursor: 'pointer' 
                              }}>
                              Réserver VIP
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* ── SECTION PRESTATIONS CLASSIQUES ── */}
                {Object.entries(servicesParCategorie).map(([categorie, items]) => (
                  <div key={categorie} style={{ marginBottom: 40 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: OR, textTransform: 'uppercase', letterSpacing: 2, borderBottom: '1px solid #E0D8CE', paddingBottom: 10, marginBottom: 20 }}>
                      {categorie}
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                      {items.map(service => {
                        const hasPromo = service.promo_active && service.promo_pourcentage && service.promo_pourcentage > 0
                        const promoPrice = hasPromo ? Math.round(service.prix - (service.prix * service.promo_pourcentage! / 100)) : service.prix

                        return (
                          <div key={service.id} style={{ background: '#fff', border: hasPromo ? '1px solid #ffcccb' : '1px solid #EDE5D8', borderRadius: 6, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s', position: 'relative', overflow: 'hidden' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                            
                            {/* Badge promo */}
                            {hasPromo && (
                              <div style={{ position: 'absolute', top: 0, right: 0, background: '#d32f2f', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: '0 0 0 8px' }}>
                                -{service.promo_pourcentage}%
                              </div>
                            )}

                            <div>
                              <div style={{ fontWeight: 800, fontSize: 16, color: NOIR, marginBottom: 4 }}>{service.nom}</div>
                              <div style={{ color: '#888', fontSize: 13 }}>{service.duree} min</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                              {/* Prix */}
                              <div style={{ textAlign: 'right' }}>
                                {hasPromo ? (
                                  <div>
                                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 14 }}>{service.prix.toLocaleString()} DA</span>
                                    <div style={{ fontWeight: 900, fontSize: 20, color: '#d32f2f' }}>{promoPrice.toLocaleString()} DA</div>
                                  </div>
                                ) : (
                                  <div style={{ fontWeight: 800, fontSize: 18, color: NOIR }}>
                                    {service.prix > 0 ? service.prix.toLocaleString() + ' DA' : 'Sur devis'}
                                  </div>
                                )}
                              </div>
                              <Link 
                                href={`/booking?salon=${salon.id}&service=${service.id}`}
                                style={{ background: hasPromo ? '#d32f2f' : NOIR, color: '#fff', padding: '10px 24px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                                onMouseOver={e => e.currentTarget.style.background = OR}
                                onMouseOut={e => e.currentTarget.style.background = hasPromo ? '#d32f2f' : NOIR}
                              >
                                Reserver
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'informations' && (
              <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: 30 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>A propos</h3>
                <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 30 }}>{salon.description}</p>
                
                <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Horaires</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {jours.map((jour, index) => (
                    <div key={jour} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #f0f0f0', color: salon.jour_off === index ? '#ffaaaa' : '#555' }}>
                      <span style={{ fontWeight: salon.jour_off === index ? 400 : 600 }}>{jour}</span>
                      <span>{salon.jour_off === index ? 'Ferme' : `${salon.ouverture?.substring(0, 5)} - ${salon.fermeture?.substring(0, 5)}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'avis' && (
              <div style={{ textAlign: 'center', padding: 60, background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6 }}>
                <div style={{ fontSize: 40, marginBottom: 15 }}>{'⭐'}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 10 }}>Les avis arrivent bientot</h3>
                <p style={{ color: '#888', fontSize: 14 }}>Seuls les clients ayant effectue une reservation peuvent laisser un avis.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
