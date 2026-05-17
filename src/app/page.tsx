'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  const current = SLIDES[slide]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (loc) params.set('loc', loc)
    router.push('/search?' + params.toString())
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 900, color: NOIR, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {NAV_LINKS.map(c => (
              <Link key={c.val} href={'/search?q=' + c.val} style={{ color: '#444', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>{c.label}</Link>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ color: '#444', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Connexion</Link>
            <Link href="/register" style={{ background: NOIR, color: '#fff', padding: '9px 20px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Inscription</Link>
            <Link href="/pro" style={{ border: '1px solid ' + OR, color: OR, padding: '9px 20px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Espace Pro</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 520, background: NOIR, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.92) 45%, rgba(10,10,10,0.3) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
          <div style={{ width: 40, height: 2, background: OR, marginBottom: 20 }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            Plateforme N°1 en Algerie
          </div>
          <h1 style={{ fontSize: 50, fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.1, maxWidth: 540, letterSpacing: -1 }}>
            Reservez votre beaute en ligne
          </h1>
          <p style={{ fontSize: 16, color: '#999', marginBottom: 38, maxWidth: 380, lineHeight: 1.7 }}>
            Les meilleurs salons, instituts et spas partout en Algerie.
          </p>
          <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 4, display: 'flex', maxWidth: 680, boxShadow: '0 8px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '14px 20px', borderRight: '1px solid #F0EAE0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Prestation</div>
              <select value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent' }}>
                <option value="">Coiffure, massage, ongles...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, padding: '14px 20px', borderRight: '1px solid #F0EAE0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Ville</div>
              <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Alger, Oran, Constantine..." style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent' }} />
            </div>
            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '0 28px', fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>Rechercher</button>
          </form>
        </div>
      </section>

      {/* FILTRES */}
      <div style={{ background: BG, padding: '10px 0', borderBottom: '1px solid #EDE5D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center' }}>
          <button onClick={() => router.push('/search')} style={{ background: NOIR, color: '#fff', padding: '5px 16px', borderRadius: 2, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => router.push('/search?q=' + cat)} style={{ color: '#555', border: '1px solid #DDD5C8', padding: '5px 16px', borderRadius: 2, fontSize: 12, fontWeight: 500, background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* CAROUSEL */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Selectionnes pour vous</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: NOIR, marginBottom: 44, letterSpacing: -0.5 }}>Decouvrez nos Professionnels</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 60, minHeight: 400 }}>
            <div style={{ flex: 1, height: 400, borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
              <img src={current.img} alt={current.cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, borderBottom: '1px solid ' + OR, paddingBottom: 6 }}>{current.cat}</div>
              <h3 style={{ fontSize: 30, fontWeight: 800, color: NOIR, margin: '0 0 16px', letterSpacing: -0.5 }}>{current.title}</h3>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 32 }}>{current.desc}</p>
              <Link href={current.link} style={{ fontWeight: 700, color: NOIR, fontSize: 14, textDecoration: 'none', borderBottom: '1px solid ' + NOIR, paddingBottom: 2 }}>Voir les etablissements →</Link>
              <div style={{ display: 'flex', gap: 10, marginTop: 44 }}>
                <button onClick={() => setSlide(s => s === 0 ? SLIDES.length - 1 : s - 1)} style={{ width: 46, height: 46, borderRadius: '50%', border: '1px solid #DDD', background: '#fff', fontSize: 20, cursor: 'pointer', color: NOIR }}>‹</button>
                <button onClick={() => setSlide(s => s === SLIDES.length - 1 ? 0 : s + 1)} style={{ width: 46, height: 46, borderRadius: '50%', border: '1px solid #DDD', background: '#fff', fontSize: 20, cursor: 'pointer', color: NOIR }}>›</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: BG, padding: '70px 0', borderTop: '1px solid #EDE5D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40, textAlign: 'center' }}>
          {[
            { icon: '🕐', title: '24h/24, 7j/7', desc: 'Reservez a nimporte quel moment, ou que vous soyez en Algerie.' },
            { icon: '✅', title: 'Confirmation immediate', desc: 'Votre creneau est bloque instantanement, sans appel.' },
            { icon: '⭐', title: 'Avis verifies', desc: 'Seuls les clients ayant eu un RDV peuvent noter le salon.' },
          ].map(f => (
            <div key={f.title} style={{ maxWidth: 260 }}>
              <div style={{ fontSize: 26, marginBottom: 16, background: '#F0EAE0', width: 60, height: 60, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: NOIR }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA PRO */}
      <section style={{ background: NOIR, color: '#fff', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 2, background: OR, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Professionnels</div>
        <h2 style={{ fontSize: 34, marginBottom: 16, fontWeight: 900, letterSpacing: -0.5 }}>Vous etes un professionnel ?</h2>
        <p style={{ fontSize: 16, color: '#888', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>Rejoignez Bookme Pro pour gerer votre agenda en ligne et developper votre clientele partout en Algerie.</p>
        <Link href="/pro" style={{ display: 'inline-block', background: OR, color: '#fff', padding: '14px 32px', fontWeight: 700, borderRadius: 4, marginTop: 32, fontSize: 14, textDecoration: 'none', letterSpacing: 0.5 }}>Decouvrir notre offre Pro</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NOIR, padding: '28px 0', borderTop: '1px solid #1a1a1a', textAlign: 'center', color: '#444', fontSize: 13 }}>
        Bookme.dz — La beaute a portee de clic en Algerie
      </footer>
    </div>
  )
}
