// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Services
// ═══════════════════════════════════════════════════════════════════

const CATEGORIES_SERVICES = [
  'Coiffure & soin cheveux',
  'Onglerie Main & pieds',
  'Beaute du regard',
  'Soin visage & corps',
  'Make up',
  'Epilation',
  'Piercing et tatouage',
  'Barbier',
  'Esthetique',
  'Massage',
  'SPA',
]

function ServicesTab({ services, catalogue, onAdd, onUpdate, onDelete }: { services: Service[]; catalogue: CatalogueItem[]; onAdd: (s: Service) => void; onUpdate: (s: Service) => void; onDelete: (id: number) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [descriptionService, setDescriptionService] = useState('')
  const [prix, setPrix] = useState('')
  const [duree, setDuree] = useState('30')
  const [categorie, setCategorie] = useState(CATEGORIES_SERVICES[0])
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNom, setEditNom] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrix, setEditPrix] = useState('')
  const [editDuree, setEditDuree] = useState('')
  const [editCategorie, setEditCategorie] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  
  const [promoId, setPromoId] = useState<number | null>(null)
  const [promoPct, setPromoPct] = useState('')
  const [promoNom, setPromoNom] = useState('') 
  const [savingPromo, setSavingPromo] = useState(false)
  const [promoDebut, setPromoDebut] = useState('')
  const [promoFin, setPromoFin] = useState('')

  const grouped = services.reduce((acc, s) => { const cat = s.categorie_service || 'Autres'; if (!acc[cat]) acc[cat] = []; acc[cat].push(s); return acc }, {} as Record<string, Service[]>)

  function startEdit(s: Service) { setEditingId(s.id); setEditNom(s.nom); setEditDescription((s as any).description || ''); setEditPrix(String(s.prix)); setEditDuree(String(s.duree)); setEditCategorie(s.categorie_service || CATEGORIES_SERVICES[0]) }
  function cancelEdit() { setEditingId(null); setEditNom(''); setEditDescription(''); setEditPrix(''); setEditDuree(''); setEditCategorie('') }

  async function handlePromoSave(s: Service) {
    const pct = parseInt(promoPct)
    if (isNaN(pct) || pct < 1 || pct > 99) return
    setSavingPromo(true)
    try {
      const res = await fetch('/api/pro/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set_promo', id: s.id, promo_pourcentage: pct, promo_active: true, promo_nom: promoNom || null, promo_debut: promoDebut || null, promo_fin: promoFin || null }) })
      const data = await res.json()
      if (data.success) { onUpdate({ ...s, promo_pourcentage: pct, promo_active: true, promo_nom: promoNom || null, promo_debut: promoDebut || null, promo_fin: promoFin || null }); setPromoId(null) }
    } catch (e) {}
    setSavingPromo(false)
  }

  async function handlePromoRemove(s: Service) {
    setSavingPromo(true)
    try {
      const res = await fetch('/api/pro/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set_promo', id: s.id, promo_pourcentage: null, promo_active: false, promo_nom: null, promo_debut: null, promo_fin: null }) })
      const data = await res.json()
      if (data.success) { onUpdate({ ...s, promo_pourcentage: null, promo_active: false, promo_nom: null, promo_debut: null, promo_fin: null }); setPromoId(null) }
    } catch (e) {}
    setSavingPromo(false)
  }

  async function handleSaveEdit(s: Service) {
    if (!editNom || !editPrix || !editDuree) return
    setSavingEdit(true)
    try {
      const res = await fetch('/api/pro/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_service', id: s.id, nom: editNom, description: editDescription, prix: editPrix, duree: editDuree, categorie_service: editCategorie || s.categorie_service }) })
      const data = await res.json()
      if (data.success) { onUpdate(data.service); setEditingId(null) }
    } catch (e) {}
    setSavingEdit(false)
  }

  async function handleAdd() {
    if (!nom || !prix || !duree || !categorie) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/pro/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add_service', nom, description: descriptionService, prix, duree, categorie_service: categorie }) })
      const data = await res.json()
      if (data.success) { onAdd(data.service); setNom(''); setDescriptionService(''); setPrix(''); setDuree('30'); setCategorie(CATEGORIES_SERVICES[0]); setShowForm(false) }
    } catch (e) {}
    setSubmitting(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette prestation ?')) return
    try {
      const res = await fetch('/api/pro/settings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_service', id }) })
      const data = await res.json()
      if (data.success) onDelete(id)
    } catch (e) {}
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, margin: 0 }}>Vos prestations</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ background: showForm ? '#eee' : OR, color: showForm ? NOIR : '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{showForm ? 'Annuler' : '+ Ajouter'}</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', padding: 25, borderRadius: 8, marginBottom: 25, border: `2px solid ${OR}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div className="responsive-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
            
            {/* Categorie - select fixe */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Categorie *</label>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)} style={inputStyle}>
                {CATEGORIES_SERVICES.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            {/* Nom libre */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nom de la prestation *</label>
              <input type="text" placeholder="Ex: Balayage californien, Pose gel UV..." value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} />
            </div>

            {/* Description optionnelle */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description (optionnelle)</label>
              <textarea placeholder="Decrivez la prestation en quelques mots..." value={descriptionService} onChange={(e) => setDescriptionService(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} rows={2} />
            </div>

            <div><label style={labelStyle}>Prix (DA) *</label><input type="number" placeholder="1500" value={prix} onChange={(e) => setPrix(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Duree *</label><select value={duree} onChange={(e) => setDuree(e.target.value)} style={inputStyle}><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1h</option><option value="90">1h30</option><option value="120">2h</option><option value="180">3h</option></select></div>
          </div>
          <button onClick={handleAdd} disabled={submitting || !nom || !prix || !categorie} style={{ background: OR, color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: submitting || !nom || !prix || !categorie ? 0.5 : 1, width: '100%' }}>{submitting ? 'Ajout en cours...' : 'Ajouter la prestation'}</button>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center', color: '#888' }}>Aucune prestation configuree. Cliquez sur &quot;+ Ajouter&quot; pour commencer.</div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{cat}</h4>
            <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {items.map((s, i) => (
                <div key={s.id} style={{ padding: '16px 20px', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  {editingId === s.id ? (
                    <div>
                      <div className="responsive-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Categorie</label>
                          <select value={editCategorie} onChange={e => setEditCategorie(e.target.value)} style={inputStyle}>
                            {CATEGORIES_SERVICES.map(c => (<option key={c} value={c}>{c}</option>))}
                            {/* Garder l'ancienne categorie si elle n'est pas dans la liste */}
                            {!CATEGORIES_SERVICES.includes(editCategorie) && editCategorie && (<option value={editCategorie}>{editCategorie}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Nom</label>
                          <input type="text" value={editNom} onChange={e => setEditNom(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Description (optionnelle)</label>
                          <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Description courte..." style={{ ...inputStyle, resize: 'vertical' }} rows={2} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Prix (DA)</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="number" value={editPrix} onChange={(e) => setEditPrix(e.target.value)} style={{ ...inputStyle, textAlign: 'right' }} /><span style={{ fontSize: 13, color: '#888' }}>DA</span></div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Duree</label>
                          <select value={editDuree} onChange={(e) => setEditDuree(e.target.value)} style={inputStyle}><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1h</option><option value="90">1h30</option><option value="120">2h</option><option value="180">3h</option></select>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                          <button onClick={() => handleSaveEdit(s)} disabled={savingEdit} style={{ background: OR, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', flex: 1 }}>{savingEdit ? '...' : 'OK'}</button>
                          <button onClick={cancelEdit} style={{ background: '#eee', color: NOIR, border: 'none', padding: '8px 14px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1 }}>Annuler</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="responsive-row">
                        <div className="responsive-info">
                          <div>
                            <span style={{ fontWeight: 700, color: NOIR, fontSize: 15, display: 'block', marginBottom: 2 }}>{s.nom}</span>
                            {(s as any).description && <span style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>{(s as any).description}</span>}
                            <span style={{ color: '#aaa', fontSize: 12 }}>{s.duree} min</span>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}>
                            {s.promo_active && s.promo_pourcentage ? (
                              <div>
                                <span style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>{s.prix} DA</span>
                                <div style={{ fontWeight: 800, color: '#d32f2f', fontSize: 15 }}>{Math.round(s.prix - (s.prix * s.promo_pourcentage / 100))} DA</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                                  <span style={{ background: '#d32f2f', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 4px', borderRadius: 3, display: 'inline-block' }}>-{s.promo_pourcentage}%</span>
                                </div>
                                {s.promo_nom && <div style={{ fontSize: 11, fontWeight: 800, color: OR, marginTop: 2 }}>&#10024; {s.promo_nom}</div>}
                                {s.promo_debut && s.promo_fin && (
                                  <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{new Date(s.promo_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(s.promo_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontWeight: 800, color: OR, fontSize: 15 }}>{s.prix} DA</span>
                            )}
                          </div>
                        </div>
                        <div className="responsive-actions">
                          <button onClick={() => { 
                            setPromoId(s.id); 
                            setPromoPct(s.promo_pourcentage ? String(s.promo_pourcentage) : ''); 
                            setPromoNom(s.promo_nom || ''); 
                            setPromoDebut(s.promo_debut || ''); 
                            setPromoFin(s.promo_fin || '') 
                          }} style={{ background: s.promo_active ? '#fff0f0' : 'transparent', border: `1px solid ${s.promo_active ? '#ffcccb' : '#ddd'}`, color: s.promo_active ? '#d32f2f' : '#666', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                            {s.promo_active ? '% Promo' : '+ Promo'}
                          </button>
                          <button onClick={() => startEdit(s)} style={{ background: 'transparent', border: '1px solid #ddd', color: '#444', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Modifier</button>
                          <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: '1px solid #fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Supprimer</button>
                        </div>
                      </div>
                      
                      {promoId === s.id && (
                        <div style={{ marginTop: 15, padding: '14px', background: '#FFF8F8', borderRadius: 6, border: '1px solid #ffcccb', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#d32f2f' }}>Configurer la promotion :</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, color: '#888' }}>-</span>
                            <input type="number" value={promoPct} onChange={(e) => setPromoPct(e.target.value)} placeholder="20" min="1" max="99" style={{ width: 80, padding: '8px', border: '2px solid #d32f2f', borderRadius: 4, fontSize: 14, fontWeight: 700, textAlign: 'center', fontFamily: 'Inter, sans-serif' }} />
                            <span style={{ fontSize: 13, fontWeight: 700 }}>% de reduction</span>
                          </div>
                          
                          <div style={{ width: '100%' }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Nom de l&apos;offre (Optionnel)</label>
                            <input 
                              list="promo-events"
                              type="text" 
                              value={promoNom} 
                              onChange={e => setPromoNom(e.target.value)} 
                              placeholder="Choisissez dans la liste ou tapez un nom..." 
                              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} 
                            />
                            <datalist id="promo-events">
                              <option value="Special Aid El Fitr" />
                              <option value="Special Aid El Adha" />
                              <option value="Promo Ramadan" />
                              <option value="Offre Mariage" />
                              <option value="Journee de la Femme (8 Mars)" />
                              <option value="Soldes d'ete" />
                              <option value="Soldes d'hiver" />
                              <option value="Black Friday" />
                              <option value="Nouvel An" />
                              <option value="Yennayer" />
                            </datalist>
                          </div>

                          {promoPct && parseInt(promoPct) > 0 && parseInt(promoPct) < 100 && (
                            <span style={{ fontSize: 13, color: '#666' }}>Nouveau prix : <strong>{Math.round(s.prix - (s.prix * parseInt(promoPct) / 100))} DA</strong></span>
                          )}
                          
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%' }}>
                            <div style={{ flex: '1 1 140px' }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Debut de la promo</label>
                              <input type="date" value={promoDebut} onChange={e => setPromoDebut(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: '1 1 140px' }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Fin de la promo</label>
                              <input type="date" value={promoFin} onChange={e => setPromoFin(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button onClick={() => handlePromoSave(s)} disabled={savingPromo} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', flex: 1 }}>{savingPromo ? '...' : 'Activer'}</button>
                            {s.promo_active && (<button onClick={() => handlePromoRemove(s)} disabled={savingPromo} style={{ background: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', padding: '8px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', flex: 1 }}>Retirer</button>)}
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
