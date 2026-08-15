'use client'
import React, { useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { Locale } from '@/i18n'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

const LANGS: { code: Locale; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 8px',
          fontSize: 13,
          fontWeight: 700,
          color: NOIR,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {locale.toUpperCase()}
        <span style={{ fontSize: 10, color: '#888' }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#fff',
            border: '1px solid #E0D8CE',
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 999,
            overflow: 'hidden',
          }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 20px',
                  border: 'none',
                  background: locale === l.code ? '#F8F5F0' : '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: locale === l.code ? 800 : 500,
                  color: locale === l.code ? OR : NOIR,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
