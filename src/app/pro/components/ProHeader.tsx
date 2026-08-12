'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import LogoutButton from '@/app/pro/components/LogoutButton'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

export default function ProHeader({ activePage }: { activePage: string }) {
  const [role, setRole] = useState<'pro' | 'employe' | null>(null)
  const [nom, setNom] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/pro/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setRole(data.role)
          setNom(data.nom)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <header style={{ background: NOIR, color: '#fff', padding: '12px 16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 900 }}>
            Bookme<span style={{ color: OR }}>.dz</span>
          </span>
          <span style={{ fontWeight: 400, fontSize: 'clamp(11px, 2vw, 14px)', color: '#888' }}>Pro</span>
          {role === 'employe' && nom && (
            <span style={{
              background: 'rgba(184,146,42,0.2)',
              color: OR,
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 3,
              marginLeft: 4
            }}>
              {nom}
            </span>
          )}
        </div>

        <nav style={{
          display: 'flex',
          gap: 'clamp(8px, 2vw, 20px)',
          alignItems: 'center'
        }}>
          {/* Le dashboard et les settings sont reserves au pro */}
          {role === 'pro' && (
            <Link href="/pro/dashboard" style={{
              color: activePage === 'dashboard' ? OR : '#aaa',
              fontSize: 'clamp(12px, 2vw, 14px)',
              textDecoration: 'none',
              fontWeight: activePage === 'dashboard' ? 700 : 600,
              whiteSpace: 'nowrap'
            }}>
              Dashboard
            </Link>
          )}

          <Link href="/pro/agenda" style={{
            color: activePage === 'agenda' ? OR : '#aaa',
            fontSize: 'clamp(12px, 2vw, 14px)',
            textDecoration: 'none',
            fontWeight: activePage === 'agenda' ? 700 : 600,
            whiteSpace: 'nowrap'
          }}>
            Agenda
          </Link>

          {role === 'pro' && (
            <Link href="/pro/settings" style={{
              color: activePage === 'settings' ? OR : '#aaa',
              fontSize: 'clamp(12px, 2vw, 14px)',
              textDecoration: 'none',
              fontWeight: activePage === 'settings' ? 700 : 600,
              whiteSpace: 'nowrap'
            }}>
              Param.
            </Link>
          )}

          <LogoutButton />
        </nav>
      </div>
    </header>
  )
}
