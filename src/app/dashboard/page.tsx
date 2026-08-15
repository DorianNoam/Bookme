'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

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
  const { t } = useLanguage()

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
          throw new Error('Non connecte')
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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', background: BG, color: NOIR, fontSize: 15 }}>
      {t.dashboard.chargement}
    </div>
  )
  if (!user) return null

  const now = new Date()
  const aVenir = reservations.filter(r => new Date(r.date_rdv) >= now && r.statut !== 'annule')
  const passes = reservations.filter(r => new Date(r.date_rdv) < now || r.statut === 'annule')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '12px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 900, color: NOIR, textDecoration: 'none', flexShrink: 0 }}>
            Bookme<span style={{ color: OR }}>dz</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguageSwitcher />
            <Link href="/search" style={{ color: '#555', fontSize: 13, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span className="hide-mobile">{t.dashboard.nouvelleReservation}</span>
            </Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#D32F2F', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 0' }}>
              {t.dashboard.deconnexion}
            </button>
          </div>
        </div>
      </header>

      {/* EN-TETE PROFIL */}
      <div style={{ background: NOIR, padding: 'clamp(24px, 5vw, 40px) 16px', color: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, marginBottom: 5 }}>
            {t.dashboard.bonjour} {user.prenom} !
          </h1>
          <p style={{ color: '#aaa', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
            {t.dashboard.gererRdv}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px', marginTop: 24 }}>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E0D8CE', gap: 'clamp(16px, 4vw, 40px)', marginBottom: 24, overflowX: 'auto', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {[
            { id: 'rdv', label: t.dashboard.rdv },
            { id: 'favoris', label: t.dashboard.favoris },
            { id: 'profil', label: t.dashboard.profil }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: '0 0 14px 0', fontSize: 14,
                fontWeight: activeTab === tab.id ? 800 : 600, color: activeTab === tab.id ? NOIR : '#888',
                borderBottom: activeTab === tab.id ? `3px solid ${OR}` : '3px solid transparent',
                marginBottom: -2, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENU : RENDEZ-VOUS */}
        {activeTab === 'rdv' && (
          <div style={{ display: 'grid', gap: 32 }}>

            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: OR, borderRadius: '50%' }}></span>
                {t.dashboard.aVenir} ({aVenir.length})
              </h2>

              {aVenir.length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 6, padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center', color: '#888', fontSize: 14 }}>
                  {t.dashboard.aucunRdv}
                  <div style={{ marginTop: 16 }}>
                    <Link href="/search" style={{ display: 'inline-block', background: NOIR, color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 4, fontWeight: 700, fontSize: 13 }}>
                      {t.dashboard.reserverMaintenant}
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {aVenir.map(rdv => (
                    <div key={rdv.id} style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ padding: 'clamp(12px, 3vw, 20px)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 'clamp(14px, 3vw, 16px)', color: NOIR, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {rdv.service_nom}
                            </div>
                            {rdv.salons && (
                              <Link href={"/salon/" + rdv.salons.id} style={{ color: OR, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                                {rdv.salons.nom}
                              </Link>
                            )}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: OR, whiteSpace: 'nowrap' }}>
                            {rdv.service_prix} DA
                          </div>
                        </div>
                        <div style={{ color: '#666', fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
                          {formatDate(rdv.date_rdv)}
                        </div>
                        <div style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#166534', textTransform: 'uppercase' }}>
                          {rdv.statut}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {passes.length > 0 && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#888', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, background: '#ccc', borderRadius: '50%' }}></span>
                  {t.dashboard.passes} ({passes.length})
                </h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {passes.map(rdv => (
                    <div key={rdv.id} style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: 'clamp(12px, 3vw, 20px)', opacity: 0.7, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 'clamp(14px, 3vw, 16px)', color: NOIR, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rdv.service_nom}
                          </div>
                          {rdv.salons && (
                            <div style={{ color: '#888', fontSize: 13 }}>{rdv.salons.nom}</div>
                          )}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#888', whiteSpace: 'nowrap' }}>
                          {rdv.service_prix} DA
                        </div>
                      </div>
                      <div style={{ color: '#999', fontSize: 13, marginTop: 8 }}>
                        {formatDate(rdv.date_rdv)}
                      </div>
                      <div style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: rdv.statut === 'annule' ? '#fef2f2' : '#f5f5f5', color: rdv.statut === 'annule' ? '#D32F2F' : '#888', textTransform: 'uppercase' }}>
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
              <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 6, padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center', color: '#888', fontSize: 14 }}>
                {t.dashboard.aucunFavori}
                <div style={{ marginTop: 16 }}>
                  <Link href="/search" style={{ display: 'inline-block', background: NOIR, color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 4, fontWeight: 700, fontSize: 13 }}>
                    {t.dashboard.decouvrirSalons}
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
                {favoris.map(salon => (
                  <Link key={salon.id} href={"/salon/" + salon.id} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, overflow: 'hidden', transition: 'transform 0.2s' }}>
                      <div style={{ height: 'clamp(120px, 25vw, 160px)', width: '100%', background: '#eee' }}>
                        <img src={salon.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: 'clamp(12px, 3vw, 16px)' }}>
                        <div style={{ color: OR, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                          {salon.type_salon || 'Salon'}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 'clamp(14px, 3vw, 16px)', color: NOIR, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {salon.nom}
                        </div>
                        <div style={{ color: '#888', fontSize: 13 }}>
                          {salon.ville}
                        </div>
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
          <ProfileTab user={user} onUpdate={(u) => setUser(u)} />
        )}

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Profil editable
// ═══════════════════════════════════════════════════════════════════

function ProfileTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({ ...user })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        onUpdate(form)
        setMessage('Informations mises à jour !')
      } else {
        setMessage(data.error || 'Erreur')
      }
    } catch { 
      setMessage('Erreur réseau')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE',
    borderRadius: 4, fontSize: 16, outline: 'none', boxSizing: 'border-box',
    WebkitAppearance: 'none', fontFamily: 'Inter, sans-serif'
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: 'clamp(20px, 4vw, 30px)', maxWidth: 500 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>{t.dashboard.mesInfos}</h2>
      {message && (
        <div style={{
          background: message.includes('Erreur') || message.includes('erreur') || message.includes('error') || message.includes('utilise') ? '#fef2f2' : '#f0fdf4',
          border: message.includes('Erreur') || message.includes('erreur') || message.includes('error') || message.includes('utilise') ? '1px solid #fecaca' : '1px solid #bbf7d0',
          borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 600,
          color: message.includes('Erreur') || message.includes('erreur') || message.includes('error') || message.includes('utilise') ? '#b91c1c' : '#166534'
        }}>
          {message}
        </div>
      )}
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Prénom</label>
            <input name="prenom" value={form.prenom} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Nom</label>
            <input name="nom" value={form.nom} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Téléphone</label>
          <input name="telephone" type="tel" value={form.telephone} onChange={handleChange} style={inputStyle} />
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '14px 0', background: saving ? '#999' : NOIR,
          color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800,
          fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4
        }}>
          {saving ? t.dashboard.enregistrement : t.dashboard.enregistrer}
        </button>
      </div>
    </div>
  )
}
