import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bookme.dz - Réservez votre beauté',
  description: 'Réservez en ligne dans les meilleurs salons de beauté, coiffure et spa.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
