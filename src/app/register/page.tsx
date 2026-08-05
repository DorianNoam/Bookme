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
        // Redirection vers la page de connexion après inscription réussie
        router.push('/login?registered=true')
      } else {
        setError(data.error || 'Une erreur est survenue lors de l\'inscription.')
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
          
          <h1 style={{ fontSize: 24, fontWeight: 900, color: NOIR, marginBottom: 8, textAlign: 'center' }}>Créer un compte client</h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 30 }}>
            Rejoignez Bookme.dz pour réserver vos prestations beauté et bien-être.
          </p>

          {error && (
            <div style={{ background: '#FFF0F0', color: '#d32f2f', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20, fontWeight: 500, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Prénom</label>
                <input 
                  type="text" 
                  value={prenom} 
                  onChange={e => setPrenom(e.target.value)} 
                  placeholder="Ex: Amina" 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Nom</label>
                <input 
                  type="text" 
                  value={nom} 
                  onChange={e => setNom(e.target.value)} 
                  placeholder="Ex: Belkacem" 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, outline: 'none' }} 
                  required
                />
              </div>
            </div>

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
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Téléphone</label>
              <input 
                type="tel" 
                value={telephone} 
                onChange={e => setTelephone(e.target.value)} 
                placeholder="+213 555 12 34 56" 
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
              {loading ? 'Création en cours...' : 'M\'inscrire'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
            Vous avez déjà un compte ?{' '}
            <Link href="/login" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              Connectez-vous
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
