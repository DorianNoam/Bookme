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

const V = '#6B21A8'
const VD = '#1A0533'
const VL = '#C084FC'
const BG = '#F9F7FD'

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
      <header style={{ background: '#fff', borderBottom: '1px solid #EDE8F5', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 900, color: VD, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Bookme<span style={{ color: V }}>.dz</span>
          </Link>
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {NAV_LINKS.map(c => (
              <Link key={c.val} href={'/search?q=' + c.val} style={{ color: '#4B3B6B', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{c.label}</Link>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ color: '#4B3B6B', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Connexion</Link>
            <Link href="/register" style={{ background: V, color: '#fff', padding: '9px 18px', borderRadius: 6, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Inscription</Link>
            <Link href="/pro" style={{ border: '1.5px solid ' + V, color: V, padding: '9px 18px', borderRadius: 6, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Espace Pro</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 520, background: VD, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(192,132,252,0.2)', border: '1px solid ' + VL, color: VL, fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: '5px 14px', borderRadius: 20, marginBottom: 20, textTransform: 'uppercase' }}>
            Plateforme N°1 en Algerie
          </div>
          <h1 style={{ fontSize: 50, fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.1, maxWidth: 560 }}>
            Reservez votre beaute en ligne
          </h1>
          <p style={{ fontSize: 17, color: VL, marginBottom: 38, maxWidth: 440, lineHeight: 1.6 }}>
            Les meilleurs salons, instituts et spas partout en Algerie.
          </p>
          <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 8, display: 'flex', maxWidth: 700, boxShadow: '0 8px 40px rgba(107,33,168,0.35)', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '14px 22px', borderRight: '1px solid #EDE8F5' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: V, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Prestation</div>
              <select value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: VD, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent' }}>
                <option value="">Coiffure, massage, ongles...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, padding: '14px 22px', borderRight: '1px solid #EDE8F5' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: V, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Ville</div>
              <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Alger, Oran, Constantine..." style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: VD, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent' }} />
            </div>
            <button type="submit" style={{ background: V, color: '#fff', border: 'none', padding: '0 32px', fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: 0.5 }}>RECHERCHER</button>
          </form>
        </div>
      </section>

      {/* CAROUSEL */}
      <section style={{ padding: '80px 0', background: BG }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: VD, marginBottom: 40 }}>Decouvrez nos Professionnels</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 50, minHeight: 420 }}>
            <div style={{ flex: 1, height: 420, borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 40px rgba(107,33,168,0.15)' }}>
              <img src={current.img} alt={current.cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, paddingLeft: 40 }}>
              <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: V, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, borderBottom: '2px solid ' + V, paddingBottom: 5 }}>{current.cat}</span>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: VD, margin: '10px 0 15px' }}>{current.title}</h3>
              <p style={{ fontSize: 15, color: '#4B3B6B', lineHeight: 1.7, marginBottom: 30 }}>{current.desc}</p>
              <Link href={current.link} style={{ fontWeight: 700, color: V, fontSize: 15, textDecoration: 'none' }}>Voir les etablissements →</Link>
              <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                <button onClick={() => setSlide(s => s === 0 ? SLIDES.length - 1 : s - 1)} style={{ width: 48, height: 48, borderRadius: '50%', border: '1.5px solid #D8CFF0', background: '#fff', fontSize: 20, cursor: 'pointer', color: V }}>‹</button>
                <button onClick={() => setSlide(s => s === SLIDES.length - 1 ? 0 : s + 1)} style={{ width: 48, height: 48, borderRadius: '50%', border: '1.5px solid #D8CFF0', background: '#fff', fontSize: 20, cursor: 'pointer', color: V }}>›</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: '#fff', padding: '70px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 30, textAlign: 'center' }}>
          {[
            { icon: '🕐', title: '24h/24, 7j/7', desc: 'Reservez a nimporte quel moment, ou que vous soyez en Algerie.' },
            { icon: '✅', title: 'Confirmation immediate', desc: 'Votre creneau est bloque instantanement, sans appel.' },
            { icon: '⭐', title: 'Avis verifies', desc: 'Seuls les clients ayant eu un RDV peuvent noter le salon.' },
          ].map(f => (
            <div key={f.title} style={{ maxWidth: 280 }}>
              <div style={{ fontSize: 28, marginBottom: 16, background: '#F3E8FF', width: 64, height: 64, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 10, color: VD }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#4B3B6B', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA PRO */}
      <section style={{ background: VD, color: '#fff', padding: '70px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, marginBottom: 15, fontWeight: 800 }}>Vous etes un professionnel ?</h2>
        <p style={{ fontSize: 16, color: VL, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>Rejoignez Bookme Pro pour gerer votre agenda en ligne et developper votre clientele partout en Algerie.</p>
        <Link href="/pro" style={{ display: 'inline-block', background: V, color: '#fff', padding: '15px 32px', fontWeight: 700, borderRadius: 6, marginTop: 28, fontSize: 15, textDecoration: 'none' }}>Decouvrir notre offre Pro</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: VD, padding: '30px 0', borderTop: '1px solid #2D1B4E', textAlign: 'center', color: '#4B3B6B', fontSize: 13 }}>
        Bookme.dz — La beaute a portee de clic en Algerie
      </footer>
    </div>
  )
}
