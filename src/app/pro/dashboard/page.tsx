export const dynamic = 'force-dynamic'

import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// OBLIGATOIRE : Force Next.js à lire les cookies en temps réel à chaque rafraîchissement
export const dynamic = 'force-dynamic'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const BG = '#F8F5F0'

export default async function ProDashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('bookme_pro_token')?.value

  if (!token) {
    return (
      <div style={{ padding: 50, background: NOIR, color: '#ff6b6b', minHeight: '100vh' }}>
        <h1>Erreur : Cookie introuvable</h1>
        <p>Le navigateur n'a pas envoyé le token JWT lors du rafraîchissement.</p>
        <Link href="/pro/login" style={{ color: OR }}>Retour à la connexion</Link>
      </div>
    )
  }

  let proId;
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("La variable d'environnement JWT_SECRET est manquante sur Vercel.")
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    proId = payload.id as number
  } catch (err: any) {
    // AU LIEU DE REDIRIGER, ON AFFICHE L'ERREUR POUR COMPRENDRE LE BUG
    return (
      <div style={{ padding: 50, background: NOIR, color: '#ff6b6b', minHeight: '100vh' }}>
        <h1>Erreur de vérification JWT</h1>
        <p style={{ fontWeight: 'bold' }}>{err.message}</p>
        <p>Vérifie tes variables d'environnement Vercel.</p>
        <Link href="/pro/login" style={{ color: OR }}>Retour à la connexion</Link>
      </div>
    )
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: pro } = await supabase
    .from('pros')
    .select('prenom, nom')
    .eq('id', proId)
    .single()

  const { data: salon } = await supabase
    .from('salons')
    .select('id, nom, ville')
    .eq('pro_id', proId)
    .single()

  let reservationsAujourdhui: any[] = []
  if (salon) {
    const { data: res } = await supabase
      .from('reservations')
      .select('*')
      .eq('salon_id', salon.id)
      .eq('statut', 'confirme')
      .order('date_rdv', { ascending: true })
      .limit(5)
    
    if (res) reservationsAujourdhui = res
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: BG, minHeight: '100vh' }}>
      
      {/* NOUVEAU HEADER AVEC AGENDA ET DÉCONNEXION */}
      <header style={{ background: NOIR, color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>
          Bookme<span style={{ color: OR }}>.dz</span> <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>| Espace Pro</span>
        </div>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#888', marginRight: 10 }}>{pro?.prenom} {pro?.nom}</span>
          <Link href="/pro/dashboard" style={{ color: OR, fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>Dashboard</Link>
          <Link href="/pro/agenda" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Agenda</Link>
          <Link href="/pro/logout" style={{ color: '#ff6b6b', fontSize: 13, textDecoration: 'none', fontWeight: 700, marginLeft: 10 }}>Déconnexion</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        
        {!salon ? (
          <div style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: NOIR, marginBottom: 15 }}>Bienvenue sur Bookme Pro !</h2>
            <p style={{ color: '#666', marginBottom: 30 }}>Pour commencer à recevoir des réservations, vous devez configurer votre établissement.</p>
            <Link href="/pro/salon/create" style={{ display: 'inline-block', background: OR, color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: 4, fontWeight: 700 }}>
              Créer mon salon
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 30 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: NOIR, marginBottom: 5 }}>{salon.nom}</h1>
              <p style={{ color: '#666', fontSize: 14 }}>📍 {salon.ville}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
              <div style={{ background: '#fff', padding: 25, borderRadius: 6, borderLeft: `4px solid ${NOIR}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>RDV du jour</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: NOIR }}>{reservationsAujourdhui.length}</div>
              </div>
              <div style={{ background: '#fff', padding: 25, borderRadius: 6, borderLeft: `4px solid ${OR}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Chiffre d'affaires estimé</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: OR }}>
                  {reservationsAujourdhui.reduce((acc, curr) => acc + (curr.service_prix || 0), 0)} DA
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 6, padding: 25, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 20 }}>Prochains rendez-vous</h3>
              
              {reservationsAujourdhui.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: 14 }}>
                  Aucun rendez-vous confirmé à venir.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  {reservationsAujourdhui.map(rdv => (
                    <div key={rdv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: NOIR, fontSize: 15, marginBottom: 4 }}>{rdv.client_nom}</div>
                        <div style={{ color: '#666', fontSize: 13 }}>{rdv.service_nom}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: OR, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{rdv.service_prix} DA</div>
                        <div style={{ color: '#aaa', fontSize: 12 }}>{new Date(rdv.date_rdv).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
