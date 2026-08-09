'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { VILLES_ALGERIE } from '@/data/villes'

const MapWithNoSSR = dynamic(() => import('@/components/SalonMap'), { 
  ssr: false,
  loading: () => <div style={{ height: 350, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Chargement de la carte interactive...</div>
})

type Salon = { id: number; nom: string; adresse: string; image: string; type_salon: string; telephone: string; description: string; ville: string; moy_note: string | null; nb_avis: number }

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
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.logged) setIsLoggedIn(true) }).catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const l = searchParams.get('loc') || ''
    setQuery(q); setLoc(l); fetchSalons(q, l)
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
    } catch { setSalons([]) }
    finally { setLoading(false) }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (loc) params.set('loc', loc)
    router.push('/search?' + params.toString())
    setShowMobileSearch(false)
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '12px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 900, color: NOIR, whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>

          {/* Search bar desktop avec select des 58 wilayas */}
          <form onSubmit={handleSearch} className="hide-mobile" style={{ flex: 1, display: 'flex', gap: 8 }}>
            <select value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, padding: '9px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 13, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR }}>
              <option value="">Toutes les prestations</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select value={loc} onChange={e => setLoc(e.target.value)} style={{ flex: 1, padding: '9px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 13, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR }}>
              <option value="">Toutes les villes (Algérie)</option>
              {VILLES_ALGERIE.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Rechercher</button>
          </form>

          {/* Bouton recherche mobile */}
          <button className="hide-desktop" onClick={() => setShowMobileSearch(!showMobileSearch)} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${OR}`, color: OR, padding: '8px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {'🔍 Rechercher'}
          </button>

          {/* Auth desktop */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 10, whiteSpace: 'nowrap', alignItems: 'center' }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Mon espace</Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#555', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Connexion</Link>
                <Link href="/register" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Inscription</Link>
              </>
            )}
          </div>
        </div>

        {/* Search mobile expandable */}
        {showMobileSearch && (
          <div className="hide-desktop" style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <select value={query} onChange={e => setQuery(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR }}>
                <option value="">Toutes les prestations</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={loc} onChange={e => setLoc(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR }}>
                <option value="">Toutes les villes (Algérie)</option>
                {VILLES_ALGERIE.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '12px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Rechercher</button>
            </form>
          </div>
        )}
      </header>

      {/* FILTRES PAR CATÉGORIE */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '8px 0' }}>
        <div className="filters-bar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px' }}>
          <button onClick={() => router.push('/search')} style={{ background: !query ? NOIR : 'transparent', color: !query ? '#fff' : '#555', padding: '6px 14px', borderRadius: 2, border: !query ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => router.push('/search?q=' + cat)} style={{ background: query === cat ? NOIR : 'transparent', color: query === cat ? '#fff' : '#555', padding: '6px 14px', borderRadius: 2, border: query === cat ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: query === cat ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat}</button>
          ))}
        </div>
      </div>

    {/* CARTE INTERACTIVE EN HAUT */}
<div style={{ width: '100%', height: 360, borderBottom: `2px solid ${OR}` }}>
  <MapWithNoSSR salons={salons} hoveredSalonId={hoveredSalonId} />
</div>

      {/* RESULTATS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Résultats</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: NOIR }}>{query ? query : 'Tous les etablissements'}{loc ? ' à ' + loc : ''}</h1>
        <p style={{ color: '#999', fontSize: 13, marginBottom: 24 }}>{loading ? 'Chargement...' : salons.length + ' etablissement(s) trouvé(s)'}</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Chargement...</div>
        ) : salons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', border: '1px dashed #DDD5C8', borderRadius: 4 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{'🔍'}</div>
            <p style={{ color: '#888', marginBottom: 16, fontSize: 14 }}>Aucun établissement ne correspond.</p>
            <Link href="/search" style={{ color: OR, fontWeight: 700, borderBottom: '1px solid ' + OR, paddingBottom: 2, fontSize: 14, textDecoration: 'none' }}>Voir tous les établissements</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {salons.map(salon => (
              <Link key={salon.id} href={'/salon/' + salon.id} style={{ color: 'inherit', textDecoration: 'none' }}>
                <div className="salon-result-card" style={{ background: '#fff', borderRadius: 6, border: '1px solid #EDE5D8', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>

                  <div className="salon-result-image" style={{ overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                    <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>

                  <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: NOIR }}>{salon.nom}</span>
                        {salon.type_salon && <span style={{ background: BG, color: OR, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase' }}>{salon.type_salon}</span>}
                      </div>
                      <div style={{ color: '#bbb', fontSize: 12, marginBottom: 6 }}>{'📍'} {salon.ville} — {salon.adresse}</div>
                      {salon.description && <p className="hide-mobile" style={{ color: '#666', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{salon.description.length > 120 ? salon.description.substring(0, 120) + '...' : salon.description}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {salon.moy_note ? <span style={{ color: OR, fontWeight: 700, fontSize: 13 }}>{'★'} {salon.moy_note} <span style={{ color: '#bbb', fontWeight: 400, fontSize: 11 }}>({salon.nb_avis})</span></span> : <span style={{ color: '#bbb', fontSize: 11 }}>Nouveau</span>}
                      </div>
                      <span style={{ background: NOIR, color: '#fff', padding: '7px 18px', borderRadius: 3, fontSize: 12, fontWeight: 700 }}>Réserver {'→'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: NOIR, padding: '24px 16px', textAlign: 'center', color: '#444', fontSize: 12, marginTop: 30 }}>
        Bookme.dz — La beauté à portée de clic en Algérie
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .salon-result-card { display: flex; }
        .salon-result-image { width: 240px; min-height: 180px; }
        @media (max-width: 768px) {
          .salon-result-card { flex-direction: column; }
          .salon-result-image { width: 100%; height: 180px; }
        }
      `}} />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Chargement...</div>}>
      <SearchContent />
    </Suspense>
  )
}
