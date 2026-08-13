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
    supabase.from('salon_images').select('*').eq('salon_id', salonId)
  ])

  const safeServices = servicesRes.data || []
  const safeAvis = avisRes.data || []
  const safeGallery = galleryRes.data || []

  // Grouper les prestations par catégorie (avec typage explicite pour Vercel)
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
      
      {/* STYLE POUR LA BARRE DE DÉFILEMENT DE LA GALERIE */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroll {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #E0D8CE transparent;
        }
        .custom-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #E0D8CE;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: ${OR};
        }
      `}} />

      {/* CONTENEUR PRINCIPAL SÉCURISÉ (Empêche de recouvrir le menu du haut) */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '30px 20px' }}>
        
        {/* 1. BANNIÈRE SÉCURISÉE (Bords arrondis, intégrée au flux) */}
        <div style={{ width: '100%', height: 380, position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          
          {/* Dégradé sombre pour lire le texte facilement */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)', padding: '60px 30px 24px 30px' }}>
            <div style={{ color: OR, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {salon.type_salon}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{salon.nom}</h1>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}>♡</div>
            </div>
          </div>
        </div>

        {/* 2. ONGLETS (Remontés juste sous la bannière) */}
        <div style={{ display: 'flex', gap: 30, borderBottom: '1px solid #E0D8CE', marginBottom: 30 }}>
          <div style={{ paddingBottom: 12, borderBottom: `3px solid ${OR}`, fontWeight: 800, color: NOIR, cursor: 'pointer' }}>Prestations</div>
          <div style={{ paddingBottom: 12, color: '#888', fontWeight: 600, cursor: 'pointer' }}>Avis ({safeAvis.length})</div>
          <div style={{ paddingBottom: 12, color: '#888', fontWeight: 600, cursor: 'pointer' }}>Informations</div>
        </div>

        {/* 3. INFOS RAPIDES DU SALON */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 14, color: '#555', alignItems: 'center', marginBottom: 30 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: NOIR }}>📍 {salon.adresse}, {salon.ville}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>⭐ {safeAvis.length > 0 ? '4.8' : 'Nouveau'} ({safeAvis.length} avis)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🕒 {salon.ouverture} - {salon.fermeture}</span>
          {salon.jour_off > 0 && <span style={{ color: '#d32f2f', fontWeight: 700 }}>Fermé le {['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][salon.jour_off]}</span>}
        </div>

        {/* 4. GALERIE PHOTOS (Immédiatement visible sous les infos) */}
        {safeGallery.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="custom-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, scrollBehavior: 'smooth' }}>
              {safeGallery.map((img: any) => (
                <div key={img.id} style={{ flexShrink: 0, width: 280, height: 200, borderRadius: 12, overflow: 'hidden', border: '1px solid #E0D8CE', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <img src={img.image_path} alt="Galerie salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DESCRIPTION */}
        <div style={{ marginBottom: 40, background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E0D8CE' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginBottom: 12 }}>À propos</h3>
          <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{salon.description}</p>
        </div>

        {/* 6. SECTION PROMOS */}
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

        {/* 7. LISTE DES PRESTATIONS NORMALES */}
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
                    <button style={{ background: NOIR, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
                      Choisir
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
