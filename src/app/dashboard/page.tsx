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
  id: number
  service_nom: string
  service_prix: number
  date_rdv: string
  statut: string
  salons: SalonInfo
}

export default function DashboardPage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('rdv')
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<User | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [favoris, setFavoris] = useState<SalonInfo[]>([])

  // Profil edit
  const [editing, setEditing] = useState(false)
  const [editPrenom, setEditPrenom] = useState('')
  const [editNom, setEditNom] = useState('')
  const [editTelephone, setEditTelephone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Cancel
  const [cancellingId, setCancellingId] = useState<number | null>(null)

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
          setReservations(data.reservations || [])
          setFavoris(data.favoris || [])
          setEditPrenom(data.user.prenom)
          setEditNom(data.user.nom)
          setEditTelephone(data.user.telephone || '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  function showMessage(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(''), 4000)
  }

  // ── Annuler un RDV ──
  async function handleCancel(id: number) {
    if (!confirm('Annuler ce rendez-vous ?')) return
    setCancellingId(id)
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        setReservations(reservations.map(r => r.id === id ? { ...r, statut: 'annule' } : r))
        showMessage('Rendez-vous annule')
      }
    } catch {}
    setCancellingId(null)
  }

  // ── Sauvegarder le profil ──
  async function handleSaveProfile() {
    if (!editPrenom.trim() || !editNom.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/user/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: editPrenom.trim(), nom: editNom.trim(), telephone: editTelephone.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setUser({ ...user!, prenom: editPrenom.trim(), nom: editNom.trim(), telephone: editTelephone.trim() })
        setEditing(false)
        showMessage('Profil mis a jour')
      }
    } catch {}
    setSaving(false)
  }

  // ── Supprimer le compte ──
  async function handleDeleteAccount() {
    const confirmed = confirm('Supprimer votre compte ? Cette action est irreversible. Vos rendez-vous resteront visibles pour les professionnels.')
    if (!confirmed) return
    const doubleCheck = confirm('Etes-vous vraiment sur ? Toutes vos donnees seront supprimees.')
    if (!doubleCheck) return

    try {
      const res = await fetch('/api/user/dashboard', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        window.location.href = '/'
      }
    } catch {}
  }

  function formatDate(d: string) {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(d).toLocaleDateString('fr-FR', opts).replace(':', 'h')
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement de votre espace...</div>
  if (!user) return null

  const now = new Date()
  const aVenir = reservations.filter(r => new Date(r.date_rdv) >= now && r.statut !== 'annule')
  const passes = reservations.filter(r => new Date(r.date_rdv) < now || r.statut === 'annule')

  const tabs = [
    { key: 'rdv', label: 'Mes Rendez-vous' },
    { key: 'favoris', label: 'Mes Favoris' },
    { key: 'profil', label: 'Mon Profil' },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/search" style={{ color: '#555', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Nouvelle reservation</Link>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Deconnexion</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: NOIR, padding: '40px 20px', marginBottom: 30 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>Bonjour, <span style={{ color: OR }}>{user.prenom}</span> !</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 6, marginBottom: 0 }}>Gerez vos reservations et vos salons favoris.</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ maxWidth: 1000, margin: '0 auto 15px', padding: '0 20px' }}>
          <div style={{ background: '#d4edda', color: '#155724', padding: '12px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600, border: '1px solid #c3e6cb' }}>{message}</div>
        </div>
      )}

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>

        {/* ONGLETS */}
        <div style={{ display: 'flex', gap: 30, borderBottom: '2px solid #EDE5D8', marginBottom: 30 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: 'none', border: 'none', padding: '12px 0', fontSize: 15,
                fontWeight: activeTab === t.key ? 800 : 500,
                color: activeTab === t.key ? NOIR : '#999',
                borderBottom: activeTab === t.key ? `3px solid ${OR}` : '3px solid transparent',
                marginBottom: -2, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════ TAB : MES RDV ════════ */}
        {activeTab === 'rdv' && (
          <div>
            {/* A venir */}
            <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 15 }}>
              <span style={{ color: OR, marginRight: 8 }}>{'●'}</span>A venir ({aVenir.length})
            </h3>

            {aVenir.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 6, padding: 40, textAlign: 'center', color: '#888', marginBottom: 30 }}>
                Vous n'avez aucun rendez-vous prevu.
                <br />
                <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none', marginTop: 10, display: 'inline-block' }}>Trouver un salon</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
                {aVenir.map(rdv => (
                  <div key={rdv.id} style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: NOIR }}>
                        {rdv.service_nom} <span style={{ fontWeight: 400, color: '#888' }}>chez</span> {rdv.salons?.nom}
                      </div>
                      <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>{formatDate(rdv.date_rdv)}</div>
                      <div style={{ color: OR, fontWeight: 700, fontSize: 14, marginTop: 4 }}>{rdv.service_prix?.toLocaleString()} DA</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Link href={`/salon/${rdv.salons?.id}`} style={{ color: '#888', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>Voir le salon</Link>
                      <button
                        onClick={() => handleCancel(rdv.id)}
                        disabled={cancellingId === rdv.id}
                        style={{
                          background: 'transparent', border: '1px solid #ffcccb', color: '#d32f2f',
                          padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          opacity: cancellingId === rdv.id ? 0.5 : 1,
                        }}
                      >
                        {cancellingId === rdv.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Historique */}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#999', marginBottom: 15 }}>Historique ({passes.length})</h3>

            {passes.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 6, padding: 30, textAlign: 'center', color: '#aaa' }}>
                Aucun historique de rendez-vous.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {passes.map(rdv => (
                  <div key={rdv.id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: NOIR }}>
                        {rdv.service_nom} <span style={{ color: '#aaa' }}>chez</span> {rdv.salons?.nom}
                      </div>
                      <div style={{ color: '#bbb', fontSize: 12, marginTop: 3 }}>{formatDate(rdv.date_rdv)}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                      color: rdv.statut === 'annule' ? '#D32F2F' : rdv.statut === 'termine' ? '#2e7d32' : '#888',
                      textTransform: 'uppercase',
                    }}>
                      {rdv.statut === 'annule' ? 'Annule' : rdv.statut === 'termine' ? 'Termine' : rdv.statut.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ TAB : FAVORIS ════════ */}
        {activeTab === 'favoris' && (
          <div>
            {favoris.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 6, padding: 40, textAlign: 'center', color: '#888' }}>
                {"Vous n'avez pas encore de salons favoris."}
                <br />
                <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none', marginTop: 10, display: 'inline-block' }}>Decouvrir les salons</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {favoris.map((salon: any) => (
                  <Link key={salon.id} href={`/salon/${salon.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #EDE5D8', transition: 'box-shadow 0.2s' }}>
                      <div style={{ height: 160, background: '#eee', overflow: 'hidden' }}>
                        <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => e.target.style.display = 'none'} />
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 0.5 }}>{salon.type_salon}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginTop: 4 }}>{salon.nom}</div>
                        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{'📍'} {salon.ville}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ TAB : MON PROFIL ════════ */}
        {activeTab === 'profil' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 8, padding: 30, marginBottom: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, margin: 0 }}>Mes informations</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{ background: OR, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Modifier
                  </button>
                )}
              </div>

              {editing ? (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Prenom</label>
                    <input value={editPrenom} onChange={e => setEditPrenom(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Nom</label>
                    <input value={editNom} onChange={e => setEditNom(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Email</label>
                    <input value={user.email} disabled style={{ ...inputStyle, background: '#f0f0f0', color: '#999', cursor: 'not-allowed' }} />
                    <span style={{ fontSize: 11, color: '#aaa', marginTop: 4, display: 'block' }}>{"L'email ne peut pas etre modifie"}</span>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Telephone</label>
                    <input value={editTelephone} onChange={e => setEditTelephone(e.target.value)} placeholder="+213 555 123 456" style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      style={{ background: OR, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.5 : 1 }}
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditPrenom(user.prenom); setEditNom(user.nom); setEditTelephone(user.telephone || '') }}
                      style={{ background: '#eee', color: NOIR, border: 'none', padding: '12px 28px', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Nom complet</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: NOIR }}>{user.prenom} {user.nom}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: NOIR }}>{user.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Telephone</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: NOIR }}>{user.telephone || 'Non renseigne'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Zone danger */}
            <div style={{ background: '#fff', border: '1px solid #ffcccb', borderRadius: 8, padding: 24 }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#d32f2f', margin: '0 0 8px' }}>Attention</h4>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.5 }}>
                La suppression est definitive. Vos rendez-vous resteront visibles pour les professionnels mais ne seront plus lies a votre compte.
              </p>
              <button
                onClick={handleDeleteAccount}
                style={{
                  background: 'transparent', border: '1px solid #d32f2f', color: '#d32f2f',
                  padding: '10px 20px', borderRadius: 4, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: 6,
  fontSize: 15, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none',
}
