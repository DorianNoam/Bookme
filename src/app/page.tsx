'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { VILLES_ALGERIE } from '@/data/villes'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import MobileMenu from '@/components/MobileMenu'

const CATEGORIES = [
  { val: 'Coiffure & soin cheveux', label: 'Coiffure & soin cheveux' },
  { val: 'Onglerie Main & pieds', label: 'Onglerie Main & pieds' },
  { val: 'Beaute du regard', label: 'Beauté du regard' },
  { val: 'Soin visage & corps', label: 'Soin visage & corps' },
  { val: 'Make up', label: 'Make up' },
  { val: 'Epilation', label: 'Épilation' },
  { val: 'Piercing et tatouage', label: 'Piercing et tatouage' },
  { val: 'Barbier', label: 'Barbier' },
  { val: 'Esthetique', label: 'Esthétique' },
  { val: 'Massage', label: 'Massage' },
  { val: 'SPA', label: 'SPA' },
]

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function HomePage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [slide, setSlide] = useState(0)
  const [query, setQuery] = useState('')
  const [loc, setLoc] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

    const SLIDES = [
    { cat: t.carousel.slide1Cat, title: t.carousel.slide1Title, desc: t.carousel.slide1Desc, img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', link: '/search?q=' + encodeURIComponent('Coiffure & soin cheveux') },
    { cat: t.carousel.slide2Cat, title: t.carousel.slide2Title, desc: t.carousel.slide2Desc, img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', link: '/search?q=' + encodeURIComponent('Onglerie Main & pieds') },
    { cat: t.carousel.slide3Cat, title: t.carousel.slide3Title, desc: t.carousel.slide3Desc, img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', link: '/search?q=' + encodeURIComponent('Soin visage & corps') },
    { cat: t.carousel.slide4Cat, title: t.carousel.slide4Title, desc: t.carousel.slide4Desc, img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800', link: '/search?q=Barbier' },
    { cat: t.carousel.slide5Cat, title: t.carousel.slide5Title, desc: t.carousel.slide5Desc, img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', link: '/search?q=Massage' },
       { cat: t.carousel.slide6Cat, title: t.carousel.slide6Title, desc: t.carousel.slide6Desc, img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', link: '/search?q=SPA' },
  ]

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
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%', overflowX: 'hidden', background: BG }}>

      {/* ══════ HEADER ══════ */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '12px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: NOIR, whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>dz</span>
          </Link>

          {/* Actions desktop */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                       <LanguageSwitcher />
            <Link href={isLoggedIn ? '/dashboard' : '/login'} style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Espace Client</Link>
            <Link href="/pro" style={{ border: '1px solid ' + OR, color: OR, padding: '8px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Espace Pro</Link>
          </div>

          {/* Burger mobile */}
          <div className="hide-desktop" style={{ marginLeft: 'auto' }}>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* ══════ HERO SECTION ══════ */}
      {/* ══════ HERO SECTION ══════ */}
      <section style={{ position: 'relative', minHeight: 'clamp(420px, 60vw, 520px)', background: NOIR, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="/hero.jpg"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.15) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px, 8vw, 60px) 16px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: 40, height: 2, background: OR, marginBottom: 16 }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
            {t.hero.subtitle}
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 50px)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.1, maxWidth: 540, letterSpacing: -1 }}>
            {t.hero.title}
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#999', marginBottom: 'clamp(24px, 5vw, 38px)', maxWidth: 380, lineHeight: 1.7 }}>
            {t.hero.desc}
          </p>

          {/* BARRE DE RECHERCHE */}
          <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 6, display: 'flex', flexDirection: 'row', maxWidth: 680, boxShadow: '0 8px 40px rgba(0,0,0,0.4)', overflow: 'hidden', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', padding: 'clamp(12px, 2vw, 16px) clamp(14px, 3vw, 20px)', borderBottom: '1px solid #F0EAE0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{t.hero.prestation}</div>
              <select value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent', cursor: 'pointer' }}>
                <option value="">{t.hero.placeholder}</option>
                {CATEGORIES.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 200px', padding: 'clamp(12px, 2vw, 16px) clamp(14px, 3vw, 20px)', borderBottom: '1px solid #F0EAE0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{t.hero.ville}</div>
              <select value={loc} onChange={e => setLoc(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: NOIR, width: '100%', fontFamily: 'Inter, sans-serif', background: 'transparent', cursor: 'pointer' }}>
                <option value="">{t.hero.toutesVilles}</option>
                {VILLES_ALGERIE.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: 'clamp(14px, 3vw, 18px) 24px', fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', flex: '1 1 140px', minHeight: 48 }}>{t.hero.rechercher}</button>
          </form>
        </div>
      </section>

      {/* ══════ FILTRES ══════ */}
      <div style={{ background: '#fff', padding: '10px 0', borderBottom: '1px solid #EDE5D8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          alignItems: 'center',
          WebkitOverflowScrolling: 'touch',
        
        }}>
          <button onClick={() => router.push('/search')} style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{t.search.tous}</button>
          {CATEGORIES.map(cat => (
            <button key={cat.val} onClick={() => router.push(`/search?q=${encodeURIComponent(cat.val)}`)} style={{ color: '#444', border: '1px solid #DDD5C8', padding: '8px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat.label}</button>
          ))}
        </div>
      </div>

      {/* ══════ CAROUSEL ══════ */}
      <section style={{ padding: 'clamp(40px, 8vw, 80px) 0', background: BG }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: OR, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t.carousel.subtitle}</div>
          <div style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: NOIR, marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '-0.5px' }}>{t.carousel.title}</div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(20px, 4vw, 50px)',
            flexWrap: 'wrap',
            background: '#fff',
            padding: 'clamp(16px, 4vw, 40px)',
            borderRadius: 8,
            border: '1px solid #EDE5D8',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}>
            <div style={{ flex: '1 1 280px', height: 'clamp(220px, 40vw, 380px)', borderRadius: 6, overflow: 'hidden', width: '100%' }}>
              <img src={current.img} alt={current.cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: '1 1 280px', width: '100%' }}>
              <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, borderBottom: `2px solid ${OR}`, paddingBottom: 6 }}>{current.cat}</div>
              <h3 style={{ fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 900, color: NOIR, margin: '0 0 14px', letterSpacing: '-0.5px' }}>{current.title}</h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#666', lineHeight: 1.7, marginBottom: 'clamp(20px, 4vw, 30px)' }}>{current.desc}</p>

              <Link href={current.link} style={{ fontWeight: 800, color: NOIR, fontSize: 14, textDecoration: 'none', borderBottom: `2px solid ${NOIR}`, paddingBottom: 2, display: 'inline-block' }}>
               {t.carousel.voirEtablissements}
              </Link>

              <div style={{ display: 'flex', gap: 12, marginTop: 'clamp(20px, 4vw, 40px)' }}>
                <button onClick={() => setSlide(s => s === 0 ? SLIDES.length - 1 : s - 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${NOIR}`, background: '#fff', fontSize: 18, cursor: 'pointer', color: NOIR, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'<'}</button>
                <button onClick={() => setSlide(s => s === SLIDES.length - 1 ? 0 : s + 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${NOIR}`, background: '#fff', fontSize: 18, cursor: 'pointer', color: NOIR, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'>'}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section style={{ background: '#fff', padding: 'clamp(40px, 8vw, 80px) 0', borderTop: '1px solid #EDE5D8', borderBottom: '1px solid #EDE5D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 'clamp(20px, 4vw, 40px)', textAlign: 'center' }}>
          {[
            { icon: '🕐', title: t.features.title1, desc: t.features.desc1 },
            { icon: '✅', title: t.features.title2, desc: t.features.desc2 },
            { icon: '⭐', title: t.features.title3, desc: t.features.desc3 },
          ].map(f => (
            <div key={f.title} style={{ maxWidth: 300, flex: '1 1 220px', padding: 'clamp(12px, 3vw, 20px)' }}>
              <div style={{ fontSize: 28, marginBottom: 14, background: BG, width: 60, height: 60, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #E0D8CE' }}>{f.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 'clamp(15px, 3vw, 17px)', marginBottom: 10, color: NOIR }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CTA PRO ══════ */}
      <section style={{ background: NOIR, color: '#fff', padding: 'clamp(50px, 10vw, 90px) 16px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 2, background: OR, margin: '0 auto 18px' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: OR, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>{t.cta.subtitle}</div>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 38px)', marginBottom: 14, fontWeight: 900, letterSpacing: '-0.5px' }}>{t.cta.title}</h2>
        <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#aaa', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>{t.cta.desc}</p>
        <Link href="/pro" style={{ display: 'inline-block', background: OR, color: NOIR, padding: '16px clamp(24px, 5vw, 36px)', fontWeight: 900, borderRadius: 4, marginTop: 28, fontSize: 14, textDecoration: 'none', letterSpacing: '0.5px' }}>
          {t.cta.button}
        </Link>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: '#050505', padding: '24px 16px', borderTop: '1px solid #1a1a1a', textAlign: 'center', color: '#666', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <div>{t.footer}</div>
        <div>
          <Link href="/contact" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>
            Contactez-nous
          </Link>
        </div>
      </footer>
    </div>
  )
}
