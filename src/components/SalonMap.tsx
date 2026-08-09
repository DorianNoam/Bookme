'use client'

import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function SalonMap({ salons }: { salons: any[] }) {
  const defaultCenter: [number, number] = [36.7538, 3.0588] // Centré sur Alger par défaut

  return (
    <MapContainer center={defaultCenter} zoom={6} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {salons.map((salon, index) => {
        const lat = salon.lat || (36.75 + (index * 0.02))
        const lng = salon.lng || (3.05 + (index * 0.02))

        return (
          <Marker key={salon.id} position={[lat, lng]}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong style={{ fontSize: 14 }}>{salon.nom}</strong>
                <p style={{ margin: '4px 0 8px 0', fontSize: 12, color: '#666' }}>📍 {salon.ville}</p>
                <a href={`/salon/${salon.id}`} style={{ color: '#B8922A', fontWeight: 700, textDecoration: 'none' }}>Voir le salon →</a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
