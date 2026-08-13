import React from 'react'
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

export default async function SalonPage({ params }: { params: { id: string } }) {
  const salonId = params.id

  // Récupération des données du salon
  const { data: salon } = await supabase.from('salons').select('*').eq('id', salonId).single()
  if (!salon) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Salon introuvable</div>

  // Récupération des prestations, avis ET galerie
  const [servicesRes, avisRes, galleryRes] = await Promise.all([
    supabase.from('services').select('*').eq('salon_id', salonId).order('categorie_service'),
    supabase.from('avis').select('*').eq('salon_id', salonId),
    supabase.from('salon_images').select('*').eq('salon_id', salonId) // <-- NOUVEAU
  ])

  const safeServices = servicesRes.data || []
  const safeAvis = avisRes.data || []
  const safeGallery = galleryRes.data || [] // <-- NOUVEAU

  // Grouper les prestations par catégorie
  const grouped = safeServices.reduce((acc, s) => {
    const cat = s.categorie_service || 'Général'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {} as Record<string, typeof safeServices>)

  // Filtrer uniquement les prestations en promotion
  const promos = safeServices.filter(s => s.promo_active && s.promo_pourcentage)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 60 }}>
      
      {/* STYLE POUR CACHER LA SCROLLBAR DE LA GALERIE TOUT EN GARDANT LE SCROLL */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* HEADER DU SALON (Couverture Principale) */}
      <div style={{ background: NOIR, color: '#fff', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Image de couverture en fond flouté (Optionnel pour un effet Luxe) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, zIndex: 0 }}>
            <img src={salon.image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(10px)' }} />
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ color: OR, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {salon.type_salon}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{salon.nom}</h1>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', cursor: 'pointer' }}>♡</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, color: '#ccc', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📍 {salon.ville} - {salon.adresse}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📞 {salon.telephone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🕒 {salon.ouverture} - {salon.fermeture}</span>
            {salon.jour_off > 0 && <span style={{ color: '#d32f2f', fontWeight: 600 }}>Fermé le {['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][salon.jour_off]}</span>}
            <button style={{ background: OR, color: NOIR, border: 'none', padding: '6px 12px', borderRadius: 4, fontWeight: 800, fontSize: 12, marginLeft: 'auto', cursor: 'pointer' }}>🗺️ Y aller</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        
        {/* TABS (Navigation interne) */}
        <div style={{ display: 'flex', gap: 30, borderBottom: '1px solid #E0D8CE', margin: '30px 0' }}>
          <div style={{ paddingBottom: 12, borderBottom: `3px solid ${OR}`, fontWeight: 800, color: NOIR, cursor: 'pointer' }}>Prestations</div>
          <div style={{ paddingBottom: 12, color: '#888', fontWeight: 600, cursor: 'pointer' }}>Avis ({safeAvis.length})</div>
          <div style={{ paddingBottom: 12, color: '#888', fontWeight: 600, cursor: 'pointer' }}>Informations</div>
        </div>

        {/* DESCRIPTION */}
        <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>{salon.description}</p>

        {/* NOUVEAU : GALERIE PHOTOS */}
        {safeGallery.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Galerie Photos</h3>
            {/* Conteneur avec scroll horizontal */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, scrollBehavior: 'smooth' }}>
              {safeGallery.map((img) => (
                <div key={img.id} style={{ flexShrink: 0, width: 280, height: 200, borderRadius: 8, overflow: 'hidden', border: '1px solid #E0D8CE', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <img src={img.image_path} alt="Galerie salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION PROMOS */}
        {promos.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#d32f2f', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎉 OFFRES SPÉCIALES
            </h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {promos.map(promo => {
                const prixRemise = Math.round(promo.prix - (promo.prix * (promo.promo_pourcentage || 0) / 100))
                return (
                  <div key={promo.id} style={{ background: '#fff', border: '1px solid #ffcccb', borderRadius: 8, padding: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 15px rgba(211, 47, 47, 0.05)' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#d32f2f', color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 12px', borderBottomLeftRadius: 8 }}>
                      PROMO -{promo.promo_pourcentage}%
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, margin: '0 0 8px 0' }}>{promo.nom}</h3>
                        
                        <div style={{ color: OR, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                          ✨ {promo.promo_nom || 'Offre Spéciale'}
                        </div>
                        
                        <div style={{ color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          ⏱️ {promo.duree} min
                        </div>
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
                        <button style={{ background: OR, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                          Réserver l'offre
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* LISTE DES PRESTATIONS NORMALES */}
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>{cat}</h3>
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E0D8CE', overflow: 'hidden' }}>
              {items.map((service, index) => (
                <div key={service.id} style={{ padding: '20px', borderBottom: index < items.length - 1 ? '1px solid #F0EBE1' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: NOIR, marginBottom: 4 }}>{service.nom}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>{service.duree} min</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: OR }}>{service.prix} DA</div>
                    <button style={{ background: 'transparent', color: NOIR, border: '1px solid #ddd', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
