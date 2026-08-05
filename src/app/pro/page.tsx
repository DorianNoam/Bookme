import React from 'react'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function ProLandingPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: NOIR, minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER PRO */}
      <header style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: '#fff', textDecoration: 'none' }}>
            Bookme<span style={{ color: OR }}>.dz</span> <span style={{ fontWeight: 400, fontSize: 16, color: '#888' }}>| Pro</span>
          </Link>
          <div style={{ display: 'flex', gap: 15 }}>
            <Link href="/" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              ← Retour au site client
            </Link>
            <Link href="/pro/login" style={{ background: OR, color: '#fff', padding: '8px 20px', borderRadius: 4, fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Cercles décoratifs en arrière-plan */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(184, 146, 42, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(184, 146, 42, 0.1) 0%, transparent 70%)', zIndex: 0 }} />

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <div style={{ color: OR, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 20 }}>
            Partenaires Bookme.dz
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>
            Développez votre salon avec l'agenda nouvelle génération
          </h1>
          <p style={{ fontSize: 18, color: '#aaa', marginBottom: 40, lineHeight: 1.6 }}>
            Gérez vos réservations, réduisez les rendez-vous manqués et attirez de nouveaux clients partout en Algérie.
          </p>
          
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <Link 
              href="/pro/login" 
              style={{ background: OR, color: '#fff', padding: '16px 36px', borderRadius: 4, fontSize: 16, fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s' }}
            >
              Accéder à mon espace
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30, maxWidth: 1000, width: '100%', marginTop: 80, position: 'relative', zIndex: 1, textAlign: 'left' }}>
          <div style={{ background: '#111', border: '1px solid #222', padding: 30, borderRadius: 6 }}>
            <div style={{ fontSize: 24, marginBottom: 15 }}>📅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#fff' }}>Agenda intelligent</h3>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>Un planning clair pour vous et vos collaborateurs, synchronisé en temps réel.</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #222', padding: 30, borderRadius: 6 }}>
            <div style={{ fontSize: 24, marginBottom: 15 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#fff' }}>Gestion d'équipe</h3>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>Attribuez les rendez-vous à vos employés et suivez leurs performances.</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #222', padding: 30, borderRadius: 6 }}>
            <div style={{ fontSize: 24, marginBottom: 15 }}>📈</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#fff' }}>Visibilité accrue</h3>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>Apparaissez sur la plateforme N°1 en Algérie et remplissez vos heures creuses.</p>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #222', padding: '30px 20px', textAlign: 'center', color: '#555', fontSize: 13 }}>
        © {new Date().getFullYear()} Bookme.dz Pro — Tous droits réservés.
      </footer>
    </div>
  )
}
