'use client'

// components/TrackView.tsx
//
// Composant invisible. A poser sur la page publique d'un salon.
// Il fait deux choses :
//   1. enregistre une vue de page a l'affichage
//   2. ecoute les clics sur les liens vers /booking pour enregistrer une
//      intention de reservation, sans qu'il soit necessaire de modifier
//      un seul des liens existants
//
// Il memorise aussi la source dans sessionStorage pour que le tunnel de
// reservation puisse l'utiliser plus tard.

import { useEffect, useRef } from 'react'

const SOURCES_AUTORISEES = ['direct', 'ig', 'qr', 'search', 'fb', 'tiktok', 'wa', 'maps', 'email']

const CLE_SESSION = 'bmdz_sid'
const CLE_SOURCE = 'bmdz_src'

function genererSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function obtenirSessionId(): string {
  try {
    const existant = window.sessionStorage.getItem(CLE_SESSION)
    if (existant) return existant
    const nouveau = genererSessionId()
    window.sessionStorage.setItem(CLE_SESSION, nouveau)
    return nouveau
  } catch {
    // Mode navigation privee ou stockage bloque : on renvoie un identifiant
    // ephemere, la vue sera comptee mais pas dedupliquee.
    return genererSessionId()
  }
}

function envoyer(type: string, salonId: number, source: string, sessionId: string) {
  const charge = JSON.stringify({
    salon_id: salonId,
    type,
    source,
    session_id: sessionId
  })

  try {
    // sendBeacon survit a la navigation : indispensable pour le clic sur
    // "Reserver" qui provoque un changement de page dans la foulee.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([charge], { type: 'application/json' })
      const envoye = navigator.sendBeacon('/api/track', blob)
      if (envoye) return
    }
  } catch {
    // on bascule sur fetch
  }

  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: charge,
      keepalive: true
    }).catch(() => {})
  } catch {
    // Le tracking ne doit jamais faire echouer la page.
  }
}

export default function TrackView({
  salonId,
  source
}: {
  salonId: number
  source: string
}) {
  const vueEnvoyee = useRef(false)

  useEffect(() => {
    if (!salonId) return

    const src = SOURCES_AUTORISEES.includes(source) ? source : 'direct'
    const sessionId = obtenirSessionId()

    // On garde la source pour la suite du tunnel de reservation.
    try {
      if (src !== 'direct') {
        window.sessionStorage.setItem(CLE_SOURCE, src)
      }
    } catch {}

    // Une seule vue par montage. Le garde-fou evite le double appel
    // provoque par le StrictMode de React en developpement.
    if (!vueEnvoyee.current) {
      vueEnvoyee.current = true
      envoyer('vue_page', salonId, src, sessionId)
    }

    // Ecoute globale des clics vers /booking.
    // Aucun lien existant n'a besoin d'etre modifie.
    const gererClic = (event: MouseEvent) => {
      const cible = event.target as HTMLElement | null
      if (!cible || typeof cible.closest !== 'function') return

      const lien = cible.closest('a')
      if (!lien) return

      const href = lien.getAttribute('href') || ''
      if (!href.startsWith('/booking')) return

      envoyer('clic_reserver', salonId, src, sessionId)
    }

    document.addEventListener('click', gererClic)
    return () => document.removeEventListener('click', gererClic)
  }, [salonId, source])

  return null
}
