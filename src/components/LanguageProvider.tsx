'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Locale, Translations } from '@/i18n'

type LanguageContextType = {
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  t: translations.fr,
  setLocale: () => {},
  dir: 'ltr',
})

export function useLanguage() {
  return useContext(LanguageContext)
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('bookmedz_lang') as Locale
    if (saved && translations[saved]) {
      setLocaleState(saved)
    }
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('bookmedz_lang', l)
  }

  const t = translations[locale]
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, dir }}>
      <div dir={dir}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}
