import React from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// DÉSACTIVER LE CACHE NEXT.JS POUR AFFICHER LES MODIFS EN TEMPS RÉEL
export const dynamic = 'force-dynamic'

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
  
  // Onglet actif (Prestations, Avis, Infos)
  const activeTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'prestations'
  
  // Gestion de l'ouverture de la galerie complète (Modal)
  const isGalleryOpen = searchParams.gallery === 'open'

  // Récupération des données du salon
  const { data: salon } = await supabase.from('salons').select('*').eq('id', salonId).single()
  if (!salon) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Salon introuvable</div>

  // Récupération des prestations, avis ET galerie
  const [servicesRes, avisRes, galleryRes] = await Promise.all([
    supabase.from('services').select('*').eq('salon_id', salonId).order('categorie_service'),
    supabase.from('avis').select('*, users(prenom, nom)').eq('salon_id', salonId),
    supabase.from('salon_images').select('*').eq('salon_id', salonId)
  ])

  const safeServices = servicesRes.data || []
  const safeAvis = avisRes.data || []
  const safeGallery = galleryRes.data || []

  // Consolidation de TOUTES les photos (Couverture + Galerie)
  const allImages = [salon.image, ...safeGallery.map((g: any) => g.image_path)].filter(Boolean)
  const displayImages = allImages.slice(0, 3) // Les 3 premières pour la mosaïque

  // Grouper les prestations par catégorie (Typage explicite pour éviter le crash Vercel)
  const grouped: Record<string, any[]> = safeServices.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.categorie_service || 'Général'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  // Filtrer uniquement les prestations en promotion
  const promos = safeServices.filter((s: any) => s.promo_active && s.promo_pourcentage)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>
      
      {/* ============================================================== */}
      {/* MODAL : GALERIE PLEIN ÉCRAN (Affiche TOUTES les photos) */}
      {/* ============================================================== */}
      {isGalleryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,10,10,0.95)', zIndex: 9999, overflowY: 'auto', padding: '60px 20px' }}>
          <Link href={`/salon/${salonId}?tab=${activeTab}`} style={{ position: 'fixed', top: 20, right: 30, color: '#fff', fontSize: 40, textDecoration: 'none', fontWeight: 300, zIndex: 10000 }}>
            &times;
          </Link>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {allImages.map((img, i) => (
              <img key={i} src={img} alt={`Galerie ${i + 1}`} style={{ width: '100%', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* HEADER GLOBAL (Le menu type Planity, fixe en haut) */}
      {/* ============================================================== */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E0D8CE', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>
          Bookme<span style={{ color: OR }}>.dz</span>
        </Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/pro/login" style={{ color: '#555', fontSize: 14, fontWeight: 600, textDecoration: 'none', background: '#f5f5f5', padding: '10px 16px', borderRadius: 6, display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
            Je suis un professionnel
          </Link>
          <Link href="/login" style={{ background: NOIR, color: '#fff', padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Mon compte
          </Link>
        </div>
      </header>

      {/* CONTENEUR PRINCIPAL */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* 1. EN-TÊTE DU SALON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: NOIR, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{salon.nom}</h1>
            <div style={{ color: '#555', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              📍 {salon.adresse}, {salon.ville}
            </div>
            <div style={{ color: '#555', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              ⭐ {safeAvis.length > 0 ? '4.8' : 'Nouveau'} ({safeAvis.length} avis) • 💸 {salon.type_salon}
            </div>
          </div>
          <a href="#prestations" style={{ background: NOIR, color: '#fff', padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
            Prendre RDV
          </a>
        </div>

        {/* 2. MOSAÏQUE DE PHOTOS (Style Planity) */}
        <div style={{ marginBottom: 40 }}>
          {/* Si 1 seule photo */}
          {displayImages.length === 1 && (
            <Link href={`/salon/${salonId}?tab=${activeTab}&gallery=open`} style={{ display: 'block', height: 450, borderRadius: 16, overflow: 'hidden' }}>
              <img src={displayImages[0]} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Link>
          )}
          
          {/* Si 2 photos */}
          {displayImages.length === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 450 }}>
              <Link href={`/salon/${salonId}?tab=${activeTab}&gallery=open`} style={{ borderRadius: 16, overflow: 'hidden' }}><img src={displayImages[0]} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></Link>
              <Link href={`/salon/${salonId}?tab=${activeTab}&gallery=open`} style={{ borderRadius: 16, overflow: 'hidden' }}><img src={displayImages[1]} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></Link>
            </div>
          )}

          {/* Si 3 photos ou plus */}
          {displayImages.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, height: 450 }}>
              <Link href={`/salon/${salonId}?tab=${activeTab}&gallery=open`} style={{ borderRadius: 16, overflow: 'hidden' }}>
                <img src={displayImages[0]} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
              </Link>
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12 }}>
                <Link href={`/salon/${salonId}?tab=${activeTab}&gallery=open`} style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <img src={displayImages[1]} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                </Link>
                <Link href={`/salon/${salonId}?tab=${activeTab}&gallery=open`} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                  <img src={displayImages[2]} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                  {/* Calque "+ X photos" s'il y a des photos cachées */}
                  {allImages.length > 3 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>
                      + {allImages.length - 3} photos
                    </div>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, color: NOIR, marginBottom: 8, marginTop: 40 }} id="prestations">
          Réserver en ligne chez {salon.nom}
        </div>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 30 }}>24h/24 - Paiement sur place - Confirmation immédiate</p>

        {/* 3. ONGLETS INTERACTIFS */}
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

        {/* ============================================================== */}
        {/* CONTENU DYNAMIQUE DES ONGLETS */}
        {/* ============================================================== */}

        {/* ONGLET 1 : PRESTATIONS */}
        {activeTab === 'prestations' && (
          <div>
            {/* PROMOS */}
            {promos.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#d32f2f', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎉 OFFRES SPÉCIALES
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
                            <div style={{ color: OR, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>✨ {promo.promo_nom || 'Offre Spéciale'}</div>
                            <div style={{ color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>⏱️ {promo.duree} min</div>
                            {promo.promo_debut && promo.promo_fin && (
                              <div style={{ background: '#FFF8F8', color: '#d32f2f', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4, display: 'inline-block', border: '1px solid #ffebee' }}>
                                ⏳ Du {new Date(promo.promo_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au {new Date(promo.promo_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div>
                              <div style={{ color: '#999', textDecoration: 'line-through', fontSize: 14 }}>{promo.prix} DA</div>
                              <div style={{ color: '#d32f2f', fontSize: 24, fontWeight: 900 }}>{prixRemise} DA</div>
                            </div>
                            <button style={{ background: OR, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Réserver</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* LISTE DES PRESTATIONS */}
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
                        <button style={{ background: NOIR, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>Choisir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET 2 : AVIS */}
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
                        <div style={{ fontSize: 12, color: '#888' }}>Client vérifié</div>
                      </div>
                    </div>
                    <div style={{ color: OR, fontSize: 16 }}>
                      {'★'.repeat(avis.note)}{'☆'.repeat(5 - avis.note)}
                    </div>
                  </div>
                  <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: 0 }}>"{avis.commentaire}"</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ONGLET 3 : INFORMATIONS */}
        {activeTab === 'infos' && (
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #E0D8CE', display: 'grid', gap: 30 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 12 }}>À propos du salon</h3>
              <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{salon.description}</p>
            </div>
            <div style={{ borderTop: '1px solid #E0D8CE', paddingTop: 30 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 16 }}>Horaires & Accès</h3>
              <div style={{ display: 'grid', gap: 12, color: '#555', fontSize: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>📍 <strong>Adresse :</strong> {salon.adresse}, {salon.ville}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>📞 <strong>Téléphone :</strong> {salon.telephone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>🕒 <strong>Ouverture :</strong> Ouvert de {salon.ouverture} à {salon.fermeture}</div>
                {salon.jour_off > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d32f2f', fontWeight: 700 }}>⚠️ <strong>Fermeture :</strong> Fermé le {['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][salon.jour_off]}</div>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
