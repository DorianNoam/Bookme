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
  
  // On lit l'onglet actif depuis l'URL (par défaut: prestations)
  const activeTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'prestations'

  // Récupération des données du salon
  const { data: salon } = await supabase.from('salons').select('*').eq('id', salonId).single()
  if (!salon) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Salon introuvable</div>

  // Récupération des prestations, avis (avec nom du client) ET galerie
  const [servicesRes, avisRes, galleryRes] = await Promise.all([
    supabase.from('services').select('*').eq('salon_id', salonId).order('categorie_service'),
    supabase.from('avis').select('*, users(prenom, nom)').eq('salon_id', salonId),
    supabase.from('salon_images').select('*').eq('salon_id', salonId)
  ])

  const safeServices = servicesRes.data || []
  const safeAvis = avisRes.data || []
  const safeGallery = galleryRes.data || []

  // Grouper les prestations par catégorie
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

      {/* CONTENEUR PRINCIPAL SÉCURISÉ */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '30px 20px' }}>
        
        {/* 1. BANNIÈRE */}
        <div style={{ width: '100%', height: 380, position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

        {/* 2. INFOS RAPIDES DU SALON */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 14, color: '#555', alignItems: 'center', marginBottom: 30 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: NOIR }}>📍 {salon.adresse}, {salon.ville}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>⭐ {safeAvis.length > 0 ? '4.8' : 'Nouveau'} ({safeAvis.length} avis)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🕒 {salon.ouverture} - {salon.fermeture}</span>
          {salon.jour_off > 0 && <span style={{ color: '#d32f2f', fontWeight: 700 }}>Fermé le {['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][salon.jour_off]}</span>}
        </div>

        {/* 3. GALERIE PHOTOS */}
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

        {/* 4. ONGLETS INTERACTIFS */}
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

        {/* ONGLET 1 : PRESTATIONS (Défaut) */}
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
