'use client'

import React from 'react'

export default function SalonMap({ salons, hoveredSalonId }: { salons: any[], hoveredSalonId: number | null }) {
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
        bottom: 12, 
        left: 12, 
        background: '#0A0A0A', 
        color: '#F8F5F0', 
        padding: '8px 14px', 
        borderRadius: 4, 
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid #B8922A'
      }}>
        📍 {salons.length} établissement{salons.length > 1 ? 's' : ''} trouvé{salons.length > 1 ? 's' : ''} en Algérie
      </div>
    </div>
  )
}
