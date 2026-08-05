'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const redirectUrl = searchParams.get('redirect') || '/'
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
        // Redirection vers la page d'où il vient (ou l'accueil)
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
      
      {/* HEADER SIMPLE */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 6, padding: '40px', width: '100%', maxWidth: 450, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          <h1 style={{ fontSize: 24, fontWeight: 900, color: NOIR, marginBottom: 8, textAlign: 'center' }}>Bon retour !</h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 30 }}>
            Connectez-vous pour gérer vos réservations.
          </p>

          {/* MESSAGE SUCCÈS INSCRIPTION */}
          {justRegistered && (
            <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20, fontWeight: 600, textAlign: 'center', border: '1px solid #C8E6C9' }}>
              Compte créé avec succès ! Veuillez vous connecter.
            </div>
          )}

          {/* MESSAGE ERREUR */}
          {error && (
            <div style={{ background: '#FFF0F0', color: '#d32f2f', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20, fontWeight: 500, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="amina@email.dz" 
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', padding: '14px 0', background: loading ? '#999' : NOIR, color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10, transition: 'background 0.2s' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
            Nouveau sur Bookme.dz ?{' '}
            <Link href="/register" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement...</div>}>
      <LoginContent />
    </Suspense>
  )
}
