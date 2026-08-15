'use client'
import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'client'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setLoading(false)
  }

  const isPro = type === 'pro'

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: isPro ? NOIR : BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>

      <Link href="/" style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: isPro ? '#fff' : NOIR, textDecoration: 'none', marginBottom: 40 }}>
        Bookmedz<span style={{ color: OR }}>.com</span>
        {isPro && <span style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>Pro</span>}
      </Link>

      <div style={{ background: isPro ? '#111' : '#fff', padding: 'clamp(24px, 5vw, 40px)', borderRadius: 8, border: `1px solid ${isPro ? '#222' : '#E0D8CE'}`, maxWidth: 440, width: '100%' }}>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u2709\uFE0F'}</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: isPro ? '#fff' : NOIR, marginBottom: 12 }}>Email envoye !</h2>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Si un compte existe avec l&apos;adresse <strong style={{ color: isPro ? '#fff' : NOIR }}>{email}</strong>, vous recevrez un lien pour reinitialiser votre mot de passe.
            </p>
            <Link href={isPro ? '/pro/login' : '/login'} style={{ color: OR, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              &larr; Retour a la connexion
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: isPro ? '#fff' : NOIR, textAlign: 'center', marginBottom: 8 }}>Mot de passe oublie ?</h2>
            <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
              Entrez votre email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
            </p>

            {error && <div style={{ background: '#FFF5F5', border: '1px solid #ffcccb', color: '#d32f2f', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: isPro ? '#ccc' : NOIR, display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{ width: '100%', padding: '12px 14px', border: `1px solid ${isPro ? '#333' : '#E0D8CE'}`, borderRadius: 6, fontSize: 14, background: isPro ? '#0a0a0a' : '#fff', color: isPro ? '#fff' : NOIR, boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              style={{ width: '100%', padding: '14px', background: OR, color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link href={isPro ? '/pro/login' : '/login'} style={{ color: OR, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                &larr; Retour a la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
