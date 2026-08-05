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
  
  // Nouvel état pour gérer la connexion
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Vérification de la connexion au chargement
  useEffect(() => {
    fetch('/api/user/dashboard')
      .then(res => {
        if (res.ok) setIsLoggedIn(true)
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  // Gestion de la recherche
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
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 10 }}>
            <select value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, padding: '10px 15px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR }}>
              <option value="">Toutes les prestations</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Ville (Alger, Oran...)" style={{ flex: 1, padding: '10px 15px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, fontFamily: 'Inter, sans-serif', color: NOIR }} />
            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '10px 25px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 13, letterSpacing: 0.5 }}>Rechercher</button>
          </form>
          <div style={{ display: 'flex', gap: 12, whiteSpace: 'nowrap', alignItems: 'center' }}>
            {/* AFFICHAGE CONDITIONNEL DU BOUTON */}
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: NOIR, color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#555', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Connexion</Link>
                <Link href="/register" style={{ background: NOIR, color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Inscription</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* FILTRES */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '10px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center' }}>
          <button onClick={() => router.push('/search')} style={{ background: !query ? NOIR : 'transparent', color: !query ? '#fff' : '#555', padding: '6px 16px', borderRadius: 2, border: !query ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => router.push('/search?q=' + cat)} style={{ background: query === cat ? NOIR : 'transparent', color: query === cat ? '#fff' : '#555', padding: '6px 16px', borderRadius: 2, border: query === cat ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: query === cat ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* RESULTATS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Resultats</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 5, color: NOIR }}>{query ? query : 'Tous les etablissements'}{loc ? ' a ' + loc : ''}</h1>
        <p style={{ color: '#999', fontSize: 14, marginBottom: 28 }}>{loading ? 'Chargement...' : salons.length + ' etablissement(s) trouve(s)'}</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Chargement...</div>
        ) : salons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', border: '1px dashed #DDD5C8', borderRadius: 4 }}>
            <div style={{ fontSize: 40, marginBottom: 15 }}>🔍</div>
            <p style={{ color: '#888', marginBottom: 20 }}>Aucun etablissement ne correspond a votre recherche.</p>
            <Link href="/search" style={{ color: OR, fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid ' + OR, paddingBottom: 2 }}>Voir tous les etablissements</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {salons.map(salon => (
              <Link key={salon.id} href={'/salon/' + salon.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#fff', borderRadius: 4, border: '1px solid #EDE5D8', display: 'flex', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                  <div style={{ width: 240, minHeight: 180, flexShrink: 0, overflow: 'hidden', background: '#1a1a1a' }}>
                    <img
                      src={salon.image}
                      alt={salon.nom}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, padding: '22px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: NOIR }}>{salon.nom}</span>
                        {salon.ville && <span style={{ color: '#999', fontSize: 13 }}>📍 {salon.ville}</span>}
                        {salon.type_salon && <span style={{ background: BG, color: OR, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 2, letterSpacing: 0.5, textTransform: 'uppercase' }}>{salon.type_salon}</span>}
                      </div>
                      <div style={{ color: '#bbb', fontSize: 12, marginBottom: 10 }}>{salon.adresse}</div>
                      {salon.description && <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>{salon.description.length > 140 ? salon.description.substring(0, 140) + '...' : salon.description}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {salon.moy_note ? <span style={{ color: OR, fontWeight: 700, fontSize: 13 }}>★ {salon.moy_note} <span style={{ color: '#bbb', fontWeight: 400, fontSize: 12 }}>({salon.nb_avis} avis)</span></span> : <span style={{ color: '#bbb', fontSize: 12 }}>Nouveau</span>}
                        {salon.telephone && <span style={{ color: '#bbb', fontSize: 12 }}>📞 {salon.telephone}</span>}
                      </div>
                      <span style={{ background: NOIR, color: '#fff', padding: '8px 22px', borderRadius: 3, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>Reserver →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: NOIR, padding: '28px 0', textAlign: 'center', color: '#444', fontSize: 13, marginTop: 40 }}>
        Bookme.dz — La beaute a portee de clic en Algerie
      </footer>
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
