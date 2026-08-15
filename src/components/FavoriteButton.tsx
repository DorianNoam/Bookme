'use client'
import React, { useState, useEffect } from 'react'

export default function FavoriteButton({ salonId }: { salonId: string }) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/favoris?salon_id=${salonId}`)
      .then(res => res.json())
      .then(data => setIsFav(data.isFavorite))
      .catch(() => {})
  }, [salonId])

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/favoris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: salonId }),
      })
      const data = await res.json()
      if (data.success) setIsFav(data.isFavorite)
      if (data.error) alert('Connectez-vous pour ajouter des favoris')
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: isFav ? 'rgba(184,146,42,0.2)' : 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isFav ? '#B8922A' : '#fff',
        cursor: 'pointer',
        border: isFav ? '1px solid #B8922A' : '1px solid rgba(255,255,255,0.2)',
        fontSize: 20,
        transition: 'all 0.2s',
        padding: 0,
      }}
    >
      {isFav ? '\u2665' : '\u2661'}
    </button>
  )
}
