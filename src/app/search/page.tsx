'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SearchMap = dynamic(() => import('@/components/SearchMap'), { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', background: '#e5e3df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>Chargement de la carte...</div> })

type Salon = {
  id: number
  nom: string
  adresse: string
  image: string
  type_salon: string
  telephone: string
  description: string
  ville: string
  moy_note: string | null
  nb_avis: number
  latitude?: number
  longitude?: number
}

const CATEGORIES = ['Coiffure', 'Beaute des ongles', 'Massage et bien-etre', 'Barbier', 'Hammam & Spa', 'Chirurgie esthetique']
const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [loc, setLoc] = useState(searchParams.get('loc') || '')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hoveredSalonId, setHoveredSalonId] = useState<number | null>(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.logged) setIsLoggedIn(true) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const l = searchParams.get('loc') || ''
    setQuery(q)
    setLoc(l)
    fetchSalons(q, l)
  }, [searchParams])

  async function fetchSalons(q: string, l: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (l) params.set('loc', l)
      const res = await fetch('/api/salons?' + params.toString())
      const data = await res.json()
      setSalons(data.salons || [])
    } catch {
      setSalons([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (loc) params.set('loc', loc)
    router.push('/search?' + params.toString())
  }

  const hasMappable = salons.some(s => s.latitude && s.longitude)

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '10px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 900, color: NOIR, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8, minWidth: 0 }}>
            <select value={query} onChange={e => setQuery(e.target.value)} style={{ flex: '1 1 140px', padding: '8px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR, minWidth: 0 }}>
              <option value="">Toutes les prestations</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Ville..." style={{ flex: '1 1 120px', padding: '8px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 16, fontFamily: 'Inter, sans-serif', color: NOIR, minWidth: 0, WebkitAppearance: 'none' }} />
            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12, letterSpacing: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}>Rechercher</button>
          </form>
          <div className="hide-mobile" style={{ display: 'flex', gap: 10, whiteSpace: 'nowrap', alignItems: 'center' }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Mon espace</Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#555', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Connexion</Link>
                <Link href="/register" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Inscription</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* FILTRES */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '8px 0' }}>
        <div style={{ padding: '0 16px', display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <button onClick={() => router.push('/search')} style={{ background: !query ? NOIR : 'transparent', color: !query ? '#fff' : '#555', padding: '6px 14px', borderRadius: 3, border: !query ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => router.push('/search?q=' + cat)} style={{ background: query === cat ? NOIR : 'transparent', color: query === cat ? '#fff' : '#555', padding: '6px 14px', borderRadius: 3, border: query === cat ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: query === cat ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat}</button>
          ))}

          {/* Toggle carte mobile */}
          {hasMappable && (
            <button
              className="hide-desktop"
              onClick={() => setShowMap(!showMap)}
              style={{
                background: showMap ? OR : 'transparent',
                color: showMap ? '#fff' : OR,
                padding: '6px 14px',
                borderRadius: 3,
                border: `1px solid ${OR}`,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
                marginLeft: 'auto'
              }}
            >
              {showMap ? 'Liste' : 'Carte'}
            </button>
          )}
        </div>
      </div>

      {/* CONTENU PRINCIPAL : SPLIT LAYOUT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* COLONNE GAUCHE : LISTE DES SALONS */}
        <div
          className={showMap ? 'hide-mobile' : ''}
          style={{
            flex: '0 0 60%',
            maxWidth: 720,
            overflowY: 'auto',
            padding: '20px 16px',
            height: 'calc(100vh - 100px)',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: NOIR, marginBottom: 4 }}>
              {query ? query : 'Tous les etablissements'}{loc ? ' a ' + loc : ''}
            </h1>
            <p style={{ color: '#999', fontSize: 13 }}>
              {loading ? 'Chargement...' : salons.length + ' etablissement(s) trouve(s)'}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Chargement...</div>
          ) : salons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', border: '1px dashed #DDD5C8', borderRadius: 4 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{'🔍'}</div>
              <p style={{ color: '#888', marginBottom: 16, fontSize: 14 }}>Aucun etablissement ne correspond a votre recherche.</p>
              <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid ' + OR, paddingBottom: 2, fontSize: 14 }}>Voir tous les etablissements</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {salons.map(salon => (
                <div
                  key={salon.id}
                  onMouseEnter={() => setHoveredSalonId(salon.id)}
                  onMouseLeave={() => setHoveredSalonId(null)}
                  style={{
                    background: '#fff',
                    borderRadius: 6,
                    border: hoveredSalonId === salon.id ? `2px solid ${OR}` : '1px solid #EDE5D8',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: hoveredSalonId === salon.id ? '0 4px 20px rgba(184,146,42,0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {/* Image */}
                    <div style={{ width: 'clamp(100px, 25vw, 200px)', minHeight: 'clamp(100px, 20vw, 160px)', flexShrink: 0, overflow: 'hidden', background: '#1a1a1a' }}>
                      <img
                        src={salon.image}
                        alt={salon.nom}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>

                    {/* Infos */}
                    <div style={{ flex: 1, padding: 'clamp(12px, 2vw, 20px)', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <Link
                            href={'/salon/' + salon.id}
                            style={{
                              fontSize: 'clamp(15px, 2.5vw, 18px)',
                              fontWeight: 800,
                              color: NOIR,
                              textDecoration: 'none'
                            }}
                            onMouseEnter={() => setHoveredSalonId(salon.id)}
                          >
                            {salon.nom}
                          </Link>
                          {salon.type_salon && (
                            <span style={{ background: BG, color: OR, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 2, letterSpacing: 0.5, textTransform: 'uppercase' }}>{salon.type_salon}</span>
                          )}
                        </div>
                        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {salon.adresse}{salon.ville ? ' - ' + salon.ville : ''}
                        </div>

                        {/* Note */}
                        {salon.moy_note && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <span style={{ background: NOIR, color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 3 }}>{salon.moy_note}</span>
                            <span style={{ color: '#999', fontSize: 12 }}>({salon.nb_avis} avis)</span>
                          </div>
                        )}

                        {salon.description && (
                          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {salon.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 8 }}>
                        <Link href={'/salon/' + salon.id} style={{ color: OR, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                          Plus d'informations
                        </Link>
                        <Link href={'/booking?salon=' + salon.id} style={{
                          background: NOIR,
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap'
                        }}>
                          Prendre RDV
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : CARTE */}
        {hasMappable && (
          <div
            className={!showMap ? 'hide-mobile' : ''}
            style={{
              flex: 1,
              position: 'sticky',
              top: 100,
              height: 'calc(100vh - 100px)',
              borderLeft: '1px solid #EDE5D8',
              minWidth: 0
            }}
          >
            <SearchMap
              salons={salons}
              hoveredSalonId={hoveredSalonId}
              onMarkerClick={(id) => router.push('/salon/' + id)}
            />
          </div>
        )}

        {/* Fallback si pas de coords */}
        {!hasMappable && !loading && salons.length > 0 && (
          <div className="hide-mobile" style={{
            flex: 1,
            position: 'sticky',
            top: 100,
            height: 'calc(100vh - 100px)',
            borderLeft: '1px solid #EDE5D8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e5e3df',
            color: '#999',
            fontSize: 14,
            textAlign: 'center',
            padding: 20
          }}>
            <div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{'🗺️'}</div>
              Carte indisponible.<br />Les salons n'ont pas encore de coordonnees GPS.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: BG, fontFamily: 'Inter, sans-serif', color: NOIR }}>
        Chargement...
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
