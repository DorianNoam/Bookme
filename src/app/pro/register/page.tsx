'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

const TYPES_SALON = ['Coiffure', 'Barbier', 'Beaute des ongles', 'Massage et bien-etre', 'Hammam & Spa', 'Chirurgie esthetique', 'Institut']
const VILLES = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif', 'Blida', 'Tlemcen', 'Batna', 'Bejaia', 'Tizi Ouzou', 'Djelfa', 'Biskra', 'Sidi Bel Abbes', 'Mostaganem', 'Skikda', 'Chlef', 'Bordj Bou Arreridj', 'Medea', 'El Oued', 'Bouira', 'Boumerdes', 'Tipaza', 'Ghardaia', 'Ouargla', 'Autre']

declare global {
  interface Window {
    google: any
    initGooglePlaces: () => void
  }
}

function ProRegisterContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')

  const [salonNom, setSalonNom] = useState('')
  const [typeSalon, setTypeSalon] = useState('Coiffure')
  const [ville, setVille] = useState('')
  const [adresse, setAdresse] = useState('')
  const [instagram, setInstagram] = useState('')

  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const autocompleteRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Charger Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey || window.google) {
      if (window.google) setGoogleLoaded(true)
      return
    }

    window.initGooglePlaces = () => {
      setGoogleLoaded(true)
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces&language=fr`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      window.initGooglePlaces = undefined as any
    }
  }, [])

  // Initialiser l'autocomplete quand Google est charge et qu'on est a l'etape 2
  useEffect(() => {
    if (!googleLoaded || step !== 2 || !inputRef.current) return
    if (autocompleteRef.current) return

    // Petit delai pour s'assurer que l'input est monte
    const timer = setTimeout(() => {
      if (!inputRef.current || !window.google) return

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'dz' },
        fields: ['formatted_address', 'geometry', 'address_components'],
        types: ['address']
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry) return

        // Extraire l'adresse sans la ville ni le pays (deja dans le select)
        const components = place.address_components || []
        const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || ''
        const route = components.find((c: any) => c.types.includes('route'))?.long_name || ''
        const sublocality = components.find((c: any) => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'))?.long_name || ''
        const neighborhood = components.find((c: any) => c.types.includes('neighborhood'))?.long_name || ''

        let shortAddress = ''
        if (streetNumber && route) {
          shortAddress = `${streetNumber} ${route}`
        } else if (route) {
          shortAddress = route
        } else if (sublocality) {
          shortAddress = sublocality
        } else if (neighborhood) {
          shortAddress = neighborhood
        } else {
          // Prendre le formatted_address et retirer ville + pays
          const formatted = place.formatted_address || ''
          const parts = formatted.split(',')
          shortAddress = parts.slice(0, Math.max(1, parts.length - 2)).join(',').trim()
        }

        setAdresse(shortAddress)
        setLatitude(place.geometry.location.lat())
        setLongitude(place.geometry.location.lng())
      })

      autocompleteRef.current = autocomplete
    }, 200)

    return () => clearTimeout(timer)
  }, [googleLoaded, step])

  // Reset autocomplete quand on change d'etape
  useEffect(() => {
    if (step !== 2) {
      autocompleteRef.current = null
    }
  }, [step])

  function handleUsePosition() {
    if (!navigator.geolocation) {
      alert("La geolocalisation n'est pas supportee par votre navigateur.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLatitude(lat)
        setLongitude(lng)

        // Reverse geocoding avec Google
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
              const components = results[0].address_components || []
              const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || ''
              const route = components.find((c: any) => c.types.includes('route'))?.long_name || ''
              if (streetNumber && route) {
                setAdresse(`${streetNumber} ${route}`)
              } else if (route) {
                setAdresse(route)
              } else {
                setAdresse(results[0].formatted_address.split(',')[0].trim())
              }
            }
          })
        }
      },
      () => {
        alert('Impossible de recuperer votre position.')
      }
    )
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!prenom || !nom || !email || !telephone || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.')
      return
    }
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!salonNom || !ville || !adresse) {
      setError("Le nom du salon, la ville et l'adresse sont obligatoires.")
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/pro/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom, nom, email, password, telephone,
          salon_nom: salonNom,
          type_salon: typeSalon,
          ville,
          adresse,
          instagram: instagram.replace('@', '').trim(),
          latitude,
          longitude
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        window.location.href = '/pro/dashboard'
      } else {
        setError(data.error || "Erreur lors de l'inscription.")
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#000',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: 4,
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    fontFamily: 'Inter, sans-serif'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: '#aaa', display: 'block', marginBottom: 6
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: NOIR, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Style pour le dropdown Google Places Autocomplete */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pac-container {
          background: #1a1a1a !important;
          border: 1px solid #333 !important;
          border-top: none !important;
          border-radius: 0 0 6px 6px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
          font-family: Inter, sans-serif !important;
          z-index: 10000 !important;
        }
        .pac-item {
          padding: 10px 16px !important;
          border-top: 1px solid #222 !important;
          color: #fff !important;
          font-size: 14px !important;
          cursor: pointer !important;
          line-height: 1.5 !important;
        }
        .pac-item:first-child {
          border-top: none !important;
        }
        .pac-item:hover, .pac-item-selected {
          background: #222 !important;
        }
        .pac-item-query {
          color: #fff !important;
          font-weight: 700 !important;
          font-size: 14px !important;
        }
        .pac-matched {
          color: ${OR} !important;
          font-weight: 700 !important;
        }
        .pac-item .pac-item-query + span {
          color: #888 !important;
          font-weight: 400 !important;
        }
        .pac-icon {
          display: none !important;
        }
        .pac-item::before {
          content: "📍";
          margin-right: 10px;
          font-size: 14px;
        }
        .pac-logo::after {
          display: none !important;
        }
        .hdpi.pac-logo::after {
          display: none !important;
        }
      `}} />

      <header style={{ padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#fff', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>dz</span>
            <span style={{ fontWeight: 400, fontSize: 'clamp(12px, 2.5vw, 16px)', color: '#888', marginLeft: 8 }}>Pro</span>
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          padding: 'clamp(24px, 5vw, 40px)',
          width: '100%',
          maxWidth: 520
        }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: OR, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800
            }}>1</div>
            <div style={{ width: 40, height: 2, background: step >= 2 ? OR : '#333' }} />
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step >= 2 ? OR : '#333',
              color: step >= 2 ? '#fff' : '#666',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800
            }}>2</div>
          </div>

          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
            {step === 1 ? 'Devenir Partenaire' : 'Votre etablissement'}
          </h1>
          <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {step === 1
              ? 'Rejoignez Bookmedz et developpez votre activite.'
              : 'Dites-nous en plus sur votre salon.'}
          </p>

          {error && (
            <div style={{
              background: 'rgba(211, 47, 47, 0.1)',
              color: '#ff6b6b',
              padding: '12px 16px',
              borderRadius: 4,
              fontSize: 13,
              marginBottom: 16,
              fontWeight: 500,
              textAlign: 'center',
              border: '1px solid rgba(211, 47, 47, 0.3)'
            }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={goToStep2} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 calc(50% - 5px)', minWidth: 140 }}>
                  <label style={labelStyle}>Prenom</label>
                  <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ex: Tarek" style={inputStyle} required autoComplete="given-name" />
                </div>
                <div style={{ flex: '1 1 calc(50% - 5px)', minWidth: 140 }}>
                  <label style={labelStyle}>Nom</label>
                  <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Mansouri" style={inputStyle} required autoComplete="family-name" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email professionnel</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@votre-salondz" style={inputStyle} required autoComplete="email" />
              </div>

              <div>
                <label style={labelStyle}>Telephone</label>
                <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="0555 12 34 56" style={inputStyle} required autoComplete="tel" />
              </div>

              <div>
                <label style={labelStyle}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 caracteres" style={inputStyle} required autoComplete="new-password" />
              </div>

              <button type="submit" style={{
                width: '100%', padding: '14px 0', background: OR, color: '#fff',
                border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 15,
                cursor: 'pointer', marginTop: 6
              }}>
                Continuer
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nom de votre salon / etablissement *</label>
                <input type="text" value={salonNom} onChange={e => setSalonNom(e.target.value)} placeholder="Ex: Salon Yasmina" style={inputStyle} required />
              </div>

              <div>
                <label style={labelStyle}>Type d&apos;etablissement *</label>
                <select value={typeSalon} onChange={e => setTypeSalon(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {TYPES_SALON.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Ville *</label>
                <select value={ville} onChange={e => setVille(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} required>
                  <option value="">Choisir une ville...</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Adresse *</label>

                <button
                  type="button"
                  onClick={handleUsePosition}
                  style={{
                    width: '100%', padding: '10px 16px', marginBottom: 8,
                    background: 'transparent', border: '1px dashed #444',
                    borderRadius: 4, color: '#888', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = OR)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#444')}
                >
                  <span style={{ fontSize: 16 }}>&#128205;</span> Utiliser ma position
                </button>

                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#666', zIndex: 1 }}>&#128204;</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={adresse}
                    onChange={e => { setAdresse(e.target.value); setLatitude(null); setLongitude(null) }}
                    placeholder="Tapez votre adresse..."
                    style={{ ...inputStyle, paddingLeft: 40, border: latitude ? `1px solid ${OR}` : '1px solid #333' }}
                    required
                    autoComplete="off"
                  />
                  {latitude && (
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#4ade80', fontSize: 16, zIndex: 1 }}>&#10003;</span>
                  )}
                </div>

                {latitude && longitude && (
                  <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4, fontWeight: 600 }}>
                    Position detectee &#10003;
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Instagram (optionnel)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: 14 }}>@</span>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="votre_compte_insta" style={{ ...inputStyle, paddingLeft: 32 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError('') }}
                  style={{
                    flex: 1, padding: '14px 0', background: 'transparent',
                    color: '#888', border: '1px solid #333', borderRadius: 4,
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2, padding: '14px 0',
                    background: loading ? '#555' : OR, color: '#fff',
                    border: 'none', borderRadius: 4, fontWeight: 800,
                    fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? "Creation en cours..." : "S'inscrire"}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' }}>
            Deja un compte ?{' '}
            <Link href="/pro/login" style={{ color: OR, fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function ProRegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: NOIR, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        Chargement...
      </div>
    }>
      <ProRegisterContent />
    </Suspense>
  )
}
