'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Email ou mot de passe incorrect')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <header style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: NOIR, textDecoration: 'none' }}>
          Bookme<span style={{ color: OR }}>dz</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', padding: 'clamp(24px, 5vw, 40px)', borderRadius: 8, border: '1px solid #E0D8CE', maxWidth: 440, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>

          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: NOIR, textAlign: 'center', marginBottom: 8 }}>{t.auth.bonRetour}</h1>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>{t.auth.connectezVous}</p>

          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #ffcccb', color: '#d32f2f', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 14, background: '#fff', color: NOIR, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>{t.auth.motDePasse}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  style={{ width: '100%', padding: '12px 44px 12px 14px', border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 14, background: '#fff', color: NOIR, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 18, color: '#888', lineHeight: 1 }}
                >
                  {showPass ? '\uD83D\uDE48' : '\uD83D\uDC41'}
                </button>
              </div>
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
                borderRadius: 6,
                fontWeight: 800,
                fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {loading ? '...' : t.auth.seConnecter}
            </button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Link href="/forgot-password?type=client" style={{ color: OR, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {t.auth.mdpOublie}
              </Link>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid #E0D8CE', color: '#888', fontSize: 14 }}>
            {t.auth.pasDeCompte}{' '}
            <Link href="/register" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              {t.auth.inscrivezVous}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
