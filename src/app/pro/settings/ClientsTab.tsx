'use client'

import React, { useState, useEffect } from 'react'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

type ClientData = {
  key: string
  client_nom: string
  client_telephone: string | null
  client_email: string | null
  total_rdv: number
  rdv_honores: number
  annulations: number
  no_shows: number
  ca_total: number
  dernier_rdv: string
  premier_rdv: string
  service_prefere: string | null
  is_blacklisted: boolean
}

type ClientStats = {
  total_clients: number
  clients_fideles: number
  clients_a_surveiller: number
  ca_total: number
  blacklistes: number
}

type ClientDetail = {
  client_nom: string
  client_prenom: string
  client_email: string
  client_telephone: string
  date_naissance: string | null
  notes: string
}

type ClientReservation = {
  id: number
  service_nom: string
  service_prix: number
  date_rdv: string
  statut: string
  employes?: { nom: string } | null
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
  fontSize: 14, fontFamily: 'Inter, sans-serif', background: '#fafafa',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6,
}

export default function ClientsTab() {
  const [clients, setClients] = useState<ClientData[]>([])
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'fidele' | 'ca' | 'noshows' | 'recent'>('fidele')
  const [filter, setFilter] = useState<'all' | 'fideles' | 'surveiller' | 'blacklist'>('all')
  const [blacklistingId, setBlacklistingId] = useState<string | null>(null)
  const [blacklistRaison, setBlacklistRaison] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Vue detail
  const [selectedClientKey, setSelectedClientKey] = useState<string | null>(null)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    try {
      const res = await fetch('/api/pro/clients?t=' + Date.now())
      const data = await res.json()
      if (data.success) {
        setClients(data.clients || [])
        setStats(data.stats || null)
      }
    } catch (e) {}
    setLoading(false)
  }

  async function handleBlacklist(client: ClientData) {
    if (!client.client_telephone) { alert('Impossible de blacklister un client sans numero de telephone enregistre.'); return }
    setActionLoading(true)
    try {
      const res = await fetch('/api/pro/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'blacklist', client_telephone: client.client_telephone, client_nom: client.client_nom, raison: blacklistRaison || null })
      })
      const data = await res.json()
      if (data.success) {
        setClients(prev => prev.map(c => c.key === client.key ? { ...c, is_blacklisted: true } : c))
        if (stats) setStats({ ...stats, blacklistes: stats.blacklistes + 1 })
        setBlacklistingId(null); setBlacklistRaison('')
      }
    } catch (e) {}
    setActionLoading(false)
  }

  async function handleUnblacklist(client: ClientData) {
    if (!confirm('Debloquer ce client et lui permettre de reserver a nouveau ?')) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/pro/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblacklist', client_telephone: client.client_telephone })
      })
      const data = await res.json()
      if (data.success) {
        setClients(prev => prev.map(c => c.key === client.key ? { ...c, is_blacklisted: false } : c))
        if (stats) setStats({ ...stats, blacklistes: stats.blacklistes - 1 })
      }
    } catch (e) {}
    setActionLoading(false)
  }

  // Filtrage + tri
  let filtered = clients.filter(c => {
    const q = search.toLowerCase()
    if (q && !c.client_nom.toLowerCase().includes(q) && !(c.client_telephone || '').includes(q) && !(c.client_email || '').toLowerCase().includes(q)) return false
    if (filter === 'fideles') return c.rdv_honores >= 3
    if (filter === 'surveiller') return c.no_shows >= 2 || c.annulations >= 3
    if (filter === 'blacklist') return c.is_blacklisted
    return true
  })
  filtered.sort((a, b) => {
    if (sortBy === 'fidele') return b.rdv_honores - a.rdv_honores
    if (sortBy === 'ca') return b.ca_total - a.ca_total
    if (sortBy === 'noshows') return (b.no_shows + b.annulations) - (a.no_shows + a.annulations)
    if (sortBy === 'recent') return new Date(b.dernier_rdv).getTime() - new Date(a.dernier_rdv).getTime()
    return 0
  })

  function formatDate(d: string) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return <div style={{ background: '#fff', padding: 60, borderRadius: 8, textAlign: 'center' }}><p style={{ color: '#888', fontSize: 15 }}>Chargement de vos clients...</p></div>
  }

  // ═══════════════════════════════════════════════════════════════
  // VUE DETAIL CLIENT
  // ═══════════════════════════════════════════════════════════════
  if (selectedClientKey) {
    return (
      <ClientDetailView
        clientKey={selectedClientKey}
        onBack={() => { setSelectedClientKey(null); fetchClients() }}
      />
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // VUE LISTE
  // ═══════════════════════════════════════════════════════════════
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 8 }}>Fiche Clients</h3>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Retrouvez tous vos clients, identifiez les plus fideles et gerez les no-shows.</p>

      {/* STATS */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total clients" value={stats.total_clients} color={NOIR} />
          <StatCard label="Fideles" value={stats.clients_fideles} color={OR} />
          <StatCard label="CA Total" value={`${stats.ca_total.toLocaleString()} DA`} color="#2e7d32" small />
          <StatCard label="A surveiller" value={stats.clients_a_surveiller} color="#e65100" />
          {stats.blacklistes > 0 && <StatCard label="Blacklistes" value={stats.blacklistes} color="#d32f2f" />}
        </div>
      )}

      {/* RECHERCHE + FILTRES */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 8, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: '#aaa', fontSize: 16 }}>&#128269;</span>
          <input type="text" placeholder="Rechercher un client (nom, telephone, email)..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{ ...inputStyle, width: 'auto', flex: '0 0 auto' }}>
          <option value="all">Tous les clients</option>
          <option value="fideles">Clients fideles</option>
          <option value="surveiller">A surveiller</option>
          <option value="blacklist">Blacklistes</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ ...inputStyle, width: 'auto', flex: '0 0 auto' }}>
          <option value="fidele">Trier par fidelite</option>
          <option value="ca">Trier par CA</option>
          <option value="noshows">Trier par no-shows</option>
          <option value="recent">Plus recents</option>
        </select>
      </div>

      {/* LISTE */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', padding: 50, borderRadius: 8, textAlign: 'center', color: '#888' }}>
          {clients.length === 0 ? 'Aucun client pour le moment. Les clients apparaitront ici apres leur premiere reservation.' : 'Aucun client ne correspond a votre recherche.'}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          {filtered.map((client, i) => (
            <div key={client.key} style={{ padding: '18px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none', opacity: client.is_blacklisted ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div
                  onClick={() => setSelectedClientKey(client.key)}
                  style={{ display: 'flex', gap: 14, flex: 1, cursor: 'pointer', minWidth: 0 }}
                >
                  {/* AVATAR */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: client.is_blacklisted ? '#d32f2f' : client.rdv_honores >= 5 ? OR : NOIR,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 16
                  }}>
                    {client.is_blacklisted ? '\u2717' : client.client_nom.charAt(0).toUpperCase()}
                  </div>

                  {/* INFOS */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: NOIR, fontSize: 15, textDecoration: 'underline', textDecorationColor: '#ddd', textUnderlineOffset: 3 }}>{client.client_nom}</span>
                      {client.rdv_honores >= 5 && <span style={{ background: OR, color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>&#9733; FIDELE</span>}
                      {client.is_blacklisted && <span style={{ background: '#d32f2f', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>BLACKLISTE</span>}
                      {!client.is_blacklisted && (client.no_shows >= 2 || client.annulations >= 3) && <span style={{ background: '#fff3e0', color: '#e65100', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, border: '1px solid #ffcc80' }}>&#9888; A SURVEILLER</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#888' }}>
                      {client.client_telephone && <span>&#128222; {client.client_telephone}</span>}
                      {client.client_email && <span>&#9993; {client.client_email}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, fontSize: 12 }}>
                      <span style={{ color: '#555' }}><strong style={{ color: NOIR }}>{client.rdv_honores}</strong> RDV</span>
                      <span style={{ color: '#2e7d32' }}><strong>{client.ca_total.toLocaleString()}</strong> DA</span>
                      {client.annulations > 0 && <span style={{ color: '#e65100' }}><strong>{client.annulations}</strong> annul.</span>}
                      {client.no_shows > 0 && <span style={{ color: '#d32f2f' }}><strong>{client.no_shows}</strong> no-show{client.no_shows > 1 ? 's' : ''}</span>}
                      <span style={{ color: '#aaa' }}>Dernier RDV : {formatDate(client.dernier_rdv)}</span>
                    </div>
                    {client.service_prefere && <div style={{ marginTop: 6, fontSize: 11, color: OR, fontWeight: 600 }}>&#9733; Service prefere : {client.service_prefere}</div>}
                  </div>
                </div>

                {/* ACTIONS */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setSelectedClientKey(client.key)} style={{ background: 'transparent', border: `1px solid ${OR}`, color: OR, padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Voir fiche</button>
                  {client.is_blacklisted ? (
                    <button onClick={() => handleUnblacklist(client)} disabled={actionLoading} style={{ background: '#fff', border: '1px solid #4caf50', color: '#2e7d32', padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Debloquer</button>
                  ) : (
                    <button onClick={() => { if (!client.client_telephone) { alert("Ce client n'a pas de numero de telephone enregistre."); return }; setBlacklistingId(blacklistingId === client.key ? null : client.key); setBlacklistRaison('') }} style={{ background: 'transparent', border: '1px solid #ffcdd2', color: '#d32f2f', padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Blacklister</button>
                  )}
                </div>
              </div>

              {/* FORMULAIRE BLACKLIST */}
              {blacklistingId === client.key && !client.is_blacklisted && (
                <div style={{ marginTop: 14, padding: 16, background: '#FFF8F8', borderRadius: 6, border: '1px solid #ffcdd2' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#d32f2f', marginBottom: 10 }}>Blacklister {client.client_nom} ?</div>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5, margin: '0 0 12px 0' }}>Ce client ne pourra plus reserver. Vous pourrez le debloquer a tout moment.</p>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4 }}>Raison (optionnelle)</label>
                    <input type="text" value={blacklistRaison} onChange={e => setBlacklistRaison(e.target.value)} placeholder="Ex: 3 no-shows consecutifs..." style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleBlacklist(client)} disabled={actionLoading} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: actionLoading ? 0.5 : 1 }}>{actionLoading ? 'En cours...' : 'Confirmer le blocage'}</button>
                    <button onClick={() => { setBlacklistingId(null); setBlacklistRaison('') }} style={{ background: '#eee', color: '#666', border: 'none', padding: '8px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#aaa', fontSize: 12 }}>
          {filtered.length} client{filtered.length > 1 ? 's' : ''} affiche{filtered.length > 1 ? 's' : ''}{search && ` sur ${clients.length} au total`}
        </div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════
// VUE DETAIL CLIENT
// ═══════════════════════════════════════════════════════════════════

function ClientDetailView({ clientKey, onBack }: { clientKey: string; onBack: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [reservations, setReservations] = useState<ClientReservation[]>([])
  const [clientStats, setClientStats] = useState<any>(null)
  const [isBlacklisted, setIsBlacklisted] = useState(false)

  // Formulaire editable
  const [formNom, setFormNom] = useState('')
  const [formPrenom, setFormPrenom] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTelephone, setFormTelephone] = useState('')
  const [formDateNaissance, setFormDateNaissance] = useState('')
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => {
    fetchDetail()
  }, [clientKey])

  async function fetchDetail() {
    setLoading(true)
    try {
      const res = await fetch(`/api/pro/clients?client_key=${encodeURIComponent(clientKey)}&t=${Date.now()}`)
      const data = await res.json()
      if (data.success) {
        setClient(data.client)
        setReservations(data.reservations || [])
        setClientStats(data.stats)
        setIsBlacklisted(data.is_blacklisted)
        // Remplir le formulaire
        setFormNom(data.client.client_nom || '')
        setFormPrenom(data.client.client_prenom || '')
        setFormEmail(data.client.client_email || '')
        setFormTelephone(data.client.client_telephone || '')
        setFormDateNaissance(data.client.date_naissance || '')
        setFormNotes(data.client.notes || '')
      }
    } catch (e) {}
    setLoading(false)
  }

  async function handleSave() {
    if (!formTelephone && !clientKey) return
    setSaving(true); setSaveMsg('')
    try {
      const res = await fetch('/api/pro/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_client',
          client_telephone: formTelephone || clientKey,
          client_nom: formNom,
          client_prenom: formPrenom,
          client_email: formEmail,
          date_naissance: formDateNaissance || null,
          notes: formNotes,
        })
      })
      const data = await res.json()
      if (data.success) {
        setSaveMsg('Modifications enregistrees !')
        setTimeout(() => setSaveMsg(''), 3000)
      } else {
        setSaveMsg('Erreur : ' + (data.error || 'Impossible de sauvegarder.'))
      }
    } catch (e) {
      setSaveMsg('Erreur reseau.')
    }
    setSaving(false)
  }

  function formatDateFr(d: string) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatHeure(d: string) {
    if (!d) return ''
    const date = new Date(d)
    return `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`
  }

  function statutColor(statut: string) {
    if (statut === 'annule') return '#d32f2f'
    if (statut === 'absent' || statut === 'no_show') return '#e65100'
    if (statut === 'termine') return '#2e7d32'
    return OR
  }

  function statutLabel(statut: string) {
    if (statut === 'annule') return 'Annule'
    if (statut === 'absent' || statut === 'no_show') return 'No-show'
    if (statut === 'termine') return 'Termine'
    if (statut === 'confirme') return 'Confirme'
    return statut
  }

  // Anniversaire check
  const isBirthdaySoon = (() => {
    if (!formDateNaissance) return false
    const today = new Date()
    const bday = new Date(formDateNaissance)
    bday.setFullYear(today.getFullYear())
    const diff = (bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 14
  })()

  if (loading) {
    return <div style={{ background: '#fff', padding: 60, borderRadius: 8, textAlign: 'center' }}><p style={{ color: '#888' }}>Chargement de la fiche client...</p></div>
  }

  if (!client) {
    return <div style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center', color: '#888' }}>Client introuvable. <button onClick={onBack} style={{ color: OR, background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Retour</button></div>
  }

  return (
    <div>
      {/* HEADER RETOUR */}
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: OR, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 20, fontFamily: 'Inter, sans-serif', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        &#8592; Retour a la liste
      </button>

      {/* EN-TETE CLIENT */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '24px', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: isBlacklisted ? '#d32f2f' : (clientStats?.rdv_honores >= 5 ? OR : NOIR),
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 22
          }}>
            {formNom.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: NOIR, margin: 0 }}>{formPrenom ? `${formPrenom} ${formNom}` : formNom}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {clientStats?.rdv_honores >= 5 && <span style={{ background: OR, color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 10 }}>&#9733; FIDELE</span>}
              {isBlacklisted && <span style={{ background: '#d32f2f', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 10 }}>BLACKLISTE</span>}
              {isBirthdaySoon && <span style={{ background: '#fff3e0', color: '#e65100', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 10, border: '1px solid #ffcc80' }}>&#127874; Anniversaire bientot !</span>}
            </div>
          </div>
        </div>

        {/* MINI STATS */}
        {clientStats && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: NOIR }}>{clientStats.rdv_honores}</div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>RDV</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#2e7d32' }}>{clientStats.ca_total.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>DA</div>
            </div>
            {clientStats.annulations > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#e65100' }}>{clientStats.annulations}</div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Annul.</div>
              </div>
            )}
            {clientStats.no_shows > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#d32f2f' }}>{clientStats.no_shows}</div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>No-show</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORMULAIRE D EDITION */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '24px', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginTop: 0, marginBottom: 20 }}>Informations du client</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Nom</label>
            <input type="text" value={formNom} onChange={e => setFormNom(e.target.value)} style={inputStyle} placeholder="Nom de famille" />
          </div>
          <div>
            <label style={labelStyle}>Prenom</label>
            <input type="text" value={formPrenom} onChange={e => setFormPrenom(e.target.value)} style={inputStyle} placeholder="Prenom" />
          </div>
          <div>
            <label style={labelStyle}>Telephone</label>
            <input type="text" value={formTelephone} onChange={e => setFormTelephone(e.target.value)} style={inputStyle} placeholder="+213 XXX XXX XXX" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} style={inputStyle} placeholder="email@exemple.com" />
          </div>
          <div>
            <label style={labelStyle}>Date de naissance &#127874;</label>
            <input type="date" value={formDateNaissance} onChange={e => setFormDateNaissance(e.target.value)} style={inputStyle} />
            {formDateNaissance && isBirthdaySoon && (
              <div style={{ fontSize: 11, color: '#e65100', fontWeight: 600, marginTop: 4 }}>&#127874; Anniversaire dans les 14 prochains jours !</div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notes internes</label>
          <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Notes sur le client (preferences, allergies, remarques...)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={handleSave} disabled={saving} style={{
            background: OR, color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 6,
            fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            opacity: saving ? 0.5 : 1
          }}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          {saveMsg && (
            <span style={{ fontSize: 13, fontWeight: 600, color: saveMsg.includes('Erreur') ? '#d32f2f' : '#2e7d32' }}>{saveMsg}</span>
          )}
        </div>
      </div>

      {/* HISTORIQUE DES RESERVATIONS */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: NOIR, marginTop: 0, marginBottom: 20 }}>
          Historique des reservations ({reservations.length})
        </h3>

        {reservations.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Aucune reservation trouvee.</p>
        ) : (
          <div>
            {reservations.map((r, i) => (
              <div key={r.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0',
                borderBottom: i < reservations.length - 1 ? '1px solid #f0f0f0' : 'none',
                gap: 12, flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: NOIR }}>{r.service_nom}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10,
                      background: `${statutColor(r.statut)}15`, color: statutColor(r.statut),
                      textTransform: 'uppercase',
                    }}>
                      {statutLabel(r.statut)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {formatDateFr(r.date_rdv)} a {formatHeure(r.date_rdv)}
                    {r.employes && typeof r.employes === 'object' && 'nom' in r.employes && (
                      <span style={{ marginLeft: 8, color: '#aaa' }}>— {(r.employes as any).nom}</span>
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: r.statut === 'annule' ? '#ccc' : NOIR, textDecoration: r.statut === 'annule' ? 'line-through' : 'none', flexShrink: 0 }}>
                  {r.service_prix?.toLocaleString()} DA
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════
// Composant StatCard
// ═══════════════════════════════════════════════════════════════════

function StatCard({ label, value, color, small }: { label: string; value: string | number; color: string; small?: boolean }) {
  return (
    <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 8, borderLeft: `4px solid ${color}` }}>
      <div style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: small ? 22 : 28, fontWeight: 900, color }}>{value}</div>
    </div>
  )
}
