'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

const SLIDES = [
  {
    cat: 'Coiffure',
    title: "L'art de la coupe",
    desc: "Envie d'un changement radical ou d'un simple rafraichissement ? Nos coiffeurs partenaires maitrisent toutes les techniques : balayage, ombre hair, lissage bresilien...",
    img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    link: '/search?q=Coiffure',
  },
  {
    cat: 'Manucure',
    title: 'Des mains parfaites',
    desc: "On raconte que les mains sont le reflet de la facon dont on prend soin de soi. Pose de vernis, gel ou nail art, trouvez la prothesiste ongulaire ideale.",
    img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d52?w=800',
    link: '/search?q=Manucure',
  },
  {
    cat: 'Institut de Beaute',
    title: 'Revelez votre eclat',
    desc: "Soins du visage, maquillage professionnel ou epilation. Confiez votre beaute a des mains expertes pour un resultat impeccable.",
    img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    link: '/search?q=Institut',
  },
  {
    cat: 'Massage et Bien-etre',
    title: 'Detente absolue',
    desc: "Lachez prise avec nos partenaires Spa et Bien-etre. Massages relaxants, gommages corps ou hammam pour une parenthese hors du temps.",
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
            {['Coiffure', 'Manucure', 'Institut', 'Massage', 'Barbier'].map(c => (
              <Link key={c} href={'/search?q=' + c} className={styles.catLink}>{c}</Link>
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
        <h1 className={styles.heroTitle}>Reservez votre beaute</h1>
        <p className={styles.heroSub}>Les meilleurs salons a portee de clic</p>
        <form onSubmit={handleSearch} className={styles.searchBox}>
          <div className={styles.searchGroup}>
            <span className={styles.searchLabel}>QUOI ?</span>
            <input className={styles.searchInput} value={query} onChange={e => setQuery(e.target.value)} placeholder="Coiffure, manucure, massage..." />
          </div>
          <div className={styles.searchDivider} />
          <div className={styles.searchGroup}>
            <span className={styles.searchLabel}>OU ?</span>
            <input className={styles.searchInput} value={loc} onChange={e => setLoc(e.target.value)} placeholder="Adresse, ville..." />
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
              <Link href={current.link} className={styles.btnSlideLink}>Voir les salons</Link>
              <div className={styles.controls}>
                <button onClick={prev} className={styles.controlBtn}>prev</button>
                <button onClick={next} className={styles.controlBtn}>next</button>
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
              <div className={styles.featDesc}>Reservez a nimporte quel moment, ou que vous soyez.</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featIcon}>✅</div>
              <div className={styles.featTitle}>Confirmation immediate</div>
              <div className={styles.featDesc}>Fini lattente. Votre creneau est bloque instantanement.</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featIcon}>⭐</div>
              <div className={styles.featTitle}>Avis verifies</div>
              <div className={styles.featDesc}>Seuls les clients ayant eu un RDV peuvent noter.</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.proCta}>
        <div className="container">
          <h2>Vous etes un professionnel de la beaute ?</h2>
          <p>Rejoignez Bookme Pro pour gerer votre agenda et developper votre clientele.</p>
          <Link href="/pro" className={styles.proCtaBtn}>Decouvrir notre offre Pro</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          Bookme.dz - La beaute a portee de clic.
        </div>
      </footer>
    </div>
  )
}
