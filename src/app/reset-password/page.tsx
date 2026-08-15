'use client'
import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const type = searchParams.get('type') || 'client'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isPro = type === 'pro'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caracteres'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type, password }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: NOIR, marginBottom: 12 }}>Lien invalide</h2>
          <p style={{ color: '#888', marginBottom: 20 }}>Ce lien de reinitialisation est invalide ou a expire.</p>
          <Link href="/login" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>Retour a la connexion</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: isPro ? NOIR : BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>

      <Link href="/" style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: isPro ? '#fff' : NOIR, textDecoration: 'none', marginBottom: 40 }}>
        Bookmedz<span style={{ color: OR }}>.com</span>
      </Link>

      <div style={{ background: isPro ? '#111' : '#fff', padding: 'clamp(24px, 5vw, 40px)', borderRadius: 8, border: `1px solid ${isPro ? '#222' : '#E0D8CE'}`, maxWidth: 440, width: '100%' }}>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u2705'}</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: isPro ? '#fff' : NOIR, marginBottom: 12 }}>Mot de passe modifie !</h2>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <Link href={isPro ? '/pro/login' : '/login'} style={{ display: 'inline-block', background: OR, color: '#fff', padding: '12px 28px', borderRadius: 6, fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>
              Se connecter
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: isPro ? '#fff' : NOIR, textAlign: 'center', marginBottom: 24 }}>Nouveau mot de passe</h2>

            {error && <div style={{ background: '#FFF5F5', border: '1px solid #ffcccb', color: '#d32f2f', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: isPro ? '#ccc' : NOIR, display: 'block', marginBottom: 6 }}>Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 caracteres"
                required
                style={{ width: '100%', padding: '12px 14px', border: `1px solid ${isPro ? '#333' : '#E0D8CE'}`, borderRadius: 6, fontSize: 14, background: isPro ? '#0a0a0a' : '#fff', color: isPro ? '#fff' : NOIR, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: isPro ? '#ccc' : NOIR, display: 'block', marginBottom: 6 }}>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Retapez le mot de passe"
                required
                style={{ width: '100%', padding: '12px 14px', border: `1px solid ${isPro ? '#333' : '#E0D8CE'}`, borderRadius: 6, fontSize: 14, background: isPro ? '#0a0a0a' : '#fff', color: isPro ? '#fff' : NOIR, boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !password || !confirm}
              style={{ width: '100%', padding: '14px', background: OR, color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Modification...' : 'Modifier mon mot de passe'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
