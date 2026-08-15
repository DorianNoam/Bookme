'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const redirectUrl = searchParams.get('redirect') || '/dashboard'
  const justRegistered = searchParams.get('registered') === 'true'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        window.location.href = redirectUrl
      } else {
        setError(data.error || 'Email ou mot de passe incorrect.')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>dz</span>
          </Link>
        </div>
      </header>

      {/* CONTENU */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{
          background: '#fff',
          border: '1px solid #EDE5D8',
          borderRadius: 6,
          padding: 'clamp(24px, 5vw, 40px)',
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: NOIR, marginBottom: 8, textAlign: 'center' }}>
            Bon retour !
          </h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            Connectez-vous pour gerer vos reservations.
          </p>

          {justRegistered && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 4,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#166534',
              textAlign: 'center'
            }}>
              Inscription reussie ! Connectez-vous maintenant.
            </div>
          )}

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 4,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#b91c1c',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="votre@email.com" 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E0D8CE',
                  borderRadius: 4,
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none'
                }} 
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>
                Mot de passe
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Votre mot de passe" 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E0D8CE',
                  borderRadius: 4,
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none'
                }} 
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{
                width: '100%',
                padding: '14px 0',
                background: loading ? '#999' : NOIR,
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontWeight: 800,
                fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                transition: 'background 0.2s',
                WebkitAppearance: 'none'
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              Inscrivez-vous
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: BG,
        color: NOIR,
        fontFamily: 'Inter, sans-serif'
      }}>
        Chargement...
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
