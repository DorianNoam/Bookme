'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

function ProRegisterContent() {
  const router = useRouter()
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telephone, setTelephone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/pro/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, password, telephone }),
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

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: NOIR, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: '#fff', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>.dz</span> <span style={{ fontWeight: 400, fontSize: 16, color: '#888' }}>| Pro</span>
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '40px', width: '100%', maxWidth: 500 }}>
          
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8, textAlign: 'center' }}>Devenir Partenaire</h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 30 }}>
            Rejoignez Bookme.dz et développez votre activité.
          </p>

          {error && (
            <div style={{ background: 'rgba(211, 47, 47, 0.1)', color: '#ff6b6b', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20, fontWeight: 500, textAlign: 'center', border: '1px solid rgba(211, 47, 47, 0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6 }}>Prénom</label>
                <input 
                  type="text" 
                  value={prenom} 
                  onChange={e => setPrenom(e.target.value)} 
                  placeholder="Ex: Tarek" 
                  style={{ width: '100%', padding: '12px 16px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6 }}>Nom</label>
                <input 
                  type="text" 
                  value={nom} 
                  onChange={e => setNom(e.target.value)} 
                  placeholder="Ex: Mansouri" 
                  style={{ width: '100%', padding: '12px 16px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6 }}>Email professionnel</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="contact@votre-salon.dz" 
                style={{ width: '100%', padding: '12px 16px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6 }}>Téléphone</label>
              <input 
                type="tel" 
                value={telephone} 
                onChange={e => setTelephone(e.target.value)} 
                placeholder="0555 12 34 56" 
                style={{ width: '100%', padding: '12px 16px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px 16px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', padding: '14px 0', background: loading ? '#555' : OR, color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10, transition: 'background 0.2s' }}
            >
              {loading ? 'Création en cours...' : "S'inscrire"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' }}>
            Déjà un compte ?{' '}
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
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: NOIR, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Chargement...</div>}>
      <ProRegisterContent />
    </Suspense>
  )
}
