'use client'

import React from 'react'

export default function SalonMap({ salons }: { salons: any[] }) {
  // Coordonnées centrées sur l'Algérie (Alger)
  const mapSrc = "https://www.openstreetmap.org/export/embed.html?bbox=2.9,36.6,3.2,36.9&layer=mapnik&marker=36.7538,3.0588"

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#e5e3df' }}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src="https://www.openstreetmap.org/export/embed.html?bbox=-1.0,34.0,9.0,37.5&layer=mapnik"
        title="Carte des salons en Algérie"
      />
      <div style={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        background: 'rgba(10,10,10,0.85)', 
        color: '#fff', 
        padding: '6px 12px', 
        borderRadius: 4, 
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        pointerEvents: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }}>
        📍 {salons.length} établissement{salons.length > 1 ? 's' : ''} affiché{salons.length > 1 ? 's' : ''} en Algérie
      </div>
    </div>
  )
}
