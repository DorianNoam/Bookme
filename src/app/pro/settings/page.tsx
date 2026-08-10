'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import LogoutButton from '@/app/pro/components/LogoutButton'
import { createClient } from '@supabase/supabase-js'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DEFAULT_IMAGES: Record<string, string> = {
  'Coiffure': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
  'Barbier': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  'Beaute des ongles': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
  'Massage et bien-etre': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  'Hammam & Spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800',
  'Chirurgie esthetique': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
  'Institut': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
}

const JOURS_SEMAINE = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const TYPES_SALON = ['Coiffure', 'Barbier', 'Beaute des ongles', 'Massage et bien-etre', 'Hammam & Spa', 'Chirurgie esthetique', 'Institut']

type Service = { id: number; nom: string; prix: number; duree: number; categorie_service: string; promo_pourcentage: number | null; promo_active: boolean; promo_debut: string | null; promo_fin: string | null }
type Employe = { id: number; nom: string }
type VentePrivee = { id: number; nom: string; prix: number; duree: number; description: string }
type Salon = {
  id: number; nom: string; adresse: string; ville: string; telephone: string;
  description: string; ouverture: string; fermeture: string; jour_off: number;
  type_salon: string; image: string; seuil_fidelite: number;
}
type CatalogueItem = { id: number; categorie: string; nom: string }

export default function ProSettingsPage() {
  const [tab, setTab] = useState<'services' | 'vip' | 'employes' | 'salon'>('services')
  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [ventesPrivees, setVentesPrivees] = useState<VentePrivee[]>([])
  const [employes, setEmployes] = useState<Employe[]>([])
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Charger les donnees
  useEffect(() => {
    fetch('/api/pro/settings')
      .then(r => r.json())
      .then(data => {
        setSalon(data.salon)
        setServices(data.services || [])
        setVentesPrivees(data.ventes_privees || [])
        setEmployes(data.employes || [])
        setCatalogue(data.catalogue || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function showMessage(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: 16 }}>Chargement...</p>
      </div>
    )
  }

  const tabs = [
    { key: 'services' as const, label: 'Prestations', count: services.length },
    { key: 'vip' as const, label: 'Ventes Privées', count: ventesPrivees.length },
    { key: 'employes' as const, label: 'Equipe', count: employes.length },
    { key: 'salon' as const, label: 'Mon salon', count: null },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>

      {/* STYLE GLOBAL RESPONSIVE POUR LES LISTES (Prestations, VIP, Employés) */}
      <style dangerouslySetInnerHTML={{__html: `
        .responsive-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .responsive-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .responsive-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        /* Mobile Breakpoint */
        @media (max-width: 768px) {
          .responsive-row {
            flex-direction: column;
            align-items: stretch !important;
            gap: 12px;
          }
          .responsive-info {
            width: 100%;
            justify-content: space-between;
            align-items: flex-start;
          }
          .responsive-actions {
            width: 100%;
            justify-content: flex-end;
            border-top: 1px dashed #eee;
            padding-top: 12px;
            flex-wrap: wrap;
          }
          .responsive-edit-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-edit-actions {
            justify-content: flex-start !important;
          }
        }
      `}} />

      {/* HEADER RESPONSIVE MOBILE */}
      <header style={{ background: NOIR, color: '#fff', padding: '12px 16px' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .pro-header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
          }
          .pro-header-nav {
            display: flex;
            gap: 20px;
            align-items: center;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          @media (max-width: 768px) {
            .pro-header-container {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
            .pro-header-nav {
              width: 100%;
              overflow-x: auto;
              padding-bottom: 4px;
              gap: 24px;
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .pro-header-nav::-webkit-scrollbar {
              display: none;
            }
          }
        `}} />
        
        <div className="pro-header-container">
          <div style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900, flexShrink: 0 }}>
            Bookme<span style={{ color: OR }}>.dz</span>
            <span style={{ fontWeight: 400, fontSize: 'clamp(11px, 2vw, 14px)', color: '#888', marginLeft: 6 }}>Pro</span>
          </div>
          <nav className="pro-header-nav">
            <Link href="/pro/dashboard" style={{ color: '#aaa', fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Dashboard
            </Link>
            <Link href="/pro/agenda" style={{ color: '#aaa', fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Agenda
            </Link>
            <Link href="/pro/settings" style={{ color: OR, fontSize: 'clamp(12px, 2vw, 14px)', textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Parametres
            </Link>
            <div style={{ whiteSpace: 'nowrap' }}>
              <LogoutButton />
            </div>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>

        {/* Message de confirmation */}
        {message && (
          <div style={{
            background: '#d4edda', color: '#155724', padding: '12px 20px', borderRadius: 6,
            marginBottom: 20, fontSize: 14, fontWeight: 600, border: '1px solid #c3e6cb'
          }}>
            {message}
          </div>
        )}

        {/* ONGLETS */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 0, marginBottom: 30, overflowX: 'auto' }}>
          {tabs.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: tab === t.key ? 800 : 600,
                color: tab === t.key ? '#fff' : NOIR,
                background: tab === t.key ? (t.key === 'vip' ? OR : NOIR) : '#fff',
                border: `1px solid ${tab === t.key ? (t.key === 'vip' ? OR : NOIR) : '#ddd'}`,
                cursor: 'pointer',
                borderRadius: i === 0 ? '6px 0 0 6px' : i === tabs.length - 1 ? '0 6px 6px 0' : '0',
                marginLeft: i === 0 ? 0 : -1,
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label} {t.count !== null && <span style={{ color: tab === t.key ? (t.key === 'vip' ? '#fff' : OR) : '#999', marginLeft: 6 }}>({t.count})</span>}
            </button>
          ))}
        </div>

        {/* ════════ TAB SERVICES ════════ */}
        {tab === 'services' && (
          <ServicesTab
            services={services}
            catalogue={catalogue}
            onAdd={(s) => { setServices([...services, s]); showMessage('Prestation ajoutee') }}
            onUpdate={(s) => { setServices(services.map(x => x.id === s.id ? s : x)); showMessage('Prestation mise a jour') }}
            onDelete={(id) => { setServices(services.filter(s => s.id !== id)); showMessage('Prestation supprimee') }}
          />
        )}

        {/* ════════ TAB VENTES PRIVEES ════════ */}
        {tab === 'vip' && (
          <VentesPriveesTab
            ventesPrivees={ventesPrivees}
            onAdd={(v) => { setVentesPrivees([v, ...ventesPrivees]); showMessage('Offre VIP ajoutee') }}
            onUpdate={(v) => { setVentesPrivees(ventesPrivees.map(x => x.id === v.id ? v : x)); showMessage('Offre VIP mise a jour') }}
            onDelete={(id) => { setVentesPrivees(ventesPrivees.filter(v => v.id !== id)); showMessage('Offre VIP supprimee') }}
          />
        )}

        {/* ════════ TAB EMPLOYES ════════ */}
        {tab === 'employes' && (
          <EmployesTab
            employes={employes}
            onAdd={(e) => { setEmployes([...employes, e]); showMessage('Employe ajoute') }}
            onDelete={(id) => { setEmployes(employes.filter(e => e.id !== id)); showMessage('Employe supprime') }}
          />
        )}

        {/* ════════ TAB SALON ════════ */}
        {tab === 'salon' && salon && (
          <SalonTab salon={salon} onUpdate={(s) => { setSalon(s); showMessage('Salon mis a jour') }} />
        )}

      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Gestion des Ventes Privées
// ═══════════════════════════════════════════════════════════════════

function VentesPriveesTab({
  ventesPrivees, onAdd, onUpdate, onDelete
}: {
  ventesPrivees: VentePrivee[];
  onAdd: (v: VentePrivee) => void; onUpdate: (v: VentePrivee) => void; onDelete: (id: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [prix, setPrix] = useState('')
  const [duree, setDuree] = useState('30')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNom, setEditNom] = useState('')
  const [editPrix, setEditPrix] = useState('')
  const [editDuree, setEditDuree] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  function startEdit(v: VentePrivee) {
    setEditingId(v.id)
    setEditNom(v.nom)
    setEditPrix(String(v.prix))
    setEditDuree(String(v.duree))
    setEditDescription(v.description || '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleAdd() {
    if (!nom || !prix || !duree) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_vente_privee', nom, prix, duree, description }),
      })
      const data = await res.json()
      if (data.success) {
        onAdd(data.vente_privee)
        setNom(''); setPrix(''); setDuree('30'); setDescription('')
        setShowForm(false)
      }
    } catch (e) {}
    setSubmitting(false)
  }

  async function handleSaveEdit(v: VentePrivee) {
    if (!editNom || !editPrix || !editDuree) return
    setSavingEdit(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_vente_privee', id: v.id, nom: editNom, prix: editPrix, duree: editDuree, description: editDescription }),
      })
      const data = await res.json()
      if (data.success) {
        onUpdate(data.vente_privee)
        setEditingId(null)
      }
    } catch (e) {}
    setSavingEdit(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette offre VIP ?')) return
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_vente_privee', id }),
      })
      const data = await res.json()
      if (data.success) onDelete(id)
    } catch (e) {}
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, margin: 0 }}>Ventes Privées</h3>
          <p style={{ fontSize: 13, color: '#888', margin: '5px 0 0 0' }}>Offres exclusives réservées à vos clients fidèles.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? '#eee' : OR, color: showForm ? NOIR : '#fff',
            border: 'none', padding: '10px 20px', borderRadius: 6, fontSize: 14,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          {showForm ? 'Annuler' : '+ Créer VIP'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', padding: 25, borderRadius: 8, marginBottom: 25, border: `2px solid ${OR}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div className="responsive-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nom de l'offre VIP</label>
              <input type="text" placeholder="Ex: Soin Kératine VIP (Offre Fidélité)" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Prix spécial (DA)</label>
              <input type="number" placeholder="1500" value={prix} onChange={(e) => setPrix(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Durée (min)</label>
              <select value={duree} onChange={(e) => setDuree(e.target.value)} style={inputStyle}>
                <option value="15">15 min</option><option value="30">30 min</option>
                <option value="45">45 min</option><option value="60">1h</option>
                <option value="90">1h30</option><option value="120">2h</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description courte</label>
              <textarea placeholder="Décrivez les avantages de cette offre exclusive..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} rows={2} />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={submitting || !nom || !prix}
            style={{
              background: OR, color: '#fff', border: 'none', padding: '12px 30px',
              borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', opacity: submitting || !nom || !prix ? 0.5 : 1,
              width: '100%'
            }}
          >
            {submitting ? 'Création...' : 'Créer l\'offre VIP'}
          </button>
        </div>
      )}

      {ventesPrivees.length === 0 ? (
        <div style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center', color: '#888' }}>
          Aucune offre VIP configurée. Récompensez vos meilleurs clients !
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          {ventesPrivees.map((v, i) => (
            <div key={v.id} style={{ padding: '16px 20px', borderBottom: i < ventesPrivees.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              {editingId === v.id ? (
                <div className="responsive-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: '1 / -1' }}><input type="text" value={editNom} onChange={e => setEditNom(e.target.value)} style={inputStyle} /></div>
                  <div><input type="number" value={editPrix} onChange={e => setEditPrix(e.target.value)} style={inputStyle} /></div>
                  <div>
                    <select value={editDuree} onChange={e => setEditDuree(e.target.value)} style={inputStyle}>
                      <option value="15">15 min</option><option value="30">30 min</option>
                      <option value="45">45 min</option><option value="60">1h</option>
                      <option value="90">1h30</option><option value="120">2h</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} style={inputStyle} rows={2} /></div>
                  <div className="responsive-edit-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                    <button onClick={() => handleSaveEdit(v)} disabled={savingEdit} style={{ background: OR, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', flex: 1 }}>{savingEdit ? '...' : 'OK'}</button>
                    <button onClick={cancelEdit} style={{ background: '#eee', border: 'none', padding: '8px 14px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', flex: 1 }}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="responsive-row" style={{ alignItems: 'flex-start' }}>
                  <div className="responsive-info">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: OR, fontSize: 15 }}>{v.nom}</span>
                        <span style={{ background: NOIR, color: OR, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>VIP</span>
                      </div>
                      <p style={{ color: '#666', fontSize: 13, margin: '0 0 8px 0', maxWidth: 500 }}>{v.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: NOIR, fontSize: 15, whiteSpace: 'nowrap' }}>{v.prix} DA</div>
                      <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{v.duree} min</div>
                    </div>
                  </div>
                  <div className="responsive-actions">
                    <button onClick={() => startEdit(v)} style={{ background: 'transparent', border: '1px solid #ddd', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', color: '#444' }}>Modifier</button>
                    <button onClick={() => handleDelete(v.id)} style={{ background: 'transparent', border: '1px solid #fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Supprimer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Gestion des services
// ═══════════════════════════════════════════════════════════════════

function ServicesTab({
  services, catalogue, onAdd, onUpdate, onDelete
}: {
  services: Service[]; catalogue: CatalogueItem[];
  onAdd: (s: Service) => void; onUpdate: (s: Service) => void; onDelete: (id: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [prix, setPrix] = useState('')
  const [duree, setDuree] = useState('30')
  const [categorie, setCategorie] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrix, setEditPrix] = useState('')
  const [editDuree, setEditDuree] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Promo state
  const [promoId, setPromoId] = useState<number | null>(null)
  const [promoPct, setPromoPct] = useState('')
  const [savingPromo, setSavingPromo] = useState(false)
  const [promoDebut, setPromoDebut] = useState('')
  const [promoFin, setPromoFin] = useState('')

  // Grouper les services par categorie
  const grouped = services.reduce((acc, s) => {
    const cat = s.categorie_service || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {} as Record<string, Service[]>)

  // Grouper le catalogue par categorie pour le select
  const catalogueGrouped = catalogue.reduce((acc, c) => {
    if (!acc[c.categorie]) acc[c.categorie] = []
    acc[c.categorie].push(c)
    return acc
  }, {} as Record<string, CatalogueItem[]>)

  function startEdit(s: Service) {
    setEditingId(s.id)
    setEditPrix(String(s.prix))
    setEditDuree(String(s.duree))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditPrix('')
    setEditDuree('')
  }

  async function handlePromoSave(s: Service) {
    const pct = parseInt(promoPct)
    if (isNaN(pct) || pct < 1 || pct > 99) return
    setSavingPromo(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ action: 'set_promo', id: s.id, promo_pourcentage: pct, promo_active: true, promo_debut: promoDebut || null, promo_fin: promoFin || null }),
      })
      const data = await res.json()
      if (data.success) {
      onUpdate({ ...s, promo_pourcentage: pct, promo_active: true, promo_debut: promoDebut || null, promo_fin: promoFin || null })
        setPromoId(null)
      }
    } catch (e) {}
    setSavingPromo(false)
  }

  async function handlePromoRemove(s: Service) {
    setSavingPromo(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_promo', id: s.id, promo_pourcentage: null, promo_active: false }),
      })
      const data = await res.json()
      if (data.success) {
        onUpdate({ ...s, promo_pourcentage: null, promo_active: false })
        setPromoId(null)
      }
    } catch (e) {}
    setSavingPromo(false)
  }

  async function handleSaveEdit(s: Service) {
    if (!editPrix || !editDuree) return
    setSavingEdit(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_service', id: s.id, prix: editPrix, duree: editDuree, categorie_service: s.categorie_service }),
      })
      const data = await res.json()
      if (data.success) {
        onUpdate(data.service)
        setEditingId(null)
      }
    } catch (e) {}
    setSavingEdit(false)
  }

  async function handleAdd() {
    if (!nom || !prix || !duree) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_service', nom, prix, duree, categorie_service: categorie || 'General' }),
      })
      const data = await res.json()
      if (data.success) {
        onAdd(data.service)
        setNom(''); setPrix(''); setDuree('30'); setCategorie('')
        setShowForm(false)
      }
    } catch (e) {}
    setSubmitting(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette prestation ?')) return
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_service', id }),
      })
      const data = await res.json()
      if (data.success) onDelete(id)
    } catch (e) {}
  }

  return (
    <div>
      {/* Bouton Ajouter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, margin: 0 }}>Vos prestations</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? '#eee' : OR, color: showForm ? NOIR : '#fff',
            border: 'none', padding: '10px 20px', borderRadius: 6, fontSize: 14,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          {showForm ? 'Annuler' : '+ Ajouter'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div style={{ background: '#fff', padding: 25, borderRadius: 8, marginBottom: 25, border: `2px solid ${OR}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div className="responsive-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
            {/* Nom — soit catalogue soit custom */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nom de la prestation</label>
              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                <select
                  value=""
                  onChange={(e) => {
                    const item = catalogue.find(c => c.nom === e.target.value)
                    if (item) { setNom(item.nom); setCategorie(item.categorie) }
                  }}
                  style={inputStyle}
                >
                  <option value="">Choisir du catalogue...</option>
                  {Object.entries(catalogueGrouped).map(([cat, items]) => (
                    <optgroup key={cat} label={cat}>
                      {items.map(item => (
                        <option key={item.id} value={item.nom}>{item.nom}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ou tapez un nom personnalise"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Prix (DA)</label>
              <input type="number" placeholder="1500" value={prix} onChange={(e) => setPrix(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Duree (min)</label>
              <select value={duree} onChange={(e) => setDuree(e.target.value)} style={inputStyle}>
                <option value="15">15 min</option><option value="30">30 min</option>
                <option value="45">45 min</option><option value="60">1h</option>
                <option value="90">1h30</option><option value="120">2h</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Categorie</label>
              <input type="text" placeholder="Coiffure, Soin, etc." value={categorie} onChange={(e) => setCategorie(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={submitting || !nom || !prix}
            style={{
              background: OR, color: '#fff', border: 'none', padding: '12px 30px',
              borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', opacity: submitting || !nom || !prix ? 0.5 : 1, width: '100%'
            }}
          >
            {submitting ? 'Ajout en cours...' : 'Ajouter'}
          </button>
        </div>
      )}

      {/* Liste des services groupes par categorie */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center', color: '#888' }}>
          Aucune prestation configuree. Ajoutez-en une pour commencer.
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{cat}</h4>
            <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {items.map((s, i) => (
                <div key={s.id} style={{ padding: '16px 20px', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  {editingId === s.id ? (
                    /* ── Mode edition ── */
                    <div className="responsive-row" style={{ alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: NOIR, fontSize: 15, marginBottom: 10, display: 'block' }}>{s.nom}</span>
                      <div className="responsive-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="number"
                            value={editPrix}
                            onChange={(e) => setEditPrix(e.target.value)}
                            style={{ ...inputStyle, textAlign: 'right' }}
                          />
                          <span style={{ fontSize: 13, color: '#888' }}>DA</span>
                        </div>
                        <select value={editDuree} onChange={(e) => setEditDuree(e.target.value)} style={inputStyle}>
                          <option value="15">15 min</option><option value="30">30 min</option>
                          <option value="45">45 min</option><option value="60">1h</option>
                          <option value="90">1h30</option><option value="120">2h</option>
                          <option value="180">3h</option>
                        </select>
                        <div className="responsive-edit-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                          <button onClick={() => handleSaveEdit(s)} disabled={savingEdit} style={{ background: OR, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', flex: 1 }}>{savingEdit ? '...' : 'OK'}</button>
                          <button onClick={cancelEdit} style={{ background: '#eee', color: NOIR, border: 'none', padding: '8px 14px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1 }}>Annuler</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Mode lecture ── */
                    <div>
                      <div className="responsive-row">
                        <div className="responsive-info">
                          <div>
                            <span style={{ fontWeight: 700, color: NOIR, fontSize: 15, display: 'block', marginBottom: 2 }}>{s.nom}</span>
                            <span style={{ color: '#888', fontSize: 12 }}>{s.duree} min</span>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}>
                            {/* Prix avec promo */}
                            {s.promo_active && s.promo_pourcentage ? (
                              <div>
                                <span style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>{s.prix} DA</span>
                                <div style={{ fontWeight: 800, color: '#d32f2f', fontSize: 15 }}>
                                  {Math.round(s.prix - (s.prix * s.promo_pourcentage / 100))} DA
                                </div>
                                <span style={{ background: '#d32f2f', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 4px', borderRadius: 3, display: 'inline-block', marginTop: 2 }}>-{s.promo_pourcentage}%</span>
                                <span style={{ background: '#d32f2f', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 4px', borderRadius: 3, display: 'inline-block', marginTop: 2 }}>-{s.promo_pourcentage}%</span>
                    {/* ← ICI, ajoute juste en dessous */}
                    {s.promo_debut && s.promo_fin && (
                      <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                        {new Date(s.promo_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(s.promo_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                              </div>
                            ) : (
                              <span style={{ fontWeight: 800, color: OR, fontSize: 15 }}>{s.prix} DA</span>
                            )}
                          </div>
                        </div>

                        <div className="responsive-actions">
                          <button
                            onClick={() => { setPromoId(s.id); setPromoPct(s.promo_pourcentage ? String(s.promo_pourcentage) : ''); setPromoDebut(s.promo_debut || ''); setPromoFin(s.promo_fin || '') }}
                            style={{
                              background: s.promo_active ? '#fff0f0' : 'transparent',
                              border: `1px solid ${s.promo_active ? '#ffcccb' : '#ddd'}`,
                              color: s.promo_active ? '#d32f2f' : '#666',
                              padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                            }}
                          >
                            {s.promo_active ? '% Promo' : '+ Promo'}
                          </button>
                          <button onClick={() => startEdit(s)} style={{ background: 'transparent', border: '1px solid #ddd', color: '#444', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: '1px solid #fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>
                            Supprimer
                          </button>
                        </div>
                      </div>

                      {/* Ligne promo inline */}
                      {promoId === s.id && (
                        <div style={{ marginTop: 15, padding: '14px', background: '#FFF8F8', borderRadius: 6, border: '1px solid #ffcccb', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#d32f2f' }}>Mettre en promotion :</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, color: '#888' }}>-</span>
                            <input
                              type="number"
                              value={promoPct}
                              onChange={(e) => setPromoPct(e.target.value)}
                              placeholder="20"
                              min="1"
                              max="99"
                              style={{ width: 80, padding: '8px', border: '2px solid #d32f2f', borderRadius: 4, fontSize: 14, fontWeight: 700, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 700 }}>% de réduction</span>
                          </div>
                          {promoPct && parseInt(promoPct) > 0 && parseInt(promoPct) < 100 && (
                            <span style={{ fontSize: 13, color: '#666' }}>
                              Nouveau prix : <strong>{Math.round(s.prix - (s.prix * parseInt(promoPct) / 100))} DA</strong>
                            </span>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%' }}>
  <div style={{ flex: '1 1 140px' }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Debut de la promo</label>
    <input type="date" value={promoDebut} onChange={e => setPromoDebut(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
  </div>
  <div style={{ flex: '1 1 140px' }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Fin de la promo</label>
    <input type="date" value={promoFin} onChange={e => setPromoFin(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
  </div>
</div>
                          )}
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button onClick={() => handlePromoSave(s)} disabled={savingPromo} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', flex: 1 }}>{savingPromo ? '...' : 'Activer'}</button>
                            {s.promo_active && (
                              <button onClick={() => handlePromoRemove(s)} disabled={savingPromo} style={{ background: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', padding: '8px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', flex: 1 }}>Retirer</button>
                            )}
                            <button onClick={() => setPromoId(null)} style={{ background: '#eee', color: '#666', border: 'none', padding: '8px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Fermer</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Gestion des employes
// ═══════════════════════════════════════════════════════════════════

function EmployesTab({
  employes, onAdd, onDelete
}: {
  employes: Employe[]; onAdd: (e: Employe) => void; onDelete: (id: number) => void
}) {
  const [nom, setNom] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd() {
    if (!nom.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_employe', nom: nom.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        onAdd(data.employe)
        setNom('')
      }
    } catch (e) {}
    setSubmitting(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cet employe ? Les reservations existantes ne seront pas affectees.')) return
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_employe', id }),
      })
      const data = await res.json()
      if (data.success) onDelete(id)
    } catch (e) {}
  }

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Votre equipe</h3>

      {/* Formulaire ajout rapide */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 25 }}>
        <input
          type="text"
          placeholder="Nom du collaborateur"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={handleAdd}
          disabled={submitting || !nom.trim()}
          style={{
            background: OR, color: '#fff', border: 'none', padding: '12px 24px',
            borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', opacity: submitting || !nom.trim() ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {submitting ? '...' : '+ Ajouter'}
        </button>
      </div>

      {/* Liste */}
      {employes.length === 0 ? (
        <div style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center', color: '#888' }}>
          Aucun collaborateur. Ajoutez votre equipe pour assigner les rendez-vous.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          {employes.map((emp, i) => (
            <div key={emp.id} className="responsive-row" style={{ padding: '16px 20px', borderBottom: i < employes.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: NOIR,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14,
                }}>
                  {emp.nom.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 700, color: NOIR, fontSize: 15 }}>{emp.nom}</span>
              </div>
              <button
                onClick={() => handleDelete(emp.id)}
                style={{
                  background: 'transparent', border: '1px solid #e0e0e0', color: '#cc0000',
                  padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Infos du salon
// ═══════════════════════════════════════════════════════════════════

function SalonTab({ salon, onUpdate }: { salon: Salon; onUpdate: (s: Salon) => void }) {
  const [form, setForm] = useState({ ...salon })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayImage = form.image || DEFAULT_IMAGES[form.type_salon] || DEFAULT_IMAGES['Coiffure']

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm({ 
      ...form, 
      [name]: (name === 'jour_off' || name === 'seuil_fidelite') ? parseInt(value) || 0 : value 
    })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadMsg('Fichier non valide. Choisissez une image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg('Image trop lourde (max 5 Mo)')
      return
    }

    setUploading(true)
    setUploadMsg('')

    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `salon-${salon.id}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabaseClient.storage
        .from('salon-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseClient.storage
        .from('salon-images')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // Sauvegarder dans la BDD
      const res = await fetch('/api/pro/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image: publicUrl }),
      })
      const data = await res.json()
      if (data.success) {
        setForm({ ...form, image: publicUrl })
        onUpdate({ ...form, image: publicUrl })
        setUploadMsg('Photo mise a jour !')
      }
    } catch (err: any) {
      setUploadMsg('Erreur : ' + (err.message || 'Upload echoue'))
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleRemoveImage() {
    setSaving(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image: '' }),
      })
      const data = await res.json()
      if (data.success) {
        setForm({ ...form, image: '' })
        onUpdate({ ...form, image: '' })
        setUploadMsg('Photo supprimee. Une image par defaut sera utilisee.')
      }
    } catch (e) {}
    setSaving(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/pro/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) onUpdate(form)
    } catch (e) {}
    setSaving(false)
  }

  return (
    <div>
      {/* ── Photo de couverture ── */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Photo de couverture</h3>
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', marginBottom: 30, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ position: 'relative', height: 220, background: '#eee' }}>
          <img
            src={displayImage}
            alt="Couverture"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e: any) => { e.target.src = DEFAULT_IMAGES['Coiffure'] }}
          />
          {!form.image && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4 }}>
              Image par defaut
            </div>
          )}
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              background: OR, color: '#fff', border: 'none', padding: '10px 22px',
              borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', opacity: uploading ? 0.5 : 1,
            }}
          >
            {uploading ? 'Envoi en cours...' : 'Changer la photo'}
          </button>
          {form.image && (
            <button
              onClick={handleRemoveImage}
              style={{
                background: 'transparent', border: '1px solid #ddd', color: '#888',
                padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Utiliser image par defaut
            </button>
          )}
          <span style={{ fontSize: 12, color: '#aaa' }}>JPG, PNG ou WebP — max 5 Mo</span>
          {uploadMsg && (
            <span style={{ fontSize: 13, fontWeight: 600, color: uploadMsg.includes('Erreur') ? '#d32f2f' : '#2e7d32' }}>{uploadMsg}</span>
          )}
        </div>
      </div>

      {/* ── Infos du salon ── */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Informations du salon</h3>

      <div style={{ background: '#fff', padding: 30, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="responsive-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          <div>
            <label style={labelStyle}>Nom du salon</label>
            <input name="nom" value={form.nom} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select name="type_salon" value={form.type_salon} onChange={handleChange} style={inputStyle}>
              {TYPES_SALON.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ville</label>
            <input name="ville" value={form.ville} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Telephone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+213 XXX XXX XXX" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Jour de fermeture</label>
            <select name="jour_off" value={form.jour_off} onChange={handleChange} style={inputStyle}>
              <option value={0}>Aucun (ouvert 7j/7)</option>
              {JOURS_SEMAINE.slice(1).map((j, i) => <option key={i + 1} value={i + 1}>{j}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Heure ouverture</label>
            <input name="ouverture" type="time" value={form.ouverture} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Heure fermeture</label>
            <input name="fermeture" type="time" value={form.fermeture} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Seuil de fidélité (RDV requis)</label>
            <select name="seuil_fidelite" value={form.seuil_fidelite || 4} onChange={handleChange} style={inputStyle}>
              <option value={5}>5 rendez-vous terminés</option>
              <option value={10}>10 rendez-vous terminés</option>
              <option value={15}>15 rendez-vous terminés</option>
              <option value={20}>20 rendez-vous terminés</option>
            </select>
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 25, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: OR, color: '#fff', border: 'none', padding: '14px 40px',
              borderRadius: 6, fontSize: 15, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', opacity: saving ? 0.5 : 1,
              width: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100%' : 'auto'
            }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Styles communs
// ═══════════════════════════════════════════════════════════════════

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
  fontSize: 14, fontFamily: 'Inter, sans-serif', background: '#fafafa',
  outline: 'none', boxSizing: 'border-box',
}
