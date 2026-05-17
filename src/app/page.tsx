'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

const SLIDES = [
  {
    cat: 'Coiffure',
    title: "L'art de la coupe",
    desc: "Envie d'un changement radical ou d'un simple rafraîchissement ? Nos coiffeurs partenaires maîtrisent toutes les techniques : balayage, ombré hair, lissage brésilien...",
    img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    link: '/search?q=Coiffure',
  },
  {
    cat: 'Manucure',
    title: 'Des mains parfaites',
    desc: "On raconte que les mains sont le reflet de la façon dont on prend soin de soi. Pose de vernis, gel ou nail art, trouvez la prothésiste ongulaire idéale.",
    img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d52?w=800',
    link: '/search?q=Manucure',
  },
  {
    cat: 'Institut de Beauté',
    title: 'Révélez votre éclat',
    desc: "Soins du visage, maquillage professionnel ou épilation. Confiez votre beauté à des mains expertes pour un résultat impeccable.",
    img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    link: '/search?q=Institut',
  },
  {
    cat: 'Massage & Bien-être',
    title: 'Détente absolue',
    desc: "Lâchez prise avec nos partenaires Spa et Bien-être. Massages relaxants, gommages corps ou hammam pour une parenthèse hors du temps.",
    img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    link: '/search?q=Massage',
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
    router.push(`/search?${params.toString()}`)
  }

  const prev = () => setSlide(s => (s === 0 ? SLIDES.length - 1 : s - 1))
  const next = () => setSlide(s => (s === SLIDES.length - 1 ? 0 : s + 1))
  const current = SLIDES[slide]

  return (
    <div>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={`container ${styles.navFlex}`}>
          <Link href="/" className={styles.logo}>Bookme<span>.dz</span></Link>
          <nav className={styles.catNav}>
            {['Coiffure', 'Manucure', 'Institut', 'Massage', 'Barbier'].map(c => (
              <Link key={c} href={`/search?q=${c}`} className={styles.catLink}>{c}</Link>
            ))}
          </nav>
          <div className={styles.navRight}>
            <Link href="/login" className={styles.linkSimple}>Connexion</Link>
            <Link href="/register" className={styles.btnClient}>S'inscrire</Link>
            <Link href="/pro" className={styles.btnPro}>Espace Pro</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Réservez votre beauté</h1>
        <p className={styles.heroSub}>Les meilleurs salons à portée de clic</p>
        <form onSubmit={handleSearch} className={styles.searchBox}>
          <div className={styles.searchGroup}>
            <span className={styles.searchLabel}>QUOI ?</span>
            <input
              className={styles.searchInput}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Coiffure, manucure, massage..."
            />
          </div>
          <div className={styles.searchDivider} />
          <div className={styles.searchGroup}>
            <span className={styles.searchLabel}>OÙ ?</span>
            <input
              className={styles.searchInput}
              value={loc}
              onChange={e => setLoc(e.target.value)}
              placeholder="Adresse, ville..."
            />
          </div>
          <button type="submit" className={styles.btnSearch}>RECHERCHER</button>
        </form>
      </section>

      {/* CAROUSEL */}
      <section className={styles.discoverSection}>
        <div className="container">
          <div className={styles.mainTitle}>Découvrez nos<br />Professionnels</div>
          <div className={styles.slideItem}>
            <div className={styles.slideImageBox}>
              <img src={current.img} alt={current.cat} className={styles.slideImg} />
            </div>
            <div className={styles.slideContentBox}>
              <span className={styles.catIndicator}>{current.cat}</span>
              <h3 className={styles.slideTitle}>{current.title}</h3>
              <p className={styles.slideDesc}>{current.desc}</p>
              <Link href={current.link} className={styles.btnSlideLink}>
                Voir les salons →
              </Link>
              <div className={styles.controls}>
                <button onClick={prev} className={styles.controlBtn}>‹</button>
                <button onClick={next} className={styles.controlBtn}>›</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {[
              { icon: '🕐', title: '24h/24, 7j/7', desc: 'Réservez à n'importe quel moment, où que vous soyez.' },
              { icon: '✅', title: 'Confirmation immédiate', desc: 'Fini l'attente. Votre créneau est bloqué instantanément.' },
              { icon: '⭐', title: 'Avis vérifiés', desc: 'Seuls les clients ayant eu un RDV peuvent noter.' },
            ].map(f => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featIcon}>{f.icon}</div>
                <div className={styles.featTitle}>{f.title}</div>
                <div className={styles.featDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PRO */}
      <section className={styles.proCta}>
        <div className="container">
          <h2>Vous êtes un professionnel de la beauté ?</h2>
          <p>Rejoignez Bookme Pro pour gérer votre agenda et développer votre clientèle.</p>
          <Link href="/pro" className={styles.proCtaBtn}>Découvrir notre offre Pro</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          © {new Date().getFullYear()} Bookme.dz - La beauté à portée de clic.
        </div>
      </footer>
    </div>
  )
}
