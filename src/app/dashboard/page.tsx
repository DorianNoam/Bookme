'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

type User = { prenom: string; nom: string; email: string; telephone: string }
type SalonInfo = { id: number; nom: string; ville: string; image: string; type_salon?: string }
type Reservation = {
  id: number;
  service_nom: string;
  service_prix: number;
  date_rdv: string;
  statut: string;
  salons: SalonInfo;
}

export default function DashboardPage() {
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('rdv')
  const [loading, setLoading] = useState(true)
  
  const [user, setUser] = useState<User | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [favoris, setFavoris] = useState<SalonInfo[]>([])

  useEffect(() => {
    fetch('/api/user/dashboard')
      .then(res => {
        if (res.status === 401) {
          router.push('/login')
          throw new Error('Non connecté')
        }
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setUser(data.user)
          setReservations(data.reservations)
          setFavoris(data.favoris)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function formatDate(d: string) {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(d).toLocaleDateString('fr-FR', opts).replace(':', 'h')
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement de votre espace...</div>
  if (!user) return null

  // Séparer les RDV à venir et passés
  const now = new Date()
  const aVenir = reservations.filter(r => new Date(r.date_rdv) >= now && r.statut !== 'annule')
  const passes = reservations.filter(r => new Date(r.date_rdv) < now || r.statut === 'annule')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>
      
      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/search" style={{ color: '#555', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Nouvelle réservation</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#D32F2F', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Déconnexion</button>
          </div>
        </div>
      </header>

      {/* EN-TÊTE PROFIL */}
      <div style={{ background: NOIR, padding: '40px 20px', color: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 5 }}>Bonjour, {user.prenom} !</h1>
          <p style={{ color: '#aaa', fontSize: 15 }}>Gérez vos réservations et vos salons favoris.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', marginTop: 30 }}>
        
        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E0D8CE', gap: 40, marginBottom: 30 }}>
          {[
            { id: 'rdv', label: 'Mes Rendez-vous' },
            { id: 'favoris', label: 'Mes Favoris' },
            { id: 'profil', label: 'Mon Profil' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: '0 0 16px 0', fontSize: 15, fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? NOIR : '#888',
                borderBottom: activeTab === tab.id ? `3px solid ${OR}` : '3px solid transparent',
                marginBottom: -2, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENU : RENDEZ-VOUS */}
        {activeTab === 'rdv' && (
          <div style={{ display: 'grid', gap: 40 }}>
            
            {/* À VENIR */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: OR, borderRadius: '50%' }}></span>
                À venir ({aVenir.length})
              </h2>
              
              {aVenir.length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 6, padding: 40, textAlign: 'center', color: '#888' }}>
                  Vous n'avez aucun rendez-vous prévu.
                  <br/>
                  <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: 10 }}>Trouver un salon</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 15 }}>
                  {aVenir.map(rdv => (
                    <div key={rdv.id} style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: 4, overflow: 'hidden', background: '#eee' }}>
                          <img src={rdv.salons.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ color: OR, fontWeight: 700, fontSize: 14, textTransform: 'capitalize', marginBottom: 4 }}>{formatDate(rdv.date_rdv)}</div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: NOIR }}>{rdv.service_nom}</div>
                          <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>📍 {rdv.salons.nom} - {rdv.salons.ville}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: NOIR }}>{rdv.service_prix} DA</div>
                        <div style={{ display: 'inline-block', padding: '4px 10px', background: '#E8F5E9', color: '#2E7D32', borderRadius: 4, fontSize: 11, fontWeight: 700, marginTop: 8, textTransform: 'uppercase' }}>{rdv.statut}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PASSÉS */}
            {passes.length > 0 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#888', marginBottom: 20 }}>Historique ({passes.length})</h2>
                <div style={{ display: 'grid', gap: 15, opacity: 0.8 }}>
                  {passes.map(rdv => (
                    <div key={rdv.id} style={{ background: '#fff', border: '1px solid #E0D8CE', borderRadius: 6, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: NOIR }}>{rdv.service_nom} chez {rdv.salons.nom}</div>
                        <div style={{ color: '#888', fontSize: 13, marginTop: 4, textTransform: 'capitalize' }}>{formatDate(rdv.date_rdv)}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: rdv.statut === 'annule' ? '#D32F2F' : '#888', textTransform: 'uppercase' }}>
                        {rdv.statut}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTENU : FAVORIS */}
        {activeTab === 'favoris' && (
          <div>
            {favoris.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 6, padding: 40, textAlign: 'center', color: '#888' }}>
                Vous n'avez pas encore de salons favoris.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {favoris.map(salon => (
                  <Link key={salon.id} href={`/salon/${salon.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ height: 160, width: '100%', background: '#eee' }}>
                        <img src={salon.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <div style={{ color: OR, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{salon.type_salon || 'Salon'}</div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: NOIR, marginBottom: 4 }}>{salon.nom}</div>
                        <div style={{ color: '#888', fontSize: 13 }}>📍 {salon.ville}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENU : PROFIL */}
        {activeTab === 'profil' && (
          <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: 30, maxWidth: 500 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Mes informations</h2>
            <div style={{ display: 'grid', gap: 15 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Nom complet</label>
                <div style={{ fontSize: 15, fontWeight: 600, color: NOIR }}>{user.prenom} {user.nom}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Email</label>
                <div style={{ fontSize: 15, fontWeight: 600, color: NOIR }}>{user.email}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Téléphone</label>
                <div style={{ fontSize: 15, fontWeight: 600, color: NOIR }}>{user.telephone}</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
