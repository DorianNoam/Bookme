import React from 'react'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function ProLandingPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: NOIR, minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
            Bookmedz<span style={{ color: OR }}>.com</span> <span style={{ fontWeight: 400, fontSize: 'clamp(11px, 2vw, 16px)', color: '#888' }}>| Pro</span>
          </Link>
          <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 15px)', alignItems: 'center' }}>
            <Link href="/" className="hide-mobile" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
              &larr; Retour au site client
            </Link>
            <Link href="/pro/login" style={{ background: OR, color: '#fff', padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 20px)', borderRadius: 4, fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(184, 146, 42, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(184, 146, 42, 0.1) 0%, transparent 70%)', zIndex: 0 }} />

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <div style={{ color: OR, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 20 }}>
            Partenaires Bookmedz.com
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>
            {"Développez votre salon avec l'agenda nouvelle génération"}
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: '#aaa', marginBottom: 40, lineHeight: 1.6 }}>
            {"Gérez vos réservations, réduisez les rendez-vous manqués et attirez de nouveaux clients partout en Algérie."}
          </p>
          
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/pro/register" 
              style={{ background: OR, color: '#fff', padding: '16px 36px', borderRadius: 4, fontSize: 16, fontWeight: 800, textDecoration: 'none' }}
            >
              Commencer gratuitement
            </Link>
            <Link 
              href="/pro/login" 
              style={{ background: 'transparent', color: '#fff', padding: '16px 36px', borderRadius: 4, fontSize: 16, fontWeight: 800, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30, maxWidth: 1000, width: '100%', marginTop: 80, position: 'relative', zIndex: 1, textAlign: 'left' }}>
          <div style={{ background: '#111', border: '1px solid #222', padding: 30, borderRadius: 6 }}>
            <div style={{ fontSize: 24, marginBottom: 15 }}>{'\uD83D\uDCC5'}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#fff' }}>Agenda intelligent</h3>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>{"Un planning clair pour vous et vos collaborateurs, synchronisé en temps réel."}</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #222', padding: 30, borderRadius: 6 }}>
            <div style={{ fontSize: 24, marginBottom: 15 }}>{'\uD83D\uDC65'}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#fff' }}>{"Gestion d'équipe"}</h3>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>{"Attribuez les rendez-vous à vos employés et suivez leurs performances."}</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #222', padding: 30, borderRadius: 6 }}>
            <div style={{ fontSize: 24, marginBottom: 15 }}>{'\uD83D\uDCC8'}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#fff' }}>{"Visibilité accrue"}</h3>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>{"Apparaissez sur la plateforme N°1 en Algérie et remplissez vos heures creuses."}</p>
          </div>
        </div>

        {/* SECTION TARIFICATION */}
        <div style={{ maxWidth: 1000, width: '100%', marginTop: 100, position: 'relative', zIndex: 1 }}>
          <div style={{ color: OR, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 }}>
            Tarification
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900, marginBottom: 50, letterSpacing: '-0.5px' }}>
            Simple, transparent, sans surprise
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, textAlign: 'left' }}>
            
            {/* OFFRE LANCEMENT */}
            <div style={{ background: '#111', border: `2px solid ${OR}`, borderRadius: 8, padding: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: OR, padding: '10px 20px', textAlign: 'center' }}>
                <span style={{ color: NOIR, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Offre de lancement</span>
              </div>
              <div style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 'clamp(40px, 8vw, 56px)', fontWeight: 900, color: OR }}>0 DA</span>
                </div>
                <p style={{ color: '#aaa', fontSize: 15, marginBottom: 30 }}>Pendant <strong style={{ color: '#fff' }}>1 an</strong> — sans engagement</p>
                
                <div style={{ display: 'grid', gap: 14, marginBottom: 30 }}>
                  {[
                    'Agenda en ligne illimité',
                    'Réservations clients 24h/24',
                    'Notifications email automatiques',
                    'Promotions et offres spéciales',
                    'Galerie photos du salon',
                    'Gestion des collaborateurs',
                    'Dashboard et statistiques',
                    'Page salon personnalisée',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: '#ccc' }}>
                      <span style={{ color: OR, fontSize: 16 }}>{'\u2713'}</span>
                      {f}
                    </div>
                  ))}
                </div>

                <Link href="/pro/register" style={{ display: 'block', background: OR, color: '#fff', padding: '14px', borderRadius: 6, fontSize: 15, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>
                  Commencer gratuitement
                </Link>
              </div>
            </div>

            {/* APRÈS 1 AN */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: 0, overflow: 'hidden' }}>
              <div style={{ background: '#1a1a1a', padding: '10px 20px', textAlign: 'center' }}>
                <span style={{ color: '#888', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>{"Après la 1ère année"}</span>
              </div>
              <div style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 'clamp(40px, 8vw, 56px)', fontWeight: 900, color: '#fff' }}>3 000 DA</span>
                  <span style={{ color: '#888', fontSize: 15 }}>/mois</span>
                </div>
                <p style={{ color: '#aaa', fontSize: 15, marginBottom: 30 }}>Soit <strong style={{ color: '#fff' }}>36 000 DA/an</strong> — engagement 12 mois</p>

                <div style={{ display: 'grid', gap: 14, marginBottom: 30 }}>
                  {[
                    'Toutes les fonctionnalités incluses',
                    'Support prioritaire',
                    'Mises à jour automatiques',
                    'Aucune commission sur les RDV',
                    'Paiement par virement ou CCP',
                    'Engagement annuel renouvelable',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: '#ccc' }}>
                      <span style={{ color: OR, fontSize: 16 }}>{'\u2713'}</span>
                      {f}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 6, padding: 16, textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    {"Pas de paiement en ligne requis. Un simple virement suffit pour renouveler votre abonnement."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ RAPIDE */}
          <div style={{ marginTop: 60, textAlign: 'left', maxWidth: 700, margin: '60px auto 0' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>{"Questions fréquentes"}</h3>
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 6, padding: 24 }}>
                <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 8px', fontSize: 15 }}>Pourquoi 1 an gratuit ?</p>
                <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{"Nous voulons que vous testiez la plateforme sans risque. Pas de carte bancaire, pas d'engagement. Si Bookmedz vous convient, vous continuez."}</p>
              </div>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 6, padding: 24 }}>
                <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 8px', fontSize: 15 }}>{"Y a-t-il une commission sur les réservations ?"}</p>
                <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{"Non. Zéro commission. Vos clients paient sur place et vous gardez 100% de vos revenus. Le prix de l'abonnement est fixe."}</p>
              </div>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 6, padding: 24 }}>
                <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 8px', fontSize: 15 }}>{"Comment je renouvelle après 1 an ?"}</p>
                <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{"Un simple virement de 36 000 DA (engagement 12 mois) avec votre nom de salon en motif. Vous recevrez des rappels à J-30, J-7 et J-3 avant l'échéance. Sans renouvellement, l'accès à votre espace pro sera suspendu."}</p>
              </div>
            </div>
          </div>

          {/* CTA FINAL */}
          <div style={{ marginTop: 80, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 900, marginBottom: 16 }}>{"Prêt à digitaliser votre salon ?"}</h2>
            <p style={{ color: '#888', fontSize: 15, marginBottom: 30 }}>{"Inscrivez-vous en 2 minutes. C'est gratuit pendant 1 an."}</p>
            <Link href="/pro/register" style={{ background: OR, color: '#fff', padding: '16px 40px', borderRadius: 4, fontSize: 16, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              {"Créer mon compte Pro"}
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #222', padding: '30px 20px', textAlign: 'center', color: '#555', fontSize: 13 }}>
        &copy; {new Date().getFullYear()} Bookmedz.com Pro &mdash; Tous droits réservés.
      </footer>
    </div>
  )
}
