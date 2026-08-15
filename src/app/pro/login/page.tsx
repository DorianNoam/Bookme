'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

function ProLoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/pro/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Rediriger selon le role
        if (data.role === 'employe') {
          window.location.href = '/pro/agenda'
        } else {
          window.location.href = '/pro/dashboard'
        }
      } else {
        setError(data.error || 'Identifiants incorrects.')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: NOIR, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <header style={{ padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#fff', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>dz</span>
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
          maxWidth: 450
        }}>

          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: '#fff', marginBottom: 6, textAlign: 'center' }}>Espace Partenaire</h1>
          <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            Gerez votre salon et vos reservations.
          </p>

          {/* Info collaborateur */}
          <div style={{ background: 'rgba(184,146,42,0.1)', border: `1px solid rgba(184,146,42,0.2)`, borderRadius: 4, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
            {'👤'} Proprietaire ou collaborateur ? Connectez-vous avec vos identifiants. Les collaborateurs ont acces uniquement a l'agenda.
          </div>

          {error && (
            <div style={{
              background: 'rgba(211, 47, 47, 0.1)', color: '#ff6b6b', padding: '12px 16px',
              borderRadius: 4, fontSize: 13, marginBottom: 16, fontWeight: 500,
              textAlign: 'center', border: '1px solid rgba(211, 47, 47, 0.3)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@emaildz"
                style={{ width: '100%', padding: '12px 16px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: 4, fontSize: 16, outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                style={{ width: '100%', padding: '12px 16px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: 4, fontSize: 16, outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0',
                background: loading ? '#555' : OR, color: '#fff',
                border: 'none', borderRadius: 4, fontWeight: 800,
                fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 6, transition: 'background 0.2s'
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' }}>
            Pas encore de compte ?{' '}
            <Link href="/pro/register" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              Creer mon compte pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: NOIR, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        Chargement...
      </div>
    }>
      <ProLoginContent />
    </Suspense>
  )
}
