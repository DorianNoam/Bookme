'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['Coiffure', 'Beaute des ongles', 'Massage et bien-etre', 'Barbier', 'Hammam & Spa', 'Chirurgie esthetique']

const SLIDES = [
  { cat: 'Coiffure', title: "L'art de la coupe", desc: "Envie d'un changement ou d'un simple rafraichissement ? Nos coiffeurs maitrisent toutes les techniques : balayage, ombre hair, lissage bresilien...", img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', link: '/search?q=Coiffure' },
  { cat: 'Beaute des ongles', title: 'Des mains parfaites', desc: "Pose de vernis, gel, nail art ou beaute des pieds. Trouvez la specialiste ideale pour des ongles impeccables.", img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d52?w=800', link: '/search?q=Beaute des ongles' },
  { cat: 'Hammam & Spa', title: 'Detente absolue', desc: "Gommage, massage et soins traditionnels. Offrez-vous une vraie parenthese de bien-etre dans les meilleurs hammams.", img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', link: '/search?q=Hammam & Spa' },
  { cat: 'Chirurgie esthetique', title: 'Des professionnels de confiance', desc: "Consultations et interventions realisees par des medecins qualifies. Trouvez la clinique qu'il vous faut.", img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800', link: '/search?q=Chirurgie esthetique' },
]

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function HomePage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [query, setQuery] = useState('')
  const [loc, setLoc] = useState('')
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  const current = SLIDES[slide]

  useEffect(() => {
    fetch('/api/user/dashboard')
      .then(res => {
        if (res.ok) setIsLoggedIn(true)
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (loc) params.set('loc', loc)
    router.push('/search?' + params.toString())
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%', overflowX: 'hidden', background: BG }}>

      {/* HEADER ÉPURÉ ET LUXUEUX */}
      <header style={{ background: NOIR, borderBottom: `1px solid rgba(184, 146, 42, 0.2)`, padding: '18px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <Link href="/" style={{ fontSize: 24, fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: OR, color: NOIR, padding: '9px 18px', borderRadius: 4, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#ccc', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 12px' }}>Connexion</Link>
                <Link href="/register" style={{ background: '#fff', color: NOIR, padding: '9px 18px', borderRadius: 4, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>Inscription</Link>
              </>
            )}
            <Link href="/pro" style={{ border: `1px solid ${OR}`, color: OR, padding: '8px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none', background: 'transparent' }}>Espace Pro</Link>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', minHeight: 560, background: NOIR, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600"
          alt="Salon background"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 50%, rgba(10,10,10,0.4) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 20px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: 40, height: 2, background: OR, marginBottom: 20 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            Plateforme N°1 en Algérie
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.1, maxWidth: 580, letterSpacing: '-1px' }}>
            Réservez votre beauté en ligne
          </h1>
          <p style={{ fontSize: 16, color: '#aaa', marginBottom: 40, maxWidth: 420, lineHeight: 1.6 }}>
            Les meilleurs salons, instituts et spas partout en Algérie en quelques clics.
          </p>

          {/* BARRE DE RECHERCHE DESIGN */}
          <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 6, display: 'flex', flexDirection: 'column', maxWidth: 700, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', overflow: 'hidden', border: `1px solid rgba(184, 146, 42, 0.3)` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
              
              <div style={{ flex: '1 1 220px', padding: '16px 20px', borderBottom: '1px solid #F0EAE0', borderRight: '1px solid #F0EAE0' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: OR, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Prestation</div>
                <select value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent', cursor: 'pointer' }}>
                  <option value="">Coiffure, massage, ongles...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ flex: '1 1 220px', padding: '16px 20px', borderBottom: '1px solid #F0EAE0' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: OR, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Ville</div>
                <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Alger, Oran, Constantine..." style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent' }} />
              </div>

            </div>
            <button type="submit" style={{ background: OR, color: NOIR, border: 'none', padding: '18px 28px', fontWeight: 900, fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', width: '100%', transition: 'background 0.2s' }}>
              Rechercher un établissement
            </button>
          </form>

        </div>
      </section>

      {/* FILTRES RAPIDES PAR CATÉGORIE */}
      <div style={{ background: '#fff', padding: '16px 0', borderBottom: '1px solid #EDE5D8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 10, overflowX: 'auto', alignItems: 'center' }}>
          <button onClick={() => router.push('/search')} style={{ background: NOIR, color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => router.push('/search?q=' + cat)} style={{ color: '#444', border: '1px solid #DDD5C8', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 600, background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* CAROUSEL / SELECTION */}
      <section style={{ padding: '80px 0', background: BG }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: OR, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Sélectionné pour vous</div>
          <div style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: NOIR, marginBottom: 40, letterSpacing: '-0.5px' }}>Découvrez nos Univers</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 50, flexWrap: 'wrap', background: '#fff', padding: 40, borderRadius: 8, border: '1px solid #EDE5D8', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ flex: '1 1 320px', height: 380, borderRadius: 6, overflow: 'hidden', width: '100%' }}>
              <img src={current.img} alt={current.cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ flex: '1 1 320px', width: '100%' }}>
              <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, borderBottom: `2px solid ${OR}`, paddingBottom: 6 }}>{current.cat}</div>
              <h3 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color: NOIR, margin: '0 0 16px', letterSpacing: '-0.5px' }}>{current.title}</h3>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 30 }}>{current.desc}</p>
              
              <Link href={current.link} style={{ fontWeight: 800, color: NOIR, fontSize: 14, textDecoration: 'none', borderBottom: `2px solid ${NOIR}`, paddingBottom: 2, display: 'inline-block' }}>
                Voir les établissements →
              </Link>

              <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                <button onClick={() => setSlide(s => s === 0 ? SLIDES.length - 1 : s - 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${NOIR}`, background: '#fff', fontSize: 18, cursor: 'pointer', color: NOIR, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={() => setSlide(s => s === SLIDES.length - 1 ? 0 : s + 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${NOIR}`, background: '#fff', fontSize: 18, cursor: 'pointer', color: NOIR, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES / AVANTAGES */}
      <section style={{ background: '#fff', padding: '80px 0', borderTop: '1px solid #EDE5D8', borderBottom: '1px solid #EDE5D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40, textAlign: 'center' }}>
          {[
            { icon: '🕐', title: '24h/24, 7j/7', desc: 'Réservez à n’importe quel moment, où que vous soyez en Algérie.' },
            { icon: '✅', title: 'Confirmation immédiate', desc: 'Votre créneau est bloqué instantanément, sans appel téléphonique.' },
            { icon: '⭐', title: 'Avis vérifiés', desc: 'Seuls les clients ayant eu un rendez-vous effectif peuvent noter.' },
          ].map(f => (
            <div key={f.title} style={{ maxWidth: 300, flex: '1 1 240px', padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 16, background: BG, width: 64, height: 64, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #E0D8CE' }}>{f.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 10, color: NOIR }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA PRO */}
      <section style={{ background: NOIR, color: '#fff', padding: '90px 20px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 2, background: OR, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Espace Partenaire</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', marginBottom: 16, fontWeight: 900, letterSpacing: '-0.5px' }}>Vous êtes un professionnel de la beauté ?</h2>
        <p style={{ fontSize: 16, color: '#aaa', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>Rejoignez Bookme Pro pour digitaliser votre agenda, éliminer les no-shows et développer votre clientèle à travers toute l'Algérie.</p>
        <Link href="/pro" style={{ display: 'inline-block', background: OR, color: NOIR, padding: '16px 36px', fontWeight: 900, borderRadius: 4, marginTop: 32, fontSize: 14, textDecoration: 'none', letterSpacing: '0.5px' }}>
          Découvrir notre offre Pro →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#050505', padding: '30px 0', borderTop: '1px solid #1a1a1a', textAlign: 'center', color: '#666', fontSize: 13 }}>
        Bookme.dz — La beauté à portée de clic en Algérie
      </footer>
    </div>
  )
}
