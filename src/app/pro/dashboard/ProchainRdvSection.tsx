'use client'

import React, { useState } from 'react'
import CancelRdvButton from '@/app/pro/components/CancelRdvButton'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

interface Rdv {
  id: number
  client_nom: string
  client_prenom?: string | null
  client_email?: string | null
  client_telephone?: string | null
  service_nom: string
  service_prix: number
  date_rdv: string
  statut: string
  employes?: { nom: string } | null
}

function formatPhoneForWhatsApp(phone: string): string {
  // Nettoyer le numero
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '')
  // +213 → 213
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1)
  // 0 → 213 (Algerie)
  if (cleaned.startsWith('0')) cleaned = '213' + cleaned.slice(1)
  return cleaned
}

export default function ProchainRdvSection({ upcoming, salonName }: { upcoming: Rdv[]; salonName: string }) {
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null)
  const now = new Date()

  const closeModal = () => setSelectedRdv(null)

  // Construire le message WhatsApp pre-rempli
  function buildWhatsAppMessage(rdv: Rdv): string {
    const dateObj = new Date(rdv.date_rdv)
    const dateStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeStr = String(dateObj.getHours()).padStart(2, '0') + 'h' + String(dateObj.getMinutes()).padStart(2, '0')
    const clientName = rdv.client_prenom ? `${rdv.client_prenom}` : rdv.client_nom
    const msg = `Bonjour ${clientName}, je vous confirme votre RDV du ${dateStr} à ${timeStr} chez ${salonName} pour ${rdv.service_nom}. À bientôt !`
    return encodeURIComponent(msg)
  }

  return (
    <>
      {(!upcoming || upcoming.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#999', fontSize: 14 }}>
          Aucun rendez-vous a venir.
        </div>
      ) : (
        <div>
          {upcoming.map((rdv, i) => {
            const rdvDate = new Date(rdv.date_rdv)
            const isToday = rdvDate.toDateString() === now.toDateString()
            return (
              <div key={rdv.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < upcoming.length - 1 ? '1px solid #f5f5f5' : 'none',
                gap: 10,
                flexWrap: 'wrap',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onClick={() => setSelectedRdv(rdv)}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  {/* Heure */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 8,
                    background: isToday ? OR : '#f5f5f5',
                    color: isToday ? '#fff' : NOIR,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1 }}>
                      {String(rdvDate.getHours()).padStart(2, '0')}h{String(rdvDate.getMinutes()).padStart(2, '0')}
                    </div>
                  </div>
                  {/* Infos */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: NOIR,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {rdv.client_prenom ? `${rdv.client_prenom} ${rdv.client_nom}` : rdv.client_nom}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#888',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {rdv.service_nom}
                      {rdv.employes?.nom && <span style={{ color: '#bbb' }}> — {rdv.employes.nom}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: OR }}>{rdv.service_prix?.toLocaleString()} DA</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                      {isToday ? "Aujourd'hui" : rdvDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CancelRdvButton id={rdv.id} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL FICHE CLIENT */}
      {selectedRdv && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 420,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Header modal */}
            <div style={{
              background: NOIR,
              color: '#fff',
              padding: '20px 24px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {selectedRdv.client_prenom ? `${selectedRdv.client_prenom} ${selectedRdv.client_nom}` : selectedRdv.client_nom}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Fiche client</div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenu */}
            <div style={{ padding: '24px' }}>

              {/* Contact */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  Contact
                </div>

                {selectedRdv.client_telephone ? (
                  <a href={`tel:${selectedRdv.client_telephone}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: '#f8f8f8',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: NOIR,
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>📞</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedRdv.client_telephone}</span>
                  </a>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8f8f8', borderRadius: 8, color: '#bbb', fontSize: 13, marginBottom: 8 }}>
                    Pas de telephone renseigne
                  </div>
                )}

                {selectedRdv.client_email ? (
                  <a href={`mailto:${selectedRdv.client_email}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: '#f8f8f8',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: NOIR,
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>✉️</span>
                    <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedRdv.client_email}</span>
                  </a>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8f8f8', borderRadius: 8, color: '#bbb', fontSize: 13, marginBottom: 8 }}>
                    Pas d{"'"}email renseigne
                  </div>
                )}
              </div>

              {/* Prestation */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  Prestation
                </div>
                <div style={{
                  padding: '14px',
                  background: '#faf8f4',
                  borderRadius: 8,
                  borderLeft: `3px solid ${OR}`,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NOIR, marginBottom: 4 }}>
                    {selectedRdv.service_nom}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: OR }}>
                    {selectedRdv.service_prix?.toLocaleString()} DA
                  </div>
                  {selectedRdv.employes?.nom && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
                      Avec : {selectedRdv.employes.nom}
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Heure */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  Date et heure
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: NOIR }}>
                  {(() => {
                    const d = new Date(selectedRdv.date_rdv)
                    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    const timeStr = String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0')
                    return `${dateStr} à ${timeStr}`
                  })()}
                </div>
              </div>

              {/* Bouton WhatsApp */}
              {selectedRdv.client_telephone && (
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(selectedRdv.client_telephone)}?text=${buildWhatsAppMessage(selectedRdv)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '14px',
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    marginBottom: 10,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contacter sur WhatsApp
                </a>
              )}

              {/* Bouton Appeler */}
              {selectedRdv.client_telephone && (
                <a
                  href={`tel:${selectedRdv.client_telephone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '12px',
                    background: '#fff',
                    color: NOIR,
                    border: `2px solid ${NOIR}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  📞 Appeler
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
