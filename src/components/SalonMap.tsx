'use client'

import React from 'react'

export default function SalonMap({ salons, hoveredSalonId }: { salons: any[], hoveredSalonId: number | null }) {
  // Recherche si un salon est survolé pour centrer la carte dessus, sinon prend le premier salon ou affiche l'Algérie
  const hoveredSalon = salons.find(s => s.id === hoveredSalonId)
  const targetSalon = hoveredSalon || (salons.length > 0 ? salons[0] : null)
  
  const query = targetSalon 
    ? `${targetSalon.nom}, ${targetSalon.ville}, Algérie` 
    : 'Algérie'

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#e5e3df' }}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapSrc}
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
        border: '1px solid #B8922A',
        pointerEvents: 'none'
      }}>
        📍 {salons.length} établissement{salons.length > 1 ? 's' : ''} affiché{salons.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}
