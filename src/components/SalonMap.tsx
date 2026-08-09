'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const VILLE_COORDS: Record<string, [number, number]> = {
  'Alger': [36.7538, 3.0588],
  'Oran': [35.6971, -0.6309],
  'Constantine': [36.3650, 6.6147],
  'Annaba': [36.9000, 7.7667],
  'Blida': [36.4700, 2.8277],
  'Setif': [36.1900, 5.4100],
  'Tlemcen': [34.8783, -1.3150]
};

export default function SalonMap({ salons, hoveredSalonId }: { salons: any[], hoveredSalonId: number | null }) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Record<number, L.Marker>>({})

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [36.7538, 3.0588],
        zoom: 6,
        scrollWheelZoom: false
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    if (salons.length === 0) return

    const bounds = L.latLngBounds([])

    salons.forEach((salon, index) => {
      const baseCoords = VILLE_COORDS[salon.ville] || [36.7538, 3.0588]
      const offsetLat = baseCoords[0] + (index * 0.008 * Math.cos(index))
      const offsetLng = baseCoords[1] + (index * 0.008 * Math.sin(index))

      const marker = L.marker([offsetLat, offsetLng]).addTo(map)

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 160px; padding: 4px;">
          <strong style="font-size: 14px; color: #0A0A0A;">${salon.nom}</strong>
          <p style="margin: 4px 0 8px 0; font-size: 12px; color: #666;">📍 ${salon.ville} — ${salon.adresse}</p>
          <a href="/salon/${salon.id}" style="color: #B8922A; font-weight: 700; text-decoration: none;">Voir le salon →</a>
        </div>
      `)

      markersRef.current[salon.id] = marker
      bounds.extend([offsetLat, offsetLng])
    })

    if (salons.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
    }

  }, [salons])

  useEffect(() => {
    if (!mapRef.current || !hoveredSalonId) return
    const marker = markersRef.current[hoveredSalonId]
    if (marker) {
      marker.openPopup()
      mapRef.current.setView(marker.getLatLng(), 13, { animate: true })
    }
  }, [hoveredSalonId])

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
  )
}
