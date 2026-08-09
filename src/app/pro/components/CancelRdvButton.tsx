'use client'

import { useState } from 'react'

export default function CancelRdvButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  async function handleCancel() {
    if (!confirm('Annuler ce rendez-vous ?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/pro/reservations/${id}`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) setCancelled(true)
    } catch {}
    setLoading(false)
  }

  if (cancelled) {
    return <span style={{ fontSize: 12, fontWeight: 700, color: '#d32f2f' }}>Annule</span>
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      style={{
        background: 'transparent',
        border: '1px solid #ffcccb',
        color: '#d32f2f',
        padding: '5px 12px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 700,
        cursor: loading ? 'wait' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? '...' : 'Annuler'}
    </button>
  )
}
