'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from './LanguageProvider'
const NOIR = '#0A0A0A'
const OR = '#B8922A'
export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.logged) setIsLoggedIn(true) })
      .catch(() => {})
  }, [])

  const NAV_LINKS = [
    { label: t.nav.coiffure, val: 'Coiffure' },
    { label: t.nav.ongles, val: 'Beaute des ongles' },
    { label: t.nav.bienetre, val: 'Massage et bien-etre' },
    { label: t.nav.barbier, val: 'Barbier' },
    { label: t.nav.hammam, val: 'Hammam & Spa' },
    { label: t.nav.chirurgie, val: 'Chirurgie esthetique' },
  ]
  return (
    <>
      <button className="hide-desktop" onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ display: 'block', width: 24, height: 2, background: NOIR }} />
        <span style={{ display: 'block', width: 24, height: 2, background: NOIR }} />
        <span style={{ display: 'block', width: 24, height: 2, background: NOIR }} />
      </button>
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#fff', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>Bookmedz<span style={{ color: OR }}>.com</span></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LanguageSwitcher />
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', padding: 4 }}>{'\u2715'}</button>
            </div>
          </div>
          {NAV_LINKS.map(c => (
            <Link key={c.val} href={'/search?q=' + c.val} onClick={() => setMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: NOIR, textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>{c.label}</Link>
          ))}
          <div style={{ borderTop: '2px solid #eee', marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href={isLoggedIn ? '/dashboard' : '/login'} onClick={() => setMenuOpen(false)} style={{ background: NOIR, color: '#fff', padding: '14px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>{t.nav.monEspace}</Link>
            <Link href="/pro/login" onClick={() => setMenuOpen(false)} style={{ border: `1px solid ${OR}`, color: OR, padding: '14px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>{t.nav.espacePro}</Link>
          </div>
        </div>
      )}
    </>
  )
}
