'use client';
import FavoriteButton from '@/components/FavoriteButton'
import MobileMenu from '@/components/MobileMenu'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/components/LanguageProvider'
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { VILLES_ALGERIE } from '@/data/villes';

const DEFAULT_IMAGES: Record<string, string> = {
  'Coiffure & soin cheveux': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
  'Onglerie Main & pieds': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
  'Beaute du regard': 'https://images.unsplash.com/photo-1636023730877-233b9237d4ec?w=800',
  'Soin visage & corps': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
  'Make up': 'https://images.unsplash.com/photo-1636023730877-233b9237d4ec?w=800',
  'Epilation': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
  'Piercing et tatouage': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
  'Barbier': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  'Esthetique': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
  'Massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  'SPA': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  'Yoga & Pilates': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  'Fitness & Musculation': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  'Danse & Cardio': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
}

// Un salon peut avoir plusieurs types separes par des virgules.
// On prend le premier type de la liste pour choisir l'image par defaut.
function getDefaultImage(typeSalon: string): string {
  const first = (typeSalon || '').split(',')[0].trim()
  return DEFAULT_IMAGES[first] || DEFAULT_IMAGES['Coiffure & soin cheveux']
}

const SearchMap = dynamic(() => import('@/components/SearchMap'), { 
  ssr: false, 
  loading: () => <div style={{ width: '100%', height: '100%', background: '#e5e3df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>...</div> 
});

type Salon = {
  id: number;
  nom: string;
  adresse: string;
  image: string;
  type_salon: string;
  telephone: string;
  description: string;
  ville: string;
  moy_note: string | null;
  nb_avis: number;
  latitude?: number;
  longitude?: number;
};

const CATEGORIES = [
  { val: 'Coiffure & soin cheveux', label: 'Coiffure & soin cheveux' },
  { val: 'Onglerie Main & pieds', label: 'Onglerie Main & pieds' },
  { val: 'Beaute du regard', label: 'Beauté du regard' },
  { val: 'Soin visage & corps', label: 'Soin visage & corps' },
  { val: 'Make up', label: 'Make up' },
  { val: 'Epilation', label: 'Épilation' },
  { val: 'Piercing et tatouage', label: 'Piercing et tatouage' },
  { val: 'Barbier', label: 'Barbier' },
  { val: 'Esthetique', label: 'Esthétique' },
  { val: 'Massage', label: 'Massage' },
  { val: 'SPA', label: 'SPA' },
];

const NOIR = '#0A0A0A';
const OR = '#B8922A';
const BG = '#F8F5F0';

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loc, setLoc] = useState(searchParams.get('loc') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredSalonId, setHoveredSalonId] = useState<number | null>(null);
  
  const [showMap, setShowMap] = useState(false);
  const [showMobilePrestations, setShowMobilePrestations] = useState(false);
  const [showMobileFiltres, setShowMobileFiltres] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (showMap) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [showMap]);

  const nextDays = Array.from({ length: 3 }).map((_, i) => {
    const d = addDays(new Date(), i + 1);
    return format(d, 'E.d', { locale: fr });
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.logged) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const l = searchParams.get('loc') || '';
    setQuery(q);
    setLoc(l);
    if (l) setUserLocation(null);
    fetchSalons(q, l);
  }, [searchParams]);

  async function fetchSalons(q: string, l: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (l) params.set('loc', l);
      const res = await fetch('/api/salons?' + params.toString(), { cache: 'no-store' });
      const data = await res.json();
      setSalons(data.salons || []);
    } catch {
      setSalons([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters(query, loc);
  }

  function applyFilters(newQuery: string, newLoc: string) {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newLoc) params.set('loc', newLoc);
    router.push('/search?' + params.toString());
    setShowMobilePrestations(false);
    setShowMobileFiltres(false);
  }

  function handleAutourDeMoi() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          applyFilters(query, ''); 
        },
        () => {
          alert("Impossible de récupérer votre position.");
        }
      );
    }
  }

  const displaySalons = [...salons].sort((a, b) => {
    if (!userLocation || !a.latitude || !b.latitude) return 0;
    const distA = getDistanceInKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude!);
    const distB = getDistanceInKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude!);
    return distA - distB;
  });

  const hasMappable = salons.some(s => s.latitude && s.longitude);

  // Trouver le label pour une catégorie (remplacé pour correspondre aux nouvelles CATEGORIES)
  function getCatLabel(val: string) {
    const found = CATEGORIES.find(c => c.val === val);
    return found ? found.label : val;
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {showMobilePrestations && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EDE5D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>{t.search.prestations}</h2>
            <button onClick={() => setShowMobilePrestations(false)} style={{ fontSize: 28, background: 'none', border: 'none', color: NOIR, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            <button 
              onClick={() => applyFilters('', loc)} 
              style={{ padding: '16px', textAlign: 'left', background: !query ? NOIR : BG, color: !query ? '#fff' : NOIR, borderRadius: 8, fontSize: 16, fontWeight: 700, border: 'none' }}
            >
              {t.search.toutesPrestations}
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.val} 
                onClick={() => applyFilters(cat.val, loc)} 
                style={{ padding: '16px', textAlign: 'left', background: query === cat.val ? NOIR : BG, color: query === cat.val ? '#fff' : NOIR, borderRadius: 8, fontSize: 16, fontWeight: 600, border: 'none' }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showMobileFiltres && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EDE5D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>{t.search.ville}</h2>
            <button onClick={() => setShowMobileFiltres(false)} style={{ fontSize: 28, background: 'none', border: 'none', color: NOIR, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            
            <button 
              onClick={handleAutourDeMoi} 
              style={{ padding: '16px', textAlign: 'left', background: userLocation ? BG : '#fff', color: userLocation ? NOIR : OR, borderRadius: 8, fontSize: 16, fontWeight: 700, border: userLocation ? `2px solid ${NOIR}` : `1px solid ${OR}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 20 }}>📍</span> {t.search.autourDeMoi}
            </button>
            
            <hr style={{ border: 'none', borderTop: '1px solid #EDE5D8', margin: '8px 0' }} />

            <button 
              onClick={() => applyFilters(query, '')} 
              style={{ padding: '16px', textAlign: 'left', background: !loc && !userLocation ? NOIR : BG, color: !loc && !userLocation ? '#fff' : NOIR, borderRadius: 8, fontSize: 16, fontWeight: 700, border: 'none' }}
            >
              {t.search.toutesVilles}
            </button>
            {VILLES_ALGERIE.map(v => (
              <button 
                key={v} 
                onClick={() => applyFilters(query, v)} 
                style={{ padding: '16px', textAlign: 'left', background: loc === v ? NOIR : BG, color: loc === v ? '#fff' : NOIR, borderRadius: 8, fontSize: 16, fontWeight: 600, border: 'none' }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '10px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 900, color: NOIR, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Bookme<span style={{ color: OR }}>dz</span>
          </Link>

          <form onSubmit={handleSearch} className="hide-mobile" style={{ flex: 1, display: 'flex', gap: 8, minWidth: 0 }}>
            <select value={query} onChange={e => setQuery(e.target.value)} style={{ flex: '1 1 140px', padding: '8px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR, cursor: 'pointer' }}>
              <option value="">{t.search.toutesPrestations}</option>
              {CATEGORIES.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
            </select>
            
            <select value={loc} onChange={e => setLoc(e.target.value)} style={{ flex: '1 1 120px', padding: '8px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR, minWidth: 0, cursor: 'pointer' }}>
              <option value="">{t.search.toutesVilles}</option>
              {VILLES_ALGERIE.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12, letterSpacing: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}>{t.hero.rechercher}</button>
            
            <button type="button" onClick={handleAutourDeMoi} style={{ background: userLocation ? NOIR : 'transparent', color: userLocation ? '#fff' : OR, border: `1px solid ${userLocation ? NOIR : OR}`, padding: '8px 14px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              📍 {t.search.autourDeMoi}
            </button>
          </form>

              <div className="hide-mobile" style={{ display: 'flex', gap: 8, whiteSpace: 'nowrap', alignItems: 'center', marginLeft: 'auto', flexShrink: 0 }}>
            <LanguageSwitcher />
            <Link href={isLoggedIn ? '/dashboard' : '/login'} style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Espace Client</Link>
            <Link href="/pro/login" style={{ background: '#fff', color: NOIR, padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: `1.5px solid ${OR}` }}>Espace Pro</Link>
          </div>

          <div className="hide-desktop" style={{ marginLeft: 'auto' }}>
            <MobileMenu />
          </div>
        </div>
      </header>

      <div className="hide-desktop" style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '10px 16px', display: 'flex', gap: 8, position: 'sticky', top: 54, zIndex: 90, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <button onClick={() => setShowMobilePrestations(true)} style={{ flex: 1, padding: '10px 4px', background: BG, border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 13, fontWeight: 600, color: NOIR, cursor: 'pointer', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          🏷️ {query ? getCatLabel(query) : t.search.prestations}
        </button>
        <button 
          onClick={() => setShowMap(!showMap)} 
          style={{ flex: 1, padding: '10px 4px', background: showMap ? OR : '#fff', border: `1px solid ${showMap ? OR : '#E0D8CE'}`, borderRadius: 6, fontSize: 13, fontWeight: 700, color: showMap ? '#fff' : NOIR, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {showMap ? `☰ ${t.search.liste}` : `🗺️ ${t.search.carte}`}
        </button>
        <button onClick={() => setShowMobileFiltres(true)} style={{ flex: 1, padding: '10px 4px', background: BG, border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 13, fontWeight: 600, color: NOIR, cursor: 'pointer', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {userLocation ? `📍 ${t.search.autourDeMoi}` : (loc ? `⚙️ ${loc}` : `⚙️ ${t.search.ville}`)}
        </button>
      </div>

      <div className="hide-mobile" style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '8px 0' }}>
        <div style={{ padding: '0 16px', display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <button onClick={() => applyFilters('', loc)} style={{ background: !query ? NOIR : 'transparent', color: !query ? '#fff' : '#555', padding: '6px 14px', borderRadius: 3, border: !query ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{t.search.tous}</button>
          {CATEGORIES.map(cat => (
            <button key={cat.val} onClick={() => applyFilters(cat.val, loc)} style={{ background: query === cat.val ? NOIR : 'transparent', color: query === cat.val ? '#fff' : '#555', padding: '6px 14px', borderRadius: 3, border: query === cat.val ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: query === cat.val ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat.label}</button>
          ))}
        </div>
      </div>

      <div className="split-layout">
        <div className={`list-col ${showMap ? 'hide-on-mobile' : ''}`}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: NOIR, marginBottom: 4 }}>
              {query ? getCatLabel(query) : t.search.selectEtablissement}
            </h1>
            <p style={{ color: '#888', fontSize: 13 }}>
              {loading ? t.search.rechercheEnCours : (userLocation ? `${t.search.meilleursSalons} : ${t.search.reservation}` : `${t.search.meilleursSalons} ${loc ? loc : t.search.enAlgerie} : ${t.search.reservation}`)}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>{t.common.chargement}</div>
          ) : displaySalons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', border: '1px dashed #DDD5C8', borderRadius: 4 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <p style={{ color: '#888', marginBottom: 16, fontSize: 14 }}>{t.search.aucunResultat}</p>
              <button onClick={() => applyFilters('','')} style={{ background: 'none', border: 'none', color: OR, fontWeight: 700, borderBottom: '1px solid ' + OR, paddingBottom: 2, fontSize: 14, cursor: 'pointer' }}>{t.search.voirTous}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {displaySalons.map(salon => {
                let distanceText = '';
                if (userLocation && salon.latitude && salon.longitude) {
                  const dist = getDistanceInKm(userLocation.lat, userLocation.lng, salon.latitude, salon.longitude);
                  distanceText = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
                }

                return (
                  <div
                    key={salon.id}
                    onMouseEnter={() => setHoveredSalonId(salon.id)}
                    onMouseLeave={() => setHoveredSalonId(null)}
                    className="salon-result-card"
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      border: hoveredSalonId === salon.id ? `2px solid ${OR}` : '1px solid #EDE5D8',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: hoveredSalonId === salon.id ? '0 4px 20px rgba(184,146,42,0.15)' : 'none',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
                      <div style={{ width: '260px', alignSelf: 'stretch', minHeight: '260px', flexShrink: 0, overflow: 'hidden', background: '#1a1a1a', position: 'relative' }} className="salon-image-container">
                        <img
                         src={salon.image || getDefaultImage(salon.type_salon)}
                          alt={salon.nom}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { const img = e.target as HTMLImageElement; const fb = DEFAULT_IMAGES['Coiffure & soin cheveux']; if (img.src !== fb) { img.src = fb; } }}
                        />
                        <div style={{ position: 'absolute', top: 12, right: 12 }}>
  <FavoriteButton salonId={String(salon.id)} />
</div>
                      </div>

                      <div style={{ flex: 1, padding: '20px', minWidth: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <Link href={'/salon/' + salon.id} style={{ fontSize: '20px', fontWeight: 800, color: NOIR, textDecoration: 'none' }}>
                              {salon.nom}
                            </Link>
                          </div>
                          <div style={{ color: '#666', fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            📍 {salon.adresse}{salon.ville ? ', ' + salon.ville : ''}
                            {distanceText && (
                              <span style={{ color: OR, fontWeight: 700, marginLeft: 6 }}>({distanceText})</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                            {salon.moy_note ? <span style={{ color: NOIR, fontWeight: 700 }}>★ {salon.moy_note} <span style={{ color: '#888', fontWeight: 400 }}>({salon.nb_avis} {t.search.avis})</span></span> : <span style={{ color: '#bbb' }}>{t.search.nouveau}</span>}
                            <span style={{ color: '#ddd' }}>•</span>
                            <span style={{ color: '#888' }}>{salon.type_salon}</span>
                          </div>

                          <div style={{ marginTop: '24px', borderTop: '1px solid #F5F0E6', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                              <span style={{ width: 85, fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1 }}>{t.search.matin}</span>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {nextDays.map(day => (
                                  <Link key={'m'+day} href={`/salon/${salon.id}`} style={{ border: `1px solid ${OR}`, color: OR, padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, textTransform: 'capitalize', textDecoration: 'none', background: '#fff', transition: 'all 0.2s' }}>
                                    {day}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <span style={{ width: 85, fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1 }}>{t.search.apresMidi}</span>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {nextDays.map(day => (
                                  <Link key={'a'+day} href={`/salon/${salon.id}`} style={{ border: `1px solid ${OR}`, color: OR, padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, textTransform: 'capitalize', textDecoration: 'none', background: '#fff', transition: 'all 0.2s' }}>
                                    {day}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24 }}>
                          <Link href={'/salon/' + salon.id} style={{ color: '#444', fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}>
                            {t.search.plusInfos}
                          </Link>
                          <Link href={'/booking?salon=' + salon.id} className="hide-mobile" style={{ background: NOIR, color: '#fff', padding: '10px 24px', borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                            {t.search.prendreRdv}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasMappable && (
          <div className={`map-col ${showMap ? 'show-on-mobile' : 'hide-on-mobile'}`}>
            <SearchMap
              salons={displaySalons}
              hoveredSalonId={hoveredSalonId}
              onMarkerClick={(id: number) => router.push('/salon/' + id)}
            />
          </div>
        )}

        {!hasMappable && !loading && salons.length > 0 && (
          <div className={`map-col ${showMap ? 'show-on-mobile' : 'hide-on-mobile'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e3df', color: '#999', fontSize: 14, textAlign: 'center', padding: 20 }}>
            <div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
              Carte indisponible.
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .split-layout { display: flex; flex: 1; overflow: hidden; position: relative; }
        .list-col { flex: 0 0 60%; max-width: 760px; padding: 20px 16px; overflow-y: auto; height: calc(100vh - 120px); background: #F8F5F0; }
        .map-col { flex: 1; position: relative; border-left: 1px solid #EDE5D8; height: calc(100vh - 120px); background: #e5e3df; }
        
        @media (max-width: 900px) {
          .split-layout { display: block; }
          .list-col { width: 100%; max-width: 100%; height: calc(100vh - 170px); }
          .list-col.hide-on-mobile { display: none; }
          
          .map-col { position: absolute; top: 0; left: 0; width: 100%; height: calc(100vh - 170px); border-left: none; transition: opacity 0.2s ease; }
          .map-col.hide-on-mobile { opacity: 0; pointer-events: none; z-index: -1; }
          .map-col.show-on-mobile { opacity: 1; pointer-events: auto; z-index: 10; }
          
          .salon-result-card > div { flex-direction: column; }
          .salon-image-container { width: 100% !important; height: 240px; min-height: auto !important; }
        }
      `}} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: BG, fontFamily: 'Inter, sans-serif', color: NOIR }}>
        ...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
