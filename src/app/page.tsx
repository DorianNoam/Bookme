'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { VILLES_ALGERIE } from '@/data/villes'

const CATEGORIES = ['Coiffure', 'Beaute des ongles', 'Massage et bien-etre', 'Barbier', 'Hammam & Spa', 'Chirurgie esthetique']

const NAV_LINKS = [
  { label: 'Coiffure', val: 'Coiffure' },
  { label: 'Ongles', val: 'Beaute des ongles' },
  { label: 'Bien-etre', val: 'Massage et bien-etre' },
  { label: 'Barbier', val: 'Barbier' },
  { label: 'Hammam', val: 'Hammam & Spa' },
  { label: 'Chirurgie', val: 'Chirurgie esthetique' },
]

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
  const [menuOpen, setMenuOpen] = useState(false)
  
  const current = SLIDES[slide]

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.logged) setIsLoggedIn(true) })
      .catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (loc) params.set('loc', loc)
    router.push('/search?' + params.toString())
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%', overflowX: 'hidden' }}>

      {/* ══════ HEADER ══════ */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>

          {/* Nav desktop */}
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="hide-mobile">
            {NAV_LINKS.map(c => (
              <Link key={c.val} href={'/search?q=' + c.val} style={{ color: '#444', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>{c.label}</Link>
            ))}
          </nav>

          {/* Actions desktop */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="hide-mobile">
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Mon espace</Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#444', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Connexion</Link>
                <Link href="/register" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Inscription</Link>
              </>
            )}
            <Link href="/pro" style={{ border: '1px solid ' + OR, color: OR, padding: '8px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Espace Pro</Link>
          </div>

          {/* Burger mobile */}
          <button className="hide-desktop" onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: NOIR }} />
            <span style={{ display: 'block', width: 24, height: 2, background: NOIR }} />
            <span style={{ display: 'block', width: 24, height: 2, background: NOIR }} />
          </button>
        </div>
      </header>

      {/* ══════ MENU MOBILE ══════ */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#fff', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>Bookme<span style={{ color: OR }}>.dz</span></span>
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}>{'✕'}</button>
          </div>
          {NAV_LINKS.map(c => (
            <Link key={c.val} href={'/search?q=' + c.val} onClick={() => setMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: NOIR, textDecoration: 'none', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>{c.label}</Link>
          ))}
          <div style={{ borderTop: '2px solid #eee', marginTop: 'auto', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ background: NOIR, color: '#fff', padding: '12px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none' }}>Mon espace</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{ border: `1px solid ${NOIR}`, color: NOIR, padding: '12px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none' }}>Connexion</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} style={{ background: NOIR, color: '#fff', padding: '12px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none' }}>Inscription</Link>
              </>
            )}
            <Link href="/pro" onClick={() => setMenuOpen(false)} style={{ border: `1px solid ${OR}`, color: OR, padding: '12px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none' }}>Espace Pro</Link>
          </div>
        </div>
      )}

      {/* ══════ HERO ══════ */}
      <section style={{ position: 'relative', minHeight: 520, background: NOIR, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.92) 45%, rgba(10,10,10,0.3) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '50px 16px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: 40, height: 2, background: OR, marginBottom: 16 }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Plateforme N°1 en Algerie
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 50px)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.1, maxWidth: 540, letterSpacing: -1 }}>
            Reservez votre beaute en ligne
          </h1>
          <p style={{ fontSize: 15, color: '#999', marginBottom: 30, maxWidth: 380, lineHeight: 1.6 }}>
            Les meilleurs salons, instituts et spas partout en Algerie.
          </p>
          
          {/* FORMULAIRE COMPACT CORRIGÉ POUR MOBILE */}
          <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 6, display: 'flex', flexDirection: 'column', maxWidth: 680, boxShadow: '0 8px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EAE0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Prestation</div>
              <select value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent', cursor: 'pointer' }}>
                <option value="">Coiffure, massage, ongles...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EAE0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Ville</div>
              <select value={loc} onChange={e => setLoc(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent', cursor: 'pointer' }}>
                <option value="">Toutes les villes (Algérie)</option>
                {VILLES_ALGERIE.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '14px', fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', width: '100%' }}>Rechercher</button>
          </form>
        </div>
      </section>

      {/* ══════ FILTRES ══════ */}
      <div style={{ background: BG, padding: '10px 0', borderBottom: '1px solid #EDE5D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center' }}>
          <button onClick={() => router.push('/search')} style={{ background: NOIR, color: '#fff', padding: '6px 14px', borderRadius: 2, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => router.push('/search?q=' + cat)} style={{ color: '#555', border: '1px solid #DDD5C8', padding: '6px 14px', borderRadius: 2, fontSize: 12, fontWeight: 500, background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* ══════ CAROUSEL ══════ */}
      <section style={{ padding: '60px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Selectionnes pour vous</div>
          <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: NOIR, marginBottom: 30, letterSpacing: -0.5 }}>Decouvrez nos Professionnels</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px', height: 320, borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', width: '100%' }}>
              <img src={current.img} alt={current.cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1 1 280px', width: '100%' }}>
              <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, borderBottom: '1px solid ' + OR, paddingBottom: 6 }}>{current.cat}</div>
              <h3 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: NOIR, margin: '0 0 16px', letterSpacing: -0.5 }}>{current.title}</h3>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>{current.desc}</p>
              <Link href={current.link} style={{ fontWeight: 700, color: NOIR, fontSize: 14, textDecoration: 'none', borderBottom: '1px solid ' + NOIR, paddingBottom: 2, display: 'inline-block' }}>Voir les etablissements →</Link>
              <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
                <button onClick={() => setSlide(s => s === 0 ? SLIDES.length - 1 : s - 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #DDD', background: '#fff', fontSize: 18, cursor: 'pointer', color: NOIR }}>‹</button>
                <button onClick={() => setSlide(s => s === SLIDES.length - 1 ? 0 : s + 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #DDD', background: '#fff', fontSize: 18, cursor: 'pointer', color: NOIR }}>›</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section style={{ background: BG, padding: '50px 0', borderTop: '1px solid #EDE5D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 30, textAlign: 'center' }}>
          {[
            { icon: '🕐', title: '24h/24, 7j/7', desc: 'Reservez a nimporte quel moment, ou que vous soyez en Algerie.' },
            { icon: '✅', title: 'Confirmation immediate', desc: 'Votre creneau est bloque instantanement, sans appel.' },
            { icon: '⭐', title: 'Avis verifies', desc: 'Seuls les clients ayant eu un RDV peuvent noter le salon.' },
          ].map(f => (
            <div key={f.title} style={{ maxWidth: 260, flex: '1 1 220px' }}>
              <div style={{ fontSize: 26, marginBottom: 16, background: '#F0EAE0', width: 60, height: 60, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: NOIR }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CTA PRO ══════ */}
      <section style={{ background: NOIR, color: '#fff', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 2, background: OR, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Professionnels</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', marginBottom: 16, fontWeight: 900, letterSpacing: -0.5 }}>Vous etes un professionnel ?</h2>
        <p style={{ fontSize: 15, color: '#888', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>Rejoignez Bookme Pro pour gerer votre agenda en ligne et developper votre clientele partout en Algerie.</p>
        <Link href="/pro" style={{ display: 'inline-block', background: OR, color: '#fff', padding: '14px 28px', fontWeight: 700, borderRadius: 4, marginTop: 24, fontSize: 14, textDecoration: 'none', letterSpacing: 0.5 }}>Decouvrir notre offre Pro</Link>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: NOIR, padding: '24px 16px', borderTop: '1px solid #1a1a1a', textAlign: 'center', color: '#444', fontSize: 13 }}>
        Bookme.dz — La beaute a portee de clic en Algerie
      </footer>
    </div>
  )
}
