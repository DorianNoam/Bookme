'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

type Salon = { id: number; nom: string; adresse: string; ville: string; image: string; type_salon: string; telephone: string; description: string; ouverture: string; fermeture: string; jour_off: number; moy_note: string | null; nb_avis: number }
type Service = { id: number; nom: string; prix: number; duree: number; categorie_service: string }
type Employe = { id: number; nom: string }
type Avis = { id: number; note: number; commentaire: string; date_avis: string; users: { prenom: string; nom: string } }

const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function SalonPage() {
  const { id } = useParams()
  const router = useRouter()
  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [employes, setEmployes] = useState<Employe[]>([])
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'services' | 'avis' | 'infos'>('services')

  useEffect(() => {
    fetch('/api/salons/' + id)
      .then(r => r.json())
      .then(data => {
        setSalon(data.salon)
        setServices(data.services || [])
        setEmployes(data.employes || [])
        setAvis(data.avis || [])
        setLoading(false)
      })
  }, [id])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#999' }}>Chargement...</div>
  if (!salon) return <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Inter, sans-serif' }}><p>Salon introuvable.</p><Link href="/search" style={{ color: OR, fontWeight: 700 }}>Retour</Link></div>

  const categories = [...new Set(services.map(s => s.categorie_service))]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F0EAE0', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: NOIR, textDecoration: 'none' }}>Bookme<span style={{ color: OR }}>.dz</span></Link>
          <Link href="/search" style={{ color: '#777', fontSize: 14, textDecoration: 'none' }}>← Retour aux resultats</Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/login" style={{ color: '#555', fontSize: 14, textDecoration: 'none' }}>Connexion</Link>
            <Link href="/register" style={{ background: NOIR, color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Inscription</Link>
          </div>
        </div>
      </header>

      {/* HERO IMAGE */}
      <div style={{ position: 'relative', height: 380, overflow: 'hidden', background: NOIR }}>
        <img src={salon.image} alt={salon.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8), rgba(10,10,10,0.1))' }} />
        <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ width: 30, height: 2, background: OR, marginBottom: 14 }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{salon.type_salon}</div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: -0.5 }}>{salon.nom}</h1>
          <div style={{ fontSize: 14, color: '#ccc' }}>📍 {salon.adresse}{salon.ville ? ', ' + salon.ville : ''}</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 14, alignItems: 'center' }}>
            {salon.moy_note && <span style={{ color: OR, fontWeight: 700, fontSize: 14 }}>★ {salon.moy_note} <span style={{ color: '#aaa', fontWeight: 400 }}>({salon.nb_avis} avis)</span></span>}
            {salon.telephone && <span style={{ color: '#aaa', fontSize: 13 }}>📞 {salon.telephone}</span>}
            <span style={{ color: '#aaa', fontSize: 13 }}>🕐 {salon.ouverture?.slice(0,5)} - {salon.fermeture?.slice(0,5)}</span>
            {salon.jour_off > 0 && <span style={{ color: '#aaa', fontSize: 13 }}>Ferme le {JOURS[salon.jour_off]}</span>}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        {/* ONGLETS */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #EDE5D8', background: '#fff', marginTop: -1 }}>
          {(['services', 'avis', 'infos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '16px 28px', fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? NOIR : '#888', background: 'transparent', border: 'none', borderBottom: tab === t ? '2px solid ' + OR : '2px solid transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>
              {t === 'services' ? 'Prestations' : t === 'avis' ? 'Avis (' + avis.length + ')' : 'Informations'}
            </button>
          ))}
        </div>

        {/* TAB SERVICES */}
        {tab === 'services' && (
          <div style={{ padding: '30px 0' }}>
            {salon.description && <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 30, maxWidth: 700 }}>{salon.description}</p>}
            {categories.map(cat => (
              <div key={cat} style={{ marginBottom: 30 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>{cat}</div>
                {services.filter(s => s.categorie_service === cat).map(s => (
                  <div key={s.id} style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '16px 20px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: NOIR, marginBottom: 3 }}>{s.nom}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{s.duree} min</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: NOIR }}>{s.prix > 0 ? s.prix.toLocaleString() + ' DA' : 'Sur devis'}</span>
                      <button onClick={() => router.push('/booking?salon=' + salon.id + '&service=' + s.id)} style={{ background: NOIR, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 3, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}>Reserver</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* TAB AVIS */}
        {tab === 'avis' && (
          <div style={{ padding: '30px 0' }}>
            {avis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Aucun avis pour le moment.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {avis.map(a => (
                  <div key={a.id} style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: NOIR, fontSize: 14 }}>{a.users?.prenom} {a.users?.nom}</span>
                        <span style={{ color: OR, fontWeight: 700, marginLeft: 12, fontSize: 13 }}>★ {a.note}/5</span>
                      </div>
                      <span style={{ color: '#bbb', fontSize: 12 }}>{new Date(a.date_avis).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {a.commentaire && <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{a.commentaire}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB INFOS */}
        {tab === 'infos' && (
          <div style={{ padding: '30px 0' }}>
            <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 4, padding: '24px 28px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Informations pratiques</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0EAE0', paddingBottom: 14 }}>
                  <span style={{ color: '#888', fontSize: 14 }}>Adresse</span>
                  <span style={{ fontWeight: 600, color: NOIR, fontSize: 14 }}>{salon.adresse}{salon.ville ? ', ' + salon.ville : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0EAE0', paddingBottom: 14 }}>
                  <span style={{ color: '#888', fontSize: 14 }}>Telephone</span>
                  <span style={{ fontWeight: 600, color: NOIR, fontSize: 14 }}>{salon.telephone || 'Non renseigne'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0EAE0', paddingBottom: 14 }}>
                  <span style={{ color: '#888', fontSize: 14 }}>Horaires</span>
                  <span style={{ fontWeight: 600, color: NOIR, fontSize: 14 }}>{salon.ouverture?.slice(0,5)} - {salon.fermeture?.slice(0,5)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0EAE0', paddingBottom: 14 }}>
                  <span style={{ color: '#888', fontSize: 14 }}>Jour de fermeture</span>
                  <span style={{ fontWeight: 600, color: NOIR, fontSize: 14 }}>{salon.jour_off > 0 ? JOURS[salon.jour_off] : 'Ouvert tous les jours'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888', fontSize: 14 }}>Equipe</span>
                  <span style={{ fontWeight: 600, color: NOIR, fontSize: 14 }}>{employes.map(e => e.nom).join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: NOIR, padding: '28px 0', textAlign: 'center', color: '#444', fontSize: 13, marginTop: 40 }}>
        Bookme.dz — La beaute a portee de clic en Algerie
      </footer>
    </div>
  )
}
