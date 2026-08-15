import FavoriteButton from '@/components/FavoriteButton'
import MobileMenu from '@/components/MobileMenu'
import React from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default async function SalonPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const salonId = params.id
  const activeTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'prestations'
  const isGalleryOpen = searchParams.gallery === 'open'

  const { data: salon } = await supabase.from('salons').select('*').eq('id', salonId).single()
  if (!salon) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Salon introuvable</div>

  const [servicesRes, avisRes, galleryRes] = await Promise.all([
    supabase.from('services').select('*').eq('salon_id', salonId).order('categorie_service'),
    supabase.from('avis').select('*, users(prenom, nom)').eq('salon_id', salonId),
    supabase.from('salon_images').select('*').eq('salon_id', salonId)
  ])

  const safeServices = servicesRes.data || []
  const safeAvis = avisRes.data || []
  const safeGallery = galleryRes.data || []
  const allImages = [salon.image, ...safeGallery.map((g: any) => g.image_path)].filter(Boolean)

  const grouped: Record<string, any[]> = safeServices.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.categorie_service || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  const promos = safeServices.filter((s: any) => s.promo_active && s.promo_pourcentage)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>
      
      {isGalleryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,10,10,0.98)', zIndex: 9999, overflowY: 'auto', padding: '60px 20px' }}>
          <Link href={`/salon/${salonId}?tab=${activeTab}`} scroll={false} style={{ position: 'fixed', top: 20, right: 30, color: '#fff', fontSize: 40, textDecoration: 'none', fontWeight: 300, zIndex: 10000, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            &times;
          </Link>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 30 }}>Toutes les photos ({allImages.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {allImages.map((img: string, i: number) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', height: 250, border: '1px solid #333' }}>
                  <img src={img} alt={`Galerie ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroll {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #E0D8CE transparent;
        }
        .custom-scroll::-webkit-scrollbar { height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #E0D8CE; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #B8922A; }
      `}} />

      <header style={{ background: '#fff', borderBottom: '1px solid #E0D8CE', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, gap: 12 }}>
        <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: NOIR, textDecoration: 'none', flexShrink: 0 }}>
          Bookme<span style={{ color: OR }}>.dz</span>
        </Link>
        
        <Link href="/" className="hide-mobile" style={{ color: '#888', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
          &larr; Retour aux salons
        </Link>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Link href="/login" style={{ background: NOIR, color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Mon espace
          </Link>
          <Link href="/pro/login" style={{ background: '#fff', color: NOIR, padding: '8px 20px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: `1.5px solid ${OR}` }}>
            Espace Pro
          </Link>
        </div>

        <div className="hide-desktop" style={{ marginLeft: 'auto' }}>
          <MobileMenu />
        </div>
      </header>

      <div style={{ width: '100%', height: 380, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)', padding: '60px 30px 24px 30px' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div style={{ color: OR, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {salon.type_salon}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{salon.nom}</h1>
             <FavoriteButton salonId={salonId} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '30px 20px' }}>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 14, color: '#555', alignItems: 'center', marginBottom: 30 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: NOIR }}>{'\uD83D\uDCCD'} {salon.adresse}, {salon.ville}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{'\u2B50'} {safeAvis.length > 0 ? '4.8' : 'Nouveau'} ({safeAvis.length} avis)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{'\uD83D\uDD52'} {salon.ouverture} - {salon.fermeture}</span>
          {salon.jour_off > 0 && <span style={{ color: '#d32f2f', fontWeight: 700 }}>Ferme le {['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][salon.jour_off]}</span>}
        </div>

        {safeGallery.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="custom-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, scrollBehavior: 'smooth' }}>
              {safeGallery.map((img: any) => (
                <Link key={img.id} href={`/salon/${salonId}?tab=${activeTab}&gallery=open`} scroll={false} style={{ flexShrink: 0, width: 280, height: 200, borderRadius: 12, overflow: 'hidden', border: '1px solid #E0D8CE', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'block' }}>
                  <img src={img.image_path} alt="Galerie salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 30, borderBottom: '1px solid #E0D8CE', marginBottom: 30 }}>
          <Link href={`/salon/${salonId}?tab=prestations`} scroll={false} style={{ paddingBottom: 12, borderBottom: activeTab === 'prestations' ? `3px solid ${OR}` : 'none', fontWeight: activeTab === 'prestations' ? 800 : 600, color: activeTab === 'prestations' ? NOIR : '#888', textDecoration: 'none' }}>
            Prestations
          </Link>
          <Link href={`/salon/${salonId}?tab=avis`} scroll={false} style={{ paddingBottom: 12, borderBottom: activeTab === 'avis' ? `3px solid ${OR}` : 'none', fontWeight: activeTab === 'avis' ? 800 : 600, color: activeTab === 'avis' ? NOIR : '#888', textDecoration: 'none' }}>
            Avis ({safeAvis.length})
          </Link>
          <Link href={`/salon/${salonId}?tab=infos`} scroll={false} style={{ paddingBottom: 12, borderBottom: activeTab === 'infos' ? `3px solid ${OR}` : 'none', fontWeight: activeTab === 'infos' ? 800 : 600, color: activeTab === 'infos' ? NOIR : '#888', textDecoration: 'none' }}>
            Informations
          </Link>
        </div>

        {activeTab === 'prestations' && (
          <div>
            {promos.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#d32f2f', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {'\uD83C\uDF89'} OFFRES SPECIALES
                </h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  {promos.map((promo: any) => {
                    const prixRemise = Math.round(promo.prix - (promo.prix * (promo.promo_pourcentage || 0) / 100))
                    return (
                      <div key={promo.id} style={{ background: '#fff', border: '1px solid #ffcccb', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 15px rgba(211, 47, 47, 0.05)' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, background: '#d32f2f', color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 12px', borderBottomLeftRadius: 8 }}>
                          PROMO -{promo.promo_pourcentage}%
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                          <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, margin: '0 0 8px 0' }}>{promo.nom}</h3>
                            <div style={{ color: OR, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{'\u2728'} {promo.promo_nom || 'Offre Speciale'}</div>
                            <div style={{ color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>{'\u23F1\uFE0F'} {promo.duree} min</div>
                            {promo.promo_debut && promo.promo_fin && (
                              <div style={{ background: '#FFF8F8', color: '#d32f2f', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4, display: 'inline-block', border: '1px solid #ffebee' }}>
                                {'\u23F3'} Du {new Date(promo.promo_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au {new Date(promo.promo_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div>
                              <div style={{ color: '#999', textDecoration: 'line-through', fontSize: 14 }}>{promo.prix} DA</div>
                              <div style={{ color: '#d32f2f', fontSize: 24, fontWeight: 900 }}>{prixRemise} DA</div>
                            </div>
                            <Link href={`/booking?salon=${salonId}&service=${promo.id}`} style={{ background: OR, color: '#fff', padding: '12px 24px', borderRadius: 6, fontSize: 14, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>Reserver</Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>{cat}</h3>
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  {items.map((service: any, index: number) => (
                    <div key={service.id} style={{ padding: '24px 20px', borderBottom: index < items.length - 1 ? '1px solid #F0EBE1' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: NOIR, marginBottom: 6 }}>{service.nom}</div>
                        <div style={{ color: '#888', fontSize: 13, fontWeight: 500 }}>{service.duree} min</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: NOIR }}>{service.prix} DA</div>
                        <Link href={`/booking?salon=${salonId}&service=${service.id}`} style={{ background: NOIR, color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Choisir</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'avis' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {safeAvis.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#888', background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE' }}>
                Aucun avis pour le moment.
              </div>
            ) : (
              safeAvis.map((avis: any) => (
                <div key={avis.id} style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E0D8CE', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: BG, color: NOIR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                        {avis.users?.prenom?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: NOIR }}>{avis.users?.prenom} {avis.users?.nom?.charAt(0) || ''}.</div>
                        <div style={{ fontSize: 12, color: '#888' }}>Client verifie</div>
                      </div>
                    </div>
                    <div style={{ color: OR, fontSize: 16 }}>
                      {'\u2605'.repeat(avis.note)}{'\u2606'.repeat(5 - avis.note)}
                    </div>
                  </div>
                  <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: 0 }}>&quot;{avis.commentaire}&quot;</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'infos' && (
          <div style={{ background: '#fff', padding: 'clamp(20px, 4vw, 32px)', borderRadius: 12, border: '1px solid #E0D8CE', display: 'grid', gap: 30 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 12 }}>A propos du salon</h3>
              <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{salon.description}</p>
            </div>
            <div style={{ borderTop: '1px solid #E0D8CE', paddingTop: 30 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Horaires &amp; Acces</h3>
              <div style={{ display: 'grid', gap: 16 }}>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{'\uD83D\uDCCD'}</span>
                  <div style={{ color: '#555', fontSize: 15, lineHeight: 1.5, paddingTop: 6 }}>
                    <strong style={{ color: NOIR }}>Adresse</strong><br/>
                    {salon.adresse}, {salon.ville}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{'\uD83D\uDCDE'}</span>
                  <div style={{ color: '#555', fontSize: 15, lineHeight: 1.5, paddingTop: 6 }}>
                    <strong style={{ color: NOIR }}>Telephone</strong><br/>
                    {salon.telephone}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{'\uD83D\uDD52'}</span>
                  <div style={{ color: '#555', fontSize: 15, lineHeight: 1.5, paddingTop: 6 }}>
                    <strong style={{ color: NOIR }}>Horaires</strong><br/>
                    {salon.ouverture} - {salon.fermeture}
                  </div>
                </div>

                {salon.jour_off > 0 && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{'\u26A0\uFE0F'}</span>
                    <div style={{ color: '#d32f2f', fontSize: 15, lineHeight: 1.5, fontWeight: 700, paddingTop: 6 }}>
                      <strong>Fermeture</strong><br/>
                      Ferme le {['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][salon.jour_off]}
                    </div>
                  </div>
                )}

                {salon.instagram && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{'\uD83D\uDCF8'}</span>
                    <div style={{ color: '#555', fontSize: 15, lineHeight: 1.5, paddingTop: 6 }}>
                      <strong style={{ color: NOIR }}>Instagram</strong><br/>
                      <a href={`https://instagram.com/${salon.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: OR, fontWeight: 600, textDecoration: 'none' }}>
                        {salon.instagram}
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
