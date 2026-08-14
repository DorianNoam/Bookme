'use client';
import MobileMenu from '@/components/MobileMenu'
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { VILLES_ALGERIE } from '@/data/villes';

// Import dynamique de la carte Leaflet
const SearchMap = dynamic(() => import('@/components/SearchMap'), { 
  ssr: false, 
  loading: () => <div style={{ width: '100%', height: '100%', background: '#e5e3df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>Chargement de la carte...</div> 
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

const CATEGORIES = ['Coiffure', 'Beaute des ongles', 'Massage et bien-etre', 'Barbier', 'Hammam & Spa', 'Chirurgie esthetique'];
const NOIR = '#0A0A0A';
const OR = '#B8922A';
const BG = '#F8F5F0';

// Fonction pour calculer la distance en km entre deux points GPS (Formule de Haversine)
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Rayon de la Terre en km
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
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loc, setLoc] = useState(searchParams.get('loc') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredSalonId, setHoveredSalonId] = useState<number | null>(null);
  
  // États pour la version Mobile et la Géolocalisation
  const [showMap, setShowMap] = useState(false);
  const [showMobilePrestations, setShowMobilePrestations] = useState(false);
  const [showMobileFiltres, setShowMobileFiltres] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Forcer le redessin de Leaflet lors de l'ouverture de l'onglet Carte
  useEffect(() => {
    if (showMap) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [showMap]);

  // Génération des 3 prochains jours
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
    
    // Si une ville est explicitement cherchée, on annule la géolocalisation
    if (l) setUserLocation(null);
    
    fetchSalons(q, l);
  }, [searchParams]);

  async function fetchSalons(q: string, l: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (l) params.set('loc', l);
      const res = await fetch('/api/salons?' + params.toString());
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

  // Activer la géolocalisation de l'utilisateur
  function handleAutourDeMoi() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // On efface la ville dans l'URL pour ne pas filtrer par ville
          applyFilters(query, ''); 
        },
        (error) => {
          alert("Impossible de récupérer votre position. Veuillez autoriser la géolocalisation.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  }

  // Tri des salons : si géolocalisé, on trie par distance
  const displaySalons = [...salons].sort((a, b) => {
    if (!userLocation || !a.latitude || !b.latitude) return 0;
    const distA = getDistanceInKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude!);
    const distB = getDistanceInKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude!);
    return distA - distB;
  });

  const hasMappable = salons.some(s => s.latitude && s.longitude);

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* MODALE MOBILE : PRESTATIONS */}
      {showMobilePrestations && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EDE5D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>Choisir une prestation</h2>
            <button onClick={() => setShowMobilePrestations(false)} style={{ fontSize: 28, background: 'none', border: 'none', color: NOIR, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            <button 
              onClick={() => applyFilters('', loc)} 
              style={{ padding: '16px', textAlign: 'left', background: !query ? NOIR : BG, color: !query ? '#fff' : NOIR, borderRadius: 8, fontSize: 16, fontWeight: 700, border: 'none' }}
            >
              Toutes les prestations
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => applyFilters(cat, loc)} 
                style={{ padding: '16px', textAlign: 'left', background: query === cat ? NOIR : BG, color: query === cat ? '#fff' : NOIR, borderRadius: 8, fontSize: 16, fontWeight: 600, border: 'none' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODALE MOBILE : FILTRES (VILLES & AUTOUR DE MOI) */}
      {showMobileFiltres && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EDE5D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>Adresse</h2>
            <button onClick={() => setShowMobileFiltres(false)} style={{ fontSize: 28, background: 'none', border: 'none', color: NOIR, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            
            {/* BOUTON AUTOUR DE MOI */}
            <button 
              onClick={handleAutourDeMoi} 
              style={{ padding: '16px', textAlign: 'left', background: userLocation ? BG : '#fff', color: userLocation ? NOIR : OR, borderRadius: 8, fontSize: 16, fontWeight: 700, border: userLocation ? `2px solid ${NOIR}` : `1px solid ${OR}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 20 }}>📍</span> Autour de moi
            </button>
            
            <hr style={{ border: 'none', borderTop: '1px solid #EDE5D8', margin: '8px 0' }} />

            <button 
              onClick={() => applyFilters(query, '')} 
              style={{ padding: '16px', textAlign: 'left', background: !loc && !userLocation ? NOIR : BG, color: !loc && !userLocation ? '#fff' : NOIR, borderRadius: 8, fontSize: 16, fontWeight: 700, border: 'none' }}
            >
              Toute l&apos;Algérie
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

{/* HEADER DESKTOP & MOBILE */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '10px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 900, color: NOIR, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </Link>

          <form onSubmit={handleSearch} className="hide-mobile" style={{ flex: 1, display: 'flex', gap: 8, minWidth: 0 }}>
            <select value={query} onChange={e => setQuery(e.target.value)} style={{ flex: '1 1 140px', padding: '8px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR, cursor: 'pointer' }}>
              <option value="">Toutes les prestations</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select value={loc} onChange={e => setLoc(e.target.value)} style={{ flex: '1 1 120px', padding: '8px 12px', border: '1px solid #E0D8CE', borderRadius: 4, fontSize: 14, background: 'white', fontFamily: 'Inter, sans-serif', color: NOIR, minWidth: 0, cursor: 'pointer' }}>
              <option value="">Toutes les villes (Algerie)</option>
              {VILLES_ALGERIE.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <button type="submit" style={{ background: OR, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12, letterSpacing: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}>Rechercher</button>
            
            <button type="button" onClick={handleAutourDeMoi} style={{ background: userLocation ? NOIR : 'transparent', color: userLocation ? '#fff' : OR, border: `1px solid ${userLocation ? NOIR : OR}`, padding: '8px 14px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              📍 Autour de moi
            </button>
          </form>

          <div className="hide-mobile" style={{ display: 'flex', gap: 8, whiteSpace: 'nowrap', alignItems: 'center', marginLeft: 'auto', flexShrink: 0 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Mon espace</Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#555', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Connexion</Link>
                <Link href="/login" style={{ background: NOIR, color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Mon espace</Link>
              </>
            )}
            <Link href="/pro/login" style={{ background: '#fff', color: NOIR, padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: `1.5px solid ${OR}` }}>
              Espace Pro
            </Link>
          </div>

          <MobileMenu />
        </div>
      </header>

      {/* BARRE D'ONGLETS MOBILE */}
      <div className="hide-desktop" style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '10px 16px', display: 'flex', gap: 8, position: 'sticky', top: 54, zIndex: 90, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <button onClick={() => setShowMobilePrestations(true)} style={{ flex: 1, padding: '10px 4px', background: BG, border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 13, fontWeight: 600, color: NOIR, cursor: 'pointer', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          🏷️ {query ? query : 'Prestations'}
        </button>
        <button 
          onClick={() => setShowMap(!showMap)} 
          style={{ flex: 1, padding: '10px 4px', background: showMap ? OR : '#fff', border: `1px solid ${showMap ? OR : '#E0D8CE'}`, borderRadius: 6, fontSize: 13, fontWeight: 700, color: showMap ? '#fff' : NOIR, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {showMap ? '☰ Liste' : '🗺️ Carte'}
        </button>
        <button onClick={() => setShowMobileFiltres(true)} style={{ flex: 1, padding: '10px 4px', background: BG, border: '1px solid #E0D8CE', borderRadius: 6, fontSize: 13, fontWeight: 600, color: NOIR, cursor: 'pointer', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {userLocation ? '📍 Autour de moi' : (loc ? `⚙️ ${loc}` : '⚙️ Ville')}
        </button>
      </div>

      {/* FILTRES PAR CATÉGORIE (DESKTOP) */}
      <div className="hide-mobile" style={{ background: '#fff', borderBottom: '1px solid #EDE5D8', padding: '8px 0' }}>
        <div style={{ padding: '0 16px', display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <button onClick={() => applyFilters('', loc)} style={{ background: !query ? NOIR : 'transparent', color: !query ? '#fff' : '#555', padding: '6px 14px', borderRadius: 3, border: !query ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Tous</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => applyFilters(cat, loc)} style={{ background: query === cat ? NOIR : 'transparent', color: query === cat ? '#fff' : '#555', padding: '6px 14px', borderRadius: 3, border: query === cat ? 'none' : '1px solid #DDD5C8', fontSize: 12, fontWeight: query === cat ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="split-layout">
        <div className={`list-col ${showMap ? 'hide-on-mobile' : ''}`}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: NOIR, marginBottom: 4 }}>
              {query ? query : 'Sélectionnez un établissement'}
            </h1>
            <p style={{ color: '#888', fontSize: 13 }}>
              {loading ? 'Recherche en cours...' : (userLocation ? `Les meilleurs salons et instituts autour de vous : Réservation en ligne` : `Les meilleurs salons et instituts ${loc ? 'à ' + loc : 'en Algérie'} : Réservation en ligne`)}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Chargement...</div>
          ) : displaySalons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', border: '1px dashed #DDD5C8', borderRadius: 4 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{'🔍'}</div>
              <p style={{ color: '#888', marginBottom: 16, fontSize: 14 }}>Aucun établissement ne correspond à votre recherche.</p>
              <button onClick={() => applyFilters('','')} style={{ background: 'none', border: 'none', color: OR, fontWeight: 700, borderBottom: '1px solid ' + OR, paddingBottom: 2, fontSize: 14, cursor: 'pointer' }}>Voir tous les établissements</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {displaySalons.map(salon => {
                
                // Calcul de la distance spécifique à afficher sur la carte si l'utilisateur est géolocalisé
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
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <div style={{ width: '260px', minHeight: '200px', flexShrink: 0, overflow: 'hidden', background: '#1a1a1a', position: 'relative' }} className="salon-image-container">
                        <img
                          src={salon.image}
                          alt={salon.nom}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>♡</button>
                      </div>

                      <div style={{ flex: 1, padding: '20px', minWidth: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <Link
                              href={'/salon/' + salon.id}
                              style={{ fontSize: '20px', fontWeight: 800, color: NOIR, textDecoration: 'none' }}
                            >
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
                            {salon.moy_note ? <span style={{ color: NOIR, fontWeight: 700 }}>★ {salon.moy_note} <span style={{ color: '#888', fontWeight: 400 }}>({salon.nb_avis} avis)</span></span> : <span style={{ color: '#bbb' }}>Nouveau</span>}
                            <span style={{ color: '#ddd' }}>•</span>
                            <span style={{ color: '#888' }}>{salon.type_salon}</span>
                          </div>

                          <div style={{ marginTop: '24px', borderTop: '1px solid #F5F0E6', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                              <span style={{ width: 85, fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1 }}>MATIN</span>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {nextDays.map(day => (
                                  <Link key={'m'+day} href={`/salon/${salon.id}`} style={{ border: `1px solid ${OR}`, color: OR, padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, textTransform: 'capitalize', textDecoration: 'none', background: '#fff', transition: 'all 0.2s' }}>
                                    {day}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <span style={{ width: 85, fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1 }}>APRÈS-MIDI</span>
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
                            Plus d&apos;informations
                          </Link>
                          <Link href={'/booking?salon=' + salon.id} className="hide-mobile" style={{ background: NOIR, color: '#fff', padding: '10px 24px', borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                            Prendre RDV
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
              <div style={{ fontSize: 36, marginBottom: 12 }}>{'🗺️'}</div>
              Carte indisponible.<br />Les salons n&apos;ont pas encore de coordonnées GPS.
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
          .salon-image-container { width: 100% !important; height: 220px; min-height: auto !important; }
        }
      `}} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: BG, fontFamily: 'Inter, sans-serif', color: NOIR }}>
        Chargement...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
