import FavoriteButton from '@/components/FavoriteButton'
import MobileMenu from '@/components/MobileMenu'
import React from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const DEFAULT_IMAGES: Record<string, string> = {
  'Coiffure': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
  'Barbier': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  'Beaute des ongles': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
  'Massage et bien-etre': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  'Hammam & Spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800',
  'Chirurgie esthetique': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
  'Institut': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'
const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

type Salon = {
  id: number; nom: string; adresse: string; ville: string; telephone: string;
  description: string; ouverture: string; fermeture: string; jour_off: number;
  type_salon: string; image: string; pause_active?: boolean; pause_debut?: string;
  pause_fin?: string; instagram?: string; latitude?: number; longitude?: number;
}

export default async function SalonPage({
  params,
  searchParams
}: {
  params: { id: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const salonId = params.id
  const isGalleryOpen = searchParams.gallery === 'open'

  const { data: salonData } = await supabase.from('salons').select('*').eq('id', salonId).single()
  if (!salonData) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Salon introuvable</div>

  const salon = salonData as Salon

  const [servicesRes, avisRes, galleryRes] = await Promise.all([
    supabase.from('services').select('*').eq('salon_id', salonId).order('categorie_service'),
    supabase.from('avis').select('*, users(prenom, nom)').eq('salon_id', salonId),
    supabase.from('salon_images').select('*').eq('salon_id', salonId)
  ])

  const safeServices = servicesRes.data || []
  const safeAvis = avisRes.data || []
  const safeGallery = galleryRes.data || []
  const heroImage = salon.image || DEFAULT_IMAGES[salon.type_salon] || DEFAULT_IMAGES['Coiffure']
  const allImages = [salon.image, ...safeGallery.map((g: any) => g.image_path)].filter(Boolean)

  const grouped: Record<string, any[]> = safeServices.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.categorie_service || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  const promos = safeServices.filter((s: any) => s.promo_active && s.promo_pourcentage)

  const moyNote = safeAvis.length > 0
    ? (safeAvis.reduce((sum: number, a: any) => sum + (a.note || 0), 0) / safeAvis.length).toFixed(1)
    : null

  const googleMapsUrl = salon.latitude && salon.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.adresse + ', ' + salon.ville + ', Algerie')}`

  const mapEmbedUrl = salon.latitude && salon.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${salon.longitude - 0.008}%2C${salon.latitude - 0.005}%2C${salon.longitude + 0.008}%2C${salon.latitude + 0.005}&layer=mapnik&marker=${salon.latitude}%2C${salon.longitude}`
    : null

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 80 }}>

      {/* GALERIE FULLSCREEN */}
      {isGalleryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,10,10,0.98)', zIndex: 9999, overflowY: 'auto', padding: '60px 20px' }}>
          <Link href={`/salon/${salonId}`} scroll={false} style={{ position: 'fixed', top: 20, right: 30, color: '#fff', fontSize: 40, textDecoration: 'none', fontWeight: 300, zIndex: 10000, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            &times;
          </Link>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 30 }}>Toutes les photos ({allImages.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {allImages.map((img: string, i: number) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', height: 250, border: '1px solid #333' }}>
                  <img src={img} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroll { overflow-x: auto; scrollbar-width: thin; scrollbar-color: #E0D8CE transparent; }
        .custom-scroll::-webkit-scrollbar { height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #E0D8CE; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #B8922A; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 200px 200px; gap: 4px; height: 404px; }
        .hero-grid .hero-main { grid-row: 1 / 3; }
        .hero-single { height: 400px; }
        .salon-content { display: grid; grid-template-columns: 1fr 360px; gap: 40px; }
        .salon-sidebar { position: sticky; top: 80px; align-self: start; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; grid-template-rows: 280px; height: auto; }
          .hero-grid .hero-main { grid-row: auto; }
          .hero-grid .hero-extra { display: none; }
          .hero-single { height: 280px; }
          .salon-content { grid-template-columns: 1fr; gap: 0; }
          .salon-sidebar { position: relative; top: 0; order: -1; margin-bottom: 20px; }
          .hide-mobile-flex { display: none !important; }
        }
      `}} />

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E0D8CE', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, gap: 12 }}>
        <Link href="/search" style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: NOIR, textDecoration: 'none', flexShrink: 0 }}>
          Bookme<span style={{ color: OR }}>dz</span>
        </Link>
        <Link href="/search" className="hide-mobile" style={{ color: '#888', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>&larr; Retour aux salons</Link>
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Link href="/dashboard" style={{ background: NOIR, color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mon espace</Link>
          <Link href="/pro/login" style={{ background: '#fff', color: NOIR, padding: '8px 20px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: `1.5px solid ${OR}` }}>Espace Pro</Link>
        </div>
        <div className="hide-desktop" style={{ marginLeft: 'auto' }}><MobileMenu /></div>
      </header>

      {/* ═══════════════ HERO PHOTOS ═══════════════ */}
      {allImages.length >= 3 ? (
        <div className="hero-grid" style={{ overflow: 'hidden', position: 'relative' }}>
          <div className="hero-main" style={{ overflow: 'hidden' }}>
            <img src={allImages[0]} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="hero-extra" style={{ overflow: 'hidden' }}>
            <img src={allImages[1]} alt="Photo 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="hero-extra" style={{ overflow: 'hidden', position: 'relative' }}>
            <img src={allImages[2]} alt="Photo 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {allImages.length > 3 && (
              <Link href={`/salon/${salonId}?gallery=open`} scroll={false} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800, textDecoration: 'none', gap: 8 }}>
                Voir les {allImages.length} photos
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="hero-single" style={{ position: 'relative', overflow: 'hidden' }}>
          <img src={heroImage} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {allImages.length > 1 && (
            <Link href={`/salon/${salonId}?gallery=open`} scroll={false} style={{ position: 'absolute', bottom: 16, right: 16, background: '#fff', color: NOIR, padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              Voir les {allImages.length} photos
            </Link>
          )}
        </div>
      )}

      {/* ═══════════════ CONTENU PRINCIPAL ═══════════════ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 20px' }}>
        <div className="salon-content">

          {/* ══════ COLONNE GAUCHE ══════ */}
          <div>

            {/* EN-TETE SALON */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ color: OR, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, background: '#FFF8EE', padding: '4px 10px', borderRadius: 4 }}>{salon.type_salon}</div>
                {moyNote && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: NOIR }}>&#9733; {moyNote} <span style={{ color: '#888', fontWeight: 400 }}>({safeAvis.length} avis)</span></div>}
                {!moyNote && <span style={{ color: '#bbb', fontSize: 13 }}>Nouveau</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 900, color: NOIR, margin: 0 }}>{salon.nom}</h1>
                <FavoriteButton salonId={salonId} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, fontSize: 14, color: '#666' }}>
                <span>&#128205; {salon.adresse}, {salon.ville}</span>
                <span>&#128338; {salon.ouverture?.substring(0, 5)} - {salon.fermeture?.substring(0, 5)}{salon.pause_active ? ` (pause ${salon.pause_debut?.substring(0, 5)} - ${salon.pause_fin?.substring(0, 5)})` : ''}</span>
                {salon.jour_off > 0 && <span style={{ color: '#d32f2f', fontWeight: 700 }}>Ferme le {JOURS[salon.jour_off]}</span>}
              </div>
            </div>

            {/* SECTION : A PROPOS */}
            {salon.description && (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', padding: 'clamp(20px, 4vw, 28px)', marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, margin: '0 0 12px 0' }}>A propos</h2>
                <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{salon.description}</p>
              </div>
            )}

            {/* SECTION : PROMOS */}
            {promos.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#d32f2f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>&#127881; Offres speciales</h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {promos.map((promo: any) => {
                    const prixRemise = Math.round(promo.prix - (promo.prix * (promo.promo_pourcentage || 0) / 100))
                    return (
                      <div key={promo.id} style={{ background: '#fff', border: '1px solid #ffcccb', borderRadius: 12, padding: 'clamp(16px, 3vw, 24px)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, background: '#d32f2f', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 10px', borderBottomLeftRadius: 8 }}>-{promo.promo_pourcentage}%</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 4 }}>{promo.nom}</div>
                            {promo.promo_nom && <div style={{ color: OR, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>&#10024; {promo.promo_nom}</div>}
                            <div style={{ color: '#888', fontSize: 13 }}>{promo.duree} min</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: '#999', textDecoration: 'line-through', fontSize: 13 }}>{promo.prix} DA</div>
                              <div style={{ color: '#d32f2f', fontSize: 20, fontWeight: 900 }}>{prixRemise} DA</div>
                            </div>
                            <Link href={`/booking?salon=${salonId}&service=${promo.id}`} style={{ background: OR, color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>Reserver</Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SECTION : PRESTATIONS */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 16 }}>Prestations</h2>
              {Object.keys(grouped).length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 12, padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>Aucune prestation configuree pour le moment.</div>
              ) : (
                Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat} style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{cat}</h3>
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', overflow: 'hidden' }}>
                      {items.map((service: any, index: number) => (
                        <div key={service.id} style={{ padding: 'clamp(14px, 3vw, 20px)', borderBottom: index < items.length - 1 ? '1px solid #F0EBE1' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: NOIR, marginBottom: 2 }}>{service.nom}</div>
                            {service.description && <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>{service.description}</div>}
                            <div style={{ color: '#aaa', fontSize: 13 }}>{service.duree} min</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: NOIR }}>{service.prix} DA</div>
                            <Link href={`/booking?salon=${salonId}&service=${service.id}`} style={{ background: NOIR, color: '#fff', padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Choisir</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SECTION : REALISATIONS / BOOK PRO */}
            {safeGallery.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 16 }}>Realisations</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                  {safeGallery.map((img: any, i: number) => (
                    <Link key={img.id} href={`/salon/${salonId}?gallery=open`} scroll={false} style={{ display: 'block', borderRadius: 8, overflow: 'hidden', height: 160, border: '1px solid #E0D8CE' }}>
                      <img src={img.image_path} alt={`Realisation ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION : AVIS CLIENTS */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 16 }}>
                Avis clients {safeAvis.length > 0 && <span style={{ color: '#888', fontWeight: 400, fontSize: 14 }}>({safeAvis.length})</span>}
              </h2>
              {safeAvis.length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed #E0D8CE', borderRadius: 12, padding: 32, textAlign: 'center', color: '#888', fontSize: 14 }}>Aucun avis pour le moment.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {safeAvis.map((avis: any) => (
                    <div key={avis.id} style={{ background: '#fff', padding: 'clamp(16px, 3vw, 24px)', borderRadius: 12, border: '1px solid #E0D8CE' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: BG, color: NOIR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{avis.users?.prenom?.charAt(0) || 'C'}</div>
                          <div>
                            <div style={{ fontWeight: 700, color: NOIR, fontSize: 14 }}>{avis.users?.prenom} {avis.users?.nom?.charAt(0) || ''}.</div>
                            <div style={{ fontSize: 11, color: '#aaa' }}>Client verifie</div>
                          </div>
                        </div>
                        <div style={{ color: OR, fontSize: 14 }}>{'&#9733;'.repeat(avis.note)}{'&#9734;'.repeat(5 - avis.note)}</div>
                      </div>
                      {avis.commentaire && <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{avis.commentaire}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ══════ SIDEBAR DROITE ══════ */}
          <div className="salon-sidebar">

            {/* CARTE D'ACTIONS */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', padding: 24, marginBottom: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
              <Link href={`/booking?salon=${salonId}`} style={{ display: 'block', background: OR, color: '#fff', padding: '14px 0', borderRadius: 8, fontSize: 16, fontWeight: 800, textDecoration: 'none', textAlign: 'center', marginBottom: 12 }}>
                Prendre rendez-vous
              </Link>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:${salon.telephone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', border: '1px solid #E0D8CE', borderRadius: 8, color: NOIR, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  &#128222; Appeler
                </a>
                {salon.instagram && (
                  <a href={`https://instagram.com/${salon.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', border: '1px solid #E0D8CE', borderRadius: 8, color: NOIR, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    &#128247; Instagram
                  </a>
                )}
              </div>
            </div>

            {/* HORAIRES */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: NOIR, margin: '0 0 16px 0' }}>Horaires</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {JOURS.slice(1).map((jour, i) => {
                  const jourNum = i + 1
                  const isFerme = salon.jour_off === jourNum
                  return (
                    <div key={jour} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: isFerme ? '#d32f2f' : '#555' }}>
                      <span style={{ fontWeight: 600 }}>{jour}</span>
                      <span>{isFerme ? 'Ferme' : `${salon.ouverture?.substring(0, 5)} - ${salon.fermeture?.substring(0, 5)}`}</span>
                    </div>
                  )
                })}
              </div>
              {salon.pause_active && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#FFF8EE', borderRadius: 6, fontSize: 13, color: OR, fontWeight: 600 }}>
                  Pause : {salon.pause_debut?.substring(0, 5)} - {salon.pause_fin?.substring(0, 5)}
                </div>
              )}
            </div>

            {/* EMPLACEMENT + SE RENDRE AU SALON */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', overflow: 'hidden', marginBottom: 20 }}>
              {mapEmbedUrl && (
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: 180, position: 'relative' }}>
                  <iframe
                    src={mapEmbedUrl}
                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                    title="Emplacement du salon"
                  />
                  <div style={{ position: 'absolute', inset: 0 }} />
                </a>
              )}
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: NOIR, margin: '0 0 8px 0' }}>Emplacement</h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.5, margin: '0 0 12px 0' }}>&#128205; {salon.adresse}, {salon.ville}</p>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', background: NOIR, color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                  &#128663; Se rendre au salon
                </a>
              </div>
            </div>

            {/* TELEPHONE */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: NOIR, margin: '0 0 8px 0' }}>Contact</h3>
              <a href={`tel:${salon.telephone}`} style={{ color: OR, fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>{salon.telephone}</a>
              {salon.instagram && (
                <div style={{ marginTop: 10 }}>
                  <a href={`https://instagram.com/${salon.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    &#128247; @{salon.instagram.replace('@', '')}
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* BARRE STICKY MOBILE EN BAS */}
      <div className="hide-desktop" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E0D8CE', padding: '10px 16px', zIndex: 50, display: 'flex', gap: 8, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        <a href={`tel:${salon.telephone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', border: `1px solid ${OR}`, borderRadius: 8, color: OR, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          &#128222; Appeler
        </a>
        <Link href={`/booking?salon=${salonId}`} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', background: OR, borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
          Prendre RDV
        </Link>
      </div>

    </div>
  )
}
