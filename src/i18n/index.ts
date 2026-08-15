import fr from './fr.json'
import en from './en.json'
import ar from './ar.json'

export const translations = { fr, en, ar } as const
export type Locale = 'fr' | 'en' | 'ar'
export type Translations = typeof fr
