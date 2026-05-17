'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

const CATEGORIES = ['Coiffure', 'Beaute des ongles', 'Massage et bien-etre', 'Barbier', 'Hammam & Spa', 'Chirurgie esthetique']

const NAV_LINKS = [
  { label: 'Coiffure', val: 'Coiffure' },
  { label: 'Ongles', val: 'Beaute des ongles' },
  { label: 'Bien-etre', val: 'Massage et bien-etre' },
  { label: 'Barbier', val: 'Barbier' },
  { label: 'Hammam', val: 'Hammam & Spa' },
  { label: 'Chirurgie', val: 'Chirurgie esthetique' },
]

const SLIDES = [
  {
    cat: 'Coiffure',
    title: "L'art de la coupe",
    desc: "Envie d'un changement ou d'un simple rafraichissement ? Nos coiffeurs maitrisent toutes les techniques : balayage, ombre hair, lissage bresilien...",
    img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    link: '/search?q=Coiffure',
  },
  {
    cat: 'Beaute des ongles',
    title: 'Des mains parfaites',
    desc: "Pose de vernis, gel, nail art ou beaute des pieds. Trouvez la specialiste ideale pour des ongles impeccables.",
    img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d52?w=800',
    link: '/search?q=Beaute des ongles',
  },
  {
    cat: 'Hammam & Spa',
    title: 'Detente absolue',
    desc: "Gommage, massage et soins traditionnels. Offrez-vous une vraie parenthese de bien-etre dans les meilleurs hammams.",
    img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    link: '/search?q=Hammam & Spa',
  },
  {
    cat: 'Chirurgie esthetique',
    title: 'Des professionnels de confiance',
    desc: "Consultations et interventions esthetiques realisees par des medecins qualifies. Trouvez la clinique qu'il vous faut.",
    img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    link: '/search?q=Chirurgie esthetique',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [query, setQuery] = useState('')
  const [loc, setLoc] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (loc) params.set('loc', loc)
    router.push('/search?' + params.toString())
  }

  const prev = () => setSlide(s => (s === 0 ? SLIDES.length - 1 : s - 1))
  const next = () => setSlide(s => (s === SLIDES.length - 1 ? 0 : s + 1))
  const current = SLIDES[slide]

  return (
    <div>
      <header className={styles.header}>
        <div className={'container ' + styles.navFlex}>
          <Link href="/" className={styles.logo}>Bookme<span>.dz</span></Link>
          <nav className={styles.catNav}>
            {NAV_LINKS.map(c => (
              <Link key={c.val} href={'/search?q=' + c.val} className={styles.catLink}>{c.label}</Link>
            ))}
          </nav>
          <div className={styles.navRight}>
            <Link href="/login" className={styles.linkSimple}>Connexion</Link>
            <Link href="/register" className={styles.btnClient}>Inscription</Link>
            <Link href="/pro" className={styles.btnPro}>Espace Pro</Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>Plateforme N°1 en Algerie</div>
        <h1 className={styles.heroTitle}>Reservez votre beaute en ligne</h1>
        <p className={styles.heroSub}>Les meilleurs salons, instituts et spas a portee de clic, partout en Algerie.</p>
        <form onSubmit={handleSearch} className={styles.searchBox}>
          <div className={styles.searchGroup}>
            <span className={styles.searchLabel}>Prestation</span>
            <select className={styles.searchInput} value={query} onChange={e => setQuery(e.target.value)}>
              <option value="">Coiffure, massage, ongles...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.searchDivider} />
          <div className={styles.searchGroup}>
            <span className={styles.searchLabel}>Ville</span>
            <input className={styles.searchInput} value={loc} onChange={e => setLoc(e.target.value)} placeholder="Alger, Oran, Constantine..." />
          </div>
          <button type="submit" className={styles.btnSearch}>RECHERCHER</button>
        </form>
      </section>

      <section className={styles.discoverSection}>
        <div className="container">
          <div className={styles.mainTitle}>Decouvrez nos Professionnels</div>
          <div className={styles.slideItem}>
            <div className={styles.slideImageBox}>
              <img src={current.img} alt={current.cat} className={styles.slideImg} />
            </div>
            <div className={styles.slideContentBox}>
              <span className={styles.catIndicator}>{current.cat}</span>
              <h3 className={styles.slideTitle}>{current.title}</h3>
              <p className={styles.slideDesc}>{current.desc}</p>
              <Link href={current.link} className={styles.btnSlideLink}>Voir les etablissements →</Link>
              <div className={styles.controls}>
                <button onClick={prev} className={styles.controlBtn}>‹</button>
                <button onClick={next} className={styles.controlBtn}>›</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featIcon}>🕐</div>
              <div className={styles.featTitle}>24h/24, 7j/7</div>
              <div className={styles.featDesc}>Reservez a nimporte quel moment, ou que vous soyez en Algerie.</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featIcon}>✅</div>
              <div className={styles.featTitle}>Confirmation immediate</div>
              <div className={styles.featDesc}>Votre creneau est bloque instantanement, sans appel.</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featIcon}>⭐</div>
              <div className={styles.featTitle}>Avis verifies</div>
              <div className={styles.featDesc}>Seuls les clients ayant eu un RDV peuvent noter le salon.</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.proCta}>
        <div className="container">
          <h2>Vous etes un professionnel ?</h2>
          <p>Rejoignez Bookme Pro pour gerer votre agenda en ligne et developper votre clientele partout en Algerie.</p>
          <Link href="/pro" className={styles.proCtaBtn}>Decouvrir notre offre Pro</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          Bookme.dz — La beaute a portee de clic en Algerie
        </div>
      </footer>
    </div>
  )
}
