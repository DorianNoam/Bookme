'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function ContactPage() {
  const { t } = useLanguage()
  
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setStatus('success')
        setForm({ nom: '', email: '', sujet: '', message: '' })
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid #E0D8CE',
    borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif'
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #F0EAE0' }}>
        <Link href="/" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: NOIR, textDecoration: 'none' }}>
          Bookmedz<span style={{ color: OR }}>.com</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ background: '#fff', border: '1px solid #EDE5D8', borderRadius: 8, padding: 'clamp(24px, 5vw, 40px)', width: '100%', maxWidth: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: 900, color: NOIR, marginBottom: 8, textAlign: 'center' }}>
            {t.contact.titre}
          </h1>
          <p style={{ color: '#888', fontSize: 15, textAlign: 'center', marginBottom: 32 }}>
            {t.contact.sousTitre}
          </p>

          {status === 'success' && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '16px', marginBottom: 24, fontSize: 14, color: '#166534', textAlign: 'center', fontWeight: 600 }}>
              {t.contact.succes}
            </div>
          )}

          {status === 'error' && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#b91c1c', textAlign: 'center' }}>
              {t.contact.erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.contact.nom}</label>
              <input type="text" name="nom" value={form.nom} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.contact.email}</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.contact.sujet}</label>
              <input type="text" name="sujet" value={form.sujet} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{t.contact.message}</label>
              <textarea 
                name="message" 
                value={form.message} 
                onChange={handleChange} 
                required 
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }} 
              />
            </div>

            <button type="submit" disabled={status === 'loading'}
              style={{ width: '100%', padding: '14px 0', background: status === 'loading' ? '#999' : NOIR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 15, cursor: status === 'loading' ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'background 0.2s' }}>
              {status === 'loading' ? t.contact.envoiEnCours : t.contact.envoyer}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  )
}
