'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function RegisterPage() {
  const router = useRouter()
  
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!prenom || !nom || !email || !telephone || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, telephone, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/login?registered=true')
      } else {
        setError(data.error || "Une erreur est survenue lors de l'inscription.")
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
            Bookme<span style={{ color: OR }}>.dz</span>
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
            Creer un compte client
          </h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            Rejoignez Bookme.dz pour reserver vos prestations beaute et bien-etre.
          </p>

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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Prenom + Nom sur une ligne en desktop, empiles en mobile */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 140 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>
                  Prenom
                </label>
                <input 
                  type="text" 
                  value={prenom} 
                  onChange={e => setPrenom(e.target.value)} 
                  placeholder="Sarah" 
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
                  autoComplete="given-name"
                />
              </div>
              <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 140 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>
                  Nom
                </label>
                <input 
                  type="text" 
                  value={nom} 
                  onChange={e => setNom(e.target.value)} 
                  placeholder="Benali" 
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
                  autoComplete="family-name"
                />
              </div>
            </div>

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
                Telephone
              </label>
              <input 
                type="tel" 
                value={telephone} 
                onChange={e => setTelephone(e.target.value)} 
                placeholder="+213 555 12 34 56" 
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
                autoComplete="tel"
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
                placeholder="Minimum 6 caracteres" 
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
                autoComplete="new-password"
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
              {loading ? 'Creation en cours...' : "M'inscrire"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
            Vous avez deja un compte ?{' '}
            <Link href="/login" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              Connectez-vous
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
