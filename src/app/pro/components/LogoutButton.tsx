'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const OR = '#B8922A'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/pro/auth/logout', { method: 'POST' })
    } catch (e) {
      // Même si l'API échoue, on redirige quand même
    }
    window.location.href = '/pro/login'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#ff6b6b',
        fontSize: 13,
        fontWeight: 700,
        cursor: loading ? 'wait' : 'pointer',
        marginLeft: 10,
        fontFamily: 'Inter, sans-serif',
        padding: 0,
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? 'Déconnexion...' : 'Déconnexion'}
    </button>
  )
}
