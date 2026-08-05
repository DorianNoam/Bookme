'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function CreateSalonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    type_salon: 'Coiffure',
    ville: '',
    adresse: '',
    telephone: '',
    description: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/pro/salon/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Redirection vers le tableau de bord une fois le salon créé
        router.push('/pro/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Une erreur est survenue.')
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', paddingBottom: 40 }}>
      <header style={{ background: NOIR, padding: '20px', textAlign: 'center' }}>
        <Link href="/pro/dashboard" style={{ fontSize: 22, fontWeight: 900, color: '#fff', textDecoration: 'none' }}>
          Bookme<span style={{ color: OR }}>.dz</span> <span style={{ fontWeight: 400, fontSize: 16, color: '#888' }}>| Configuration</span>
        </Link>
      </header>

      <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: NOIR, marginBottom: 10 }}>Créer votre établissement</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>
            Renseignez les informations de votre salon ou clinique pour commencer à recevoir des réservations.
          </p>

          {error && (
            <div style={{ background: 'rgba(211, 47, 47, 0.1)', color: '#ff6b6b', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20, fontWeight: 500, border: '1px solid rgba(211, 47, 47, 0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>Nom de l'établissement *</label>
              <input 
                type="text" name="nom" required
                value={formData.nom} onChange={handleChange}
                placeholder="Ex: Salon Yasmina, Hammam El Baraka..."
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>Catégorie *</label>
              <select 
                name="type_salon" required
                value={formData.type_salon} onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, outline: 'none', background: '#fff' }}
              >
                <option value="Coiffure">Coiffure</option>
                <option value="Barbier">Barbier</option>
                <option value="Beauté des ongles">Beauté des ongles</option>
                <option value="Hammam & Spa">Hammam & Spa</option>
                <option value="Massage et bien-être">Massage et bien-être</option>
                <option value="Chirurgie esthétique">Chirurgie esthétique</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>Ville *</label>
                <input 
                  type="text" name="ville" required
                  value={formData.ville} onChange={handleChange}
                  placeholder="Ex: Alger, Oran..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>Téléphone</label>
                <input 
                  type="tel" name="telephone"
                  value={formData.telephone} onChange={handleChange}
                  placeholder="0555..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>Adresse complète</label>
              <input 
                type="text" name="adresse"
                value={formData.adresse} onChange={handleChange}
                placeholder="Ex: 15 Rue Didouche Mourad"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NOIR, display: 'block', marginBottom: 6 }}>Description (Optionnelle)</label>
              <textarea 
                name="description" rows={3}
                value={formData.description} onChange={handleChange}
                placeholder="Décrivez l'ambiance et les spécialités de votre établissement..."
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#999' : OR, color: '#fff', border: 'none', borderRadius: 4, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10 }}
            >
              {loading ? 'Création en cours...' : 'Valider et créer mon établissement'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
