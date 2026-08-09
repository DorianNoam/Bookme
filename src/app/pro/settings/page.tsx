'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import LogoutButton from '@/app/pro/components/LogoutButton'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

const JOURS_SEMAINE = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const TYPES_SALON = ['Coiffure', 'Barbier', 'Beaute des ongles', 'Massage et bien-etre', 'Hammam & Spa', 'Chirurgie esthetique', 'Institut']

type Service = { id: number; nom: string; prix: number; duree: number; categorie_service: string }
type Employe = { id: number; nom: string }
type Salon = {
  id: number; nom: string; adresse: string; ville: string; telephone: string;
  description: string; ouverture: string; fermeture: string; jour_off: number;
  type_salon: string; image: string
}
type CatalogueItem = { id: number; categorie: string; nom: string }

export default function ProSettingsPage() {
  const [tab, setTab] = useState<'services' | 'employes' | 'salon'>('services')
  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
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
    { key: 'employes' as const, label: 'Equipe', count: employes.length },
    { key: 'salon' as const, label: 'Mon salon', count: null },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>

      {/* HEADER */}
      <header style={{ background: NOIR, color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>
          Bookme<span style={{ color: OR }}>.dz</span> <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>| Parametres</span>
        </div>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/pro/dashboard" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
          <Link href="/pro/agenda" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Agenda</Link>
          <Link href="/pro/settings" style={{ color: OR, fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>Parametres</Link>
          <LogoutButton />
        </nav>
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
        <div style={{ display: 'flex', gap: 0, marginBottom: 30 }}>
          {tabs.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: tab === t.key ? 800 : 600,
                color: tab === t.key ? '#fff' : NOIR,
                background: tab === t.key ? NOIR : '#fff',
                border: `1px solid ${tab === t.key ? NOIR : '#ddd'}`,
                cursor: 'pointer',
                borderRadius: i === 0 ? '6px 0 0 6px' : i === tabs.length - 1 ? '0 6px 6px 0' : '0',
                marginLeft: i === 0 ? 0 : -1,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t.label} {t.count !== null && <span style={{ color: tab === t.key ? OR : '#999', marginLeft: 6 }}>({t.count})</span>}
            </button>
          ))}
        </div>

        {/* ════════ TAB SERVICES ════════ */}
        {tab === 'services' && (
          <ServicesTab
            services={services}
            catalogue={catalogue}
            onAdd={(s) => { setServices([...services, s]); showMessage('Prestation ajoutee') }}
            onDelete={(id) => { setServices(services.filter(s => s.id !== id)); showMessage('Prestation supprimee') }}
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
// COMPOSANT : Gestion des services
// ═══════════════════════════════════════════════════════════════════

function ServicesTab({
  services, catalogue, onAdd, onDelete
}: {
  services: Service[]; catalogue: CatalogueItem[];
  onAdd: (s: Service) => void; onDelete: (id: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [prix, setPrix] = useState('')
  const [duree, setDuree] = useState('30')
  const [categorie, setCategorie] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
          }}
        >
          {showForm ? 'Annuler' : '+ Ajouter une prestation'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div style={{ background: '#fff', padding: 25, borderRadius: 8, marginBottom: 25, border: `2px solid ${OR}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
            {/* Nom — soit catalogue soit custom */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Prestation</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value=""
                  onChange={(e) => {
                    const item = catalogue.find(c => c.nom === e.target.value)
                    if (item) { setNom(item.nom); setCategorie(item.categorie) }
                  }}
                  style={{ ...inputStyle, flex: 1 }}
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
                <span style={{ alignSelf: 'center', color: '#999', fontSize: 13 }}>ou</span>
                <input
                  type="text"
                  placeholder="Prestation personnalisée"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
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
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1h</option>
                <option value="90">1h30</option>
                <option value="120">2h</option>
              </select>
            </div>
            <div>
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
              fontFamily: 'Inter, sans-serif', opacity: submitting || !nom || !prix ? 0.5 : 1,
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
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 20px', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: NOIR, fontSize: 14 }}>{s.nom}</span>
                    <span style={{ color: '#999', fontSize: 13, marginLeft: 10 }}>{s.duree} min</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <span style={{ fontWeight: 800, color: OR, fontSize: 15 }}>{s.prix} DA</span>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        background: 'transparent', border: '1px solid #e0e0e0', color: '#cc0000',
                        padding: '4px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
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
            <div key={emp.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: i < employes.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}>
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'jour_off' ? parseInt(value) : value })
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
      <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Informations du salon</h3>

      <div style={{ background: '#fff', padding: 30, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

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
