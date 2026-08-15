'use client'
import React, { useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { Locale } from '@/i18n'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

const FLAGS: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  ar: '🇩🇿',
}

const LABELS: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'عر',
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: `1px solid #E0D8CE`,
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: NOIR,
        }}
      >
        {FLAGS[locale]} {LABELS[locale]}
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
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 999,
            overflow: 'hidden',
            minWidth: 120,
          }}>
            {(['fr', 'en', 'ar'] as Locale[]).map(l => (
              <button
                key={l}
                onClick={() => { setLocale(l); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: locale === l ? '#F8F5F0' : '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: locale === l ? 700 : 500,
                  color: locale === l ? OR : NOIR,
                  textAlign: 'left',
                }}
              >
                {FLAGS[l]} {l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'العربية'}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
