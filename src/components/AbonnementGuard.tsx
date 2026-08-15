'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default function AbonnementGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'actif' | 'expire'>('loading')
  const [finDate, setFinDate] = useState('')

  useEffect(() => {
    fetch('/api/pro/abonnement')
      .then(res => res.json())
      .then(data => {
        if (data.expire) {
          setStatus('expire')
          setFinDate(data.abonnement_fin || '')
        } else {
          setStatus('actif')
        }
      })
      .catch(() => setStatus('actif'))
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: BG, fontFamily: 'Inter, sans-serif' }}>
        Chargement...
      </div>
    )
  }

  if (status === 'expire') {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0D8CE', maxWidth: 560, width: '100%', overflow: 'hidden' }}>
          
          <div style={{ background: NOIR, padding: '24px 32px', textAlign: 'center' }}>
            <span style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>Bookmedz</span>
            <span style={{ color: OR, fontSize: 24, fontWeight: 900 }}>.com</span>
            <span style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>Pro</span>
          </div>

          <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u23F0'}</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: NOIR, margin: '0 0 8px' }}>Votre essai gratuit est termine</h1>
              <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
                Expire le {finDate ? new Date(finDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </p>
            </div>

            <div style={{ background: BG, borderRadius: 8, padding: 24, marginBottom: 24, border: '1px solid #E0D8CE' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, margin: '0 0 16px' }}>Continuez avec Bookmedz Pro</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: OR }}>3 000 DA</span>
                <span style={{ color: '#888', fontSize: 14 }}>/mois</span>
              </div>
              <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>
                Soit 36 000 DA par an. Agenda en ligne, notifications clients, promotions, galerie photos, gestion des collaborateurs.
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #E0D8CE', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, margin: '0 0 16px' }}>Comment renouveler ?</h3>
              <div style={{ display: 'grid', gap: 12, fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: OR, color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>1</span>
                  <span>Effectuez un virement de <strong>36 000 DA</strong> (abonnement annuel)</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: OR, color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>2</span>
                  <span>Indiquez votre <strong>nom de salon</strong> et <strong>email pro</strong> dans le motif du virement</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: OR, color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>3</span>
                  <span>Envoyez le recu de virement par email a <strong style={{ color: OR }}>contact@bookmedz.com</strong></span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: OR, color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>4</span>
                  <span>Votre abonnement sera active sous <strong>24h</strong> apres verification</span>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 16, background: BG, borderRadius: 6, border: '1px solid #E0D8CE' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: NOIR, margin: '0 0 8px' }}>Coordonnees bancaires :</p>
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.8 }}>
                  CCP / Compte : <strong>XXXXXXXXXX cle XX</strong><br/>
                  Nom : <strong>BOOKMEDZ</strong><br/>
                  Motif : <strong>Abonnement Pro - [Nom du salon]</strong>
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: '#888', fontSize: 13 }}>
              Une question ? Ecrivez-nous a <a href="mailto:contact@bookmedz.com" style={{ color: OR, fontWeight: 600, textDecoration: 'none' }}>contact@bookmedz.com</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
