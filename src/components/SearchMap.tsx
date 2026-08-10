'use client'

import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

const OR = '#B8922A'
const NOIR = '#0A0A0A'

// Fix Leaflet default icon issue with webpack
function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Custom marker icons
function createIcon(isHovered: boolean) {
  const size = isHovered ? 18 : 12
  const border = isHovered ? `3px solid ${OR}` : `2px solid #fff`
  const bg = isHovered ? NOIR : OR
  const shadow = isHovered ? '0 0 12px rgba(184,146,42,0.6)' : '0 2px 6px rgba(0,0,0,0.3)'
  const zIndex = isHovered ? 1000 : 1

  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      border: ${border};
      border-radius: 50%;
      box-shadow: ${shadow};
      transition: all 0.2s ease;
      z-index: ${zIndex};
    "></div>`,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
  })
}

// Component to fly to hovered salon
function FlyToMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 0.8 })
    }
  }, [lat, lng, map])
  return null
}

type Salon = {
  id: number
  nom: string
  ville: string
  adresse: string
  image: string
  latitude?: number
  longitude?: number
  type_salon?: string
}

type Props = {
  salons: Salon[]
  hoveredSalonId: number | null
  onMarkerClick?: (id: number) => void
}

export default function SearchMap({ salons, hoveredSalonId, onMarkerClick }: Props) {
  const mapRef = useRef<any>(null)

  useEffect(() => {
    fixLeafletIcons()
  }, [])

  // Inject Leaflet CSS
  useEffect(() => {
    const id = 'leaflet-css'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }
  }, [])

  // Only show salons with coordinates
  const mappable = salons.filter(s => s.latitude && s.longitude)

  // Default center: first salon with coords, or Algiers
  const defaultCenter: [number, number] = mappable.length > 0
    ? [mappable[0].latitude!, mappable[0].longitude!]
    : [36.7538, 3.0588] // Alger

  const hoveredSalon = mappable.find(s => s.id === hoveredSalonId)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zoom control en bas a droite */}
        <ZoomControlBottomRight />

        {mappable.map(salon => (
          <Marker
            key={salon.id}
            position={[salon.latitude!, salon.longitude!]}
            icon={createIcon(salon.id === hoveredSalonId)}
            eventHandlers={{
              click: () => onMarkerClick?.(salon.id),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: NOIR, marginBottom: 4 }}>{salon.nom}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{salon.adresse}</div>
                <div style={{ fontSize: 12, color: OR, fontWeight: 700 }}>{salon.type_salon || 'Salon'}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {hoveredSalon && (
          <FlyToMarker lat={hoveredSalon.latitude!} lng={hoveredSalon.longitude!} />
        )}
      </MapContainer>

      {/* Badge compteur */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        background: NOIR,
        color: '#F8F5F0',
        padding: '6px 12px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: `1px solid ${OR}`,
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        {mappable.length} etablissement{mappable.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}

// Place zoom controls bottom-right
function ZoomControlBottomRight() {
  const map = useMap()
  useEffect(() => {
    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }, [map])
  return null
}
