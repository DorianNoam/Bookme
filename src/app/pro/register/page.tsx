'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

const TYPES_SALON = ['Coiffure', 'Barbier', 'Beaute des ongles', 'Massage et bien-etre', 'Hammam & Spa', 'Chirurgie esthetique', 'Institut']
const VILLES = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif', 'Blida', 'Tlemcen', 'Batna', 'Bejaia', 'Tizi Ouzou', 'Djelfa', 'Biskra', 'Sidi Bel Abbes', 'Mostaganem', 'Skikda', 'Chlef', 'Bordj Bou Arreridj', 'Medea', 'El Oued', 'Bouira', 'Boumerdes', 'Tipaza', 'Ghardaia', 'Ouargla', 'Autre']

function ProRegisterContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Etape 1 : infos personnelles
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')

  // Etape 2 : infos salon
  const [salonNom, setSalonNom] = useState('')
  const [typeSalon, setTypeSalon] = useState('Coiffure')
  const [ville, setVille] = useState('')
  const [adresse, setAdresse] = useState('')
  const [instagram, setInstagram] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!prenom || !nom || !email || !telephone || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.')
      return
    }
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!salonNom || !ville) {
      setError('Le nom du salon et la ville sont obligatoires.')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/pro/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom, nom, email, password, telephone,
          salon_nom: salonNom,
          type_salon: typeSalon,
          ville,
          adresse,
          instagram: instagram.replace('@', '').trim()
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        window.location.href = '/pro/dashboard'
      } else {
        setError(data.error || "Erreur lors de l'inscription.")
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#000',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: 4,
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    fontFamily: 'Inter, sans-serif'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: NOIR, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <header style={{ padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#fff', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>.dz</span>
            <span style={{ fontWeight: 400, fontSize: 'clamp(12px, 2.5vw, 16px)', color: '#888', marginLeft: 8 }}>Pro</span>
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          padding: 'clamp(24px, 5vw, 40px)',
          width: '100%',
          maxWidth: 520
        }}>

          {/* Indicateur d'etape */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: OR, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800
            }}>1</div>
            <div style={{ width: 40, height: 2, background: step >= 2 ? OR : '#333' }} />
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step >= 2 ? OR : '#333',
              color: step >= 2 ? '#fff' : '#666',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800
            }}>2</div>
          </div>

          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
            {step === 1 ? 'Devenir Partenaire' : 'Votre etablissement'}
          </h1>
          <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {step === 1
              ? 'Rejoignez Bookme.dz et developpez votre activite.'
              : 'Dites-nous en plus sur votre salon.'}
          </p>

          {error && (
            <div style={{
              background: 'rgba(211, 47, 47, 0.1)',
              color: '#ff6b6b',
              padding: '12px 16px',
              borderRadius: 4,
              fontSize: 13,
              marginBottom: 16,
              fontWeight: 500,
              textAlign: 'center',
              border: '1px solid rgba(211, 47, 47, 0.3)'
            }}>
              {error}
            </div>
          )}

          {/* ══════ ETAPE 1 : INFOS PERSONNELLES ══════ */}
          {step === 1 && (
            <form onSubmit={goToStep2} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 calc(50% - 5px)', minWidth: 140 }}>
                  <label style={labelStyle}>Prenom</label>
                  <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ex: Tarek" style={inputStyle} required autoComplete="given-name" />
                </div>
                <div style={{ flex: '1 1 calc(50% - 5px)', minWidth: 140 }}>
                  <label style={labelStyle}>Nom</label>
                  <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Mansouri" style={inputStyle} required autoComplete="family-name" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email professionnel</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@votre-salon.dz" style={inputStyle} required autoComplete="email" />
              </div>

              <div>
                <label style={labelStyle}>Telephone</label>
                <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="0555 12 34 56" style={inputStyle} required autoComplete="tel" />
              </div>

              <div>
                <label style={labelStyle}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 caracteres" style={inputStyle} required autoComplete="new-password" />
              </div>

              <button type="submit" style={{
                width: '100%', padding: '14px 0', background: OR, color: '#fff',
                border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 15,
                cursor: 'pointer', marginTop: 6
              }}>
                Continuer
              </button>
            </form>
          )}

          {/* ══════ ETAPE 2 : INFOS SALON ══════ */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nom de votre salon / etablissement *</label>
                <input type="text" value={salonNom} onChange={e => setSalonNom(e.target.value)} placeholder="Ex: Salon Yasmina" style={inputStyle} required />
              </div>

              <div>
                <label style={labelStyle}>Type d'etablissement *</label>
                <select value={typeSalon} onChange={e => setTypeSalon(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {TYPES_SALON.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Ville *</label>
                <select value={ville} onChange={e => setVille(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} required>
                  <option value="">Choisir une ville...</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Adresse (optionnel)</label>
                <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Rue, quartier..." style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Instagram (optionnel)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: 14 }}>@</span>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="votre_compte_insta" style={{ ...inputStyle, paddingLeft: 32 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError('') }}
                  style={{
                    flex: 1, padding: '14px 0', background: 'transparent',
                    color: '#888', border: '1px solid #333', borderRadius: 4,
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2, padding: '14px 0',
                    background: loading ? '#555' : OR, color: '#fff',
                    border: 'none', borderRadius: 4, fontWeight: 800,
                    fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? "Creation en cours..." : "S'inscrire"}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' }}>
            Deja un compte ?{' '}
            <Link href="/pro/login" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function ProRegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: NOIR, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        Chargement...
      </div>
    }>
      <ProRegisterContent />
    </Suspense>
  )
}
