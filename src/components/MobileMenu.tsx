'use client'
import React, { useState } from 'react'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

const NAV_LINKS = [
  { label: 'Coiffure', val: 'Coiffure' },
  { label: 'Ongles', val: 'Beaute des ongles' },
  { label: 'Bien-etre', val: 'Massage et bien-etre' },
  { label: 'Barbier', val: 'Barbier' },
  { label: 'Hammam', val: 'Hammam & Spa' },
  { label: 'Chirurgie', val: 'Chirurgie esthetique' },
]

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false)

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
            <span style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>Bookme<span style={{ color: OR }}>dz</span></span>
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', padding: 4 }}>{'\u2715'}</button>
          </div>
          {NAV_LINKS.map(c => (
            <Link key={c.val} href={'/search?q=' + c.val} onClick={() => setMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: NOIR, textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>{c.label}</Link>
          ))}
          <div style={{ borderTop: '2px solid #eee', marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ background: NOIR, color: '#fff', padding: '14px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>Mon espace</Link>
            <Link href="/pro/login" onClick={() => setMenuOpen(false)} style={{ border: `1px solid ${OR}`, color: OR, padding: '14px', textAlign: 'center', borderRadius: 4, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>Espace Pro</Link>
          </div>
        </div>
      )}
    </>
  )
}
