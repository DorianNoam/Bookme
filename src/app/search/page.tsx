'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

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
}

const CATEGORIES = ['Coiffure', 'Beaute des ongles', 'Massage et bien-etre', 'Barbier', 'Hammam & Spa', 'Chirurgie esthetique']

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [loc, setLoc] = useState(searchParams.get('loc') || '')

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

  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #eee', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: '#000', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Bookme<span style={{ color: '#4DA6FF' }}>.dz</span>
          </Link>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 10 }}>
            <select value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, padding: '10px 15px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif' }}>
              <option value="">Toutes les prestations</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Ville (Alger, Oran...)" style={{ flex: 1, padding: '10px 15px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
            <button type="submit" style={{ background: '#111', color: 'white', border: 'none', padding: '10px 25px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Rechercher</button>
          </form>
          <div style={{ display: 'flex', gap: 10, whiteSpace: 'nowrap' }}>
            <Link href="/login" style={{ color: '#555', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Connexion</Link>
            <Link href="/register" style={{ background: '#111', color: 'white', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Inscription</Link>
          </div>
        </div>
      </header>

      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 10, overflowX: 'auto' }}>
          <button onClick={() => router.push('/search')} style={{ padding: '7px 18px', borderRadius: 20, border: '1px solid #ddd', background: !query ? '#111' : 'white', color: !query ? 'white' : '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => router.push('/search?q=' + cat)} style={{ padding: '7px 18px', borderRadius: 20, border: '1px solid #ddd', background: query === cat ? '#111' : 'white', color: query === cat ? 'white' : '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 5 }}>{query ? query : 'Tous les etablissements'}{loc ? ' a ' + loc : ''}</h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 25 }}>{loading ? 'Chargement...' : salons.length + ' etablissement(s) trouve(s)'}</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Chargement...</div>
        ) : salons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, border: '1px dashed #ccc', borderRadius: 10 }}>
            <div style={{ fontSize: 40, marginBottom: 15 }}>🔍</div>
            <p style={{ color: '#888', marginBottom: 20 }}>Aucun etablissement ne correspond a votre recherche.</p>
            <Link href="/search" style={{ color: '#111', fontWeight: 700 }}>Voir tous les etablissements</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {salons.map(salon => (
              <Link key={salon.id} href={'/salon/' + salon.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #eee', display: 'flex', overflow: 'hidden', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                  <div style={{ width: 220, minHeight: 160, flexShrink: 0, overflow: 'hidden' }}>
                    <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, padding: '20px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{salon.nom}</span>
                        {salon.ville && <span style={{ color: '#888', fontSize: 13 }}>📍 {salon.ville}</span>}
                        {salon.type_salon && <span style={{ background: '#f0f7ff', color: '#4DA6FF', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>{salon.type_salon}</span>}
                      </div>
                      <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>{salon.adresse}</div>
                      {salon.description && <p style={{ color: '#555', fontSize: 13, lineHeight: 1.5 }}>{salon.description.length > 120 ? salon.description.substring(0, 120) + '...' : salon.description}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        {salon.moy_note ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {salon.moy_note} <span style={{ color: '#888', fontWeight: 400, fontSize: 12 }}>({salon.nb_avis} avis)</span></span> : <span style={{ color: '#888', fontSize: 12 }}>Nouveau</span>}
                        {salon.telephone && <span style={{ color: '#888', fontSize: 12 }}>📞 {salon.telephone}</span>}
                      </div>
                      <span style={{ background: '#111', color: 'white', padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>Reserver →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>}>
      <SearchContent />
    </Suspense>
  )
}
