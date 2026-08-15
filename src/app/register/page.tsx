'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  
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
        setError(data.error || "Une erreur est survenue.")
      }
    } catch {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: NOIR, textDecoration: 'none' }}>
          Bookmedz<span style={{ color: OR }}>.com</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 8, padding: 'clamp(24px, 5vw, 40px)', width: '100%', maxWidth: 450, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: NOIR, marginBottom: 8, textAlign: 'center' }}>
            {t.auth.creerCompte}
          </h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {t.auth.rejoignez}
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#b91c1c', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 140 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.auth.prenom}</label>
                <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Sarah" required autoComplete="given-name"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 140 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.auth.nom}</label>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Benali" required autoComplete="family-name"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.auth.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required autoComplete="email"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.auth.telephone}</label>
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+213 555 12 34 56" required autoComplete="tel"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.auth.motDePasse}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 caractères" required autoComplete="new-password"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 18, color: '#888', lineHeight: 1 }}>
                  {showPass ? '\uD83D\uDE48' : '\uD83D\uDC41'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px 0', background: loading ? '#999' : NOIR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
              {loading ? t.auth.creation : t.auth.inscrire}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid #E0D8CE', fontSize: 14, color: '#666' }}>
            {t.auth.dejaCompte}{' '}
            <Link href="/login" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              {t.auth.connectezVousLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
