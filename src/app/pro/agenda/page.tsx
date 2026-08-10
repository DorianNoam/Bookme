'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import LogoutButton from '../components/LogoutButton';

const OR = '#B8922A';
const NOIR = '#0A0A0A';
const BG = '#F8F5F0';

const HEURES = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

// Liste statique pour l'exemple (à dynamiser plus tard avec la table employes)
const EMPLOYES = [
  { id: 1, nom: 'Yasmina' },
  { id: 2, nom: 'Amel' },
  { id: 3, nom: 'Souad' }
];

export default function ProAgenda() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [loading, setLoading] = useState(true);
  
  // États des modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // États du formulaire
  const [selectedEmploye, setSelectedEmploye] = useState(1);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [activeRdv, setActiveRdv] = useState<any>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/pro/reservations');
      const data = await res.json();
      if (data.reservations) {
        setReservations(data.reservations);
      }
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const nextDay = () => setCurrentDate(addDays(currentDate, 1));

  // Ouvrir modale AJOUT
  const handleSlotClick = (employeId: number, heure: string) => {
    setSelectedEmploye(employeId);
    setSelectedTime(heure.length === 4 ? `0${heure}` : heure);
    setClientName('');
    setServiceName('');
    setServicePrice('');
    setIsAddModalOpen(true);
  };

  // Ouvrir modale MODIFICATION
  const handleRdvClick = (e: React.MouseEvent, rdv: any) => {
    e.stopPropagation();
    setActiveRdv(rdv);
    setSelectedEmploye(rdv.employe_id);
    const dateObj = new Date(rdv.date_rdv);
    setSelectedTime(dateObj.toTimeString().substring(0, 5));
    setIsEditModalOpen(true);
  };

  // Soumettre un nouveau RDV manuel
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateRdv = `${format(currentDate, 'yyyy-MM-dd')}T${selectedTime}:00`;
    
    const res = await fetch('/api/pro/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        employe_id: selectedEmploye, 
        client_nom: clientName, 
        service_nom: serviceName, 
        service_prix: servicePrice, 
        date_rdv: dateRdv 
      })
    });

    if (res.ok) {
      fetchReservations(); // On recharge la liste depuis le serveur
      setIsAddModalOpen(false);
    } else {
      alert("Erreur lors de l'ajout.");
    }
  };

  // Soumettre un déplacement
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateRdv = `${format(currentDate, 'yyyy-MM-dd')}T${selectedTime}:00`;

    const res = await fetch(`/api/pro/reservations/${activeRdv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        employe_id: selectedEmploye, 
        date_rdv: dateRdv 
      })
    });

    if (res.ok) {
      fetchReservations();
      setIsEditModalOpen(false);
    } else {
      alert("Erreur lors de la modification.");
    }
  };

  const rdvDuJour = reservations.filter(r => {
    if (!r.date_rdv) return false;
    return format(new Date(r.date_rdv), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
  });

  const totalCA = rdvDuJour.reduce((acc, rdv) => acc + (rdv.service_prix || 0), 0);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER PRO */}
      <header style={{ background: NOIR, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>
          Bookme<span style={{ color: OR }}>.dz</span> <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>Pro</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 14, fontWeight: 600, alignItems: 'center' }}>
          <Link href="/pro/dashboard" style={{ color: '#aaa', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/pro/agenda" style={{ color: OR, textDecoration: 'none' }}>Agenda</Link>
          <Link href="/pro/settings" style={{ color: '#aaa', textDecoration: 'none' }}>Param.</Link>
          <LogoutButton />
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        
        {/* BARRE DE CONTROLES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
            <button style={{ padding: '8px 24px', background: NOIR, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Jour</button>
            <button style={{ padding: '8px 24px', background: '#fff', color: NOIR, border: 'none', borderLeft: '1px solid #ddd', fontWeight: 600, cursor: 'pointer' }}>Semaine</button>
            <button style={{ padding: '8px 24px', background: '#fff', color: NOIR, border: 'none', borderLeft: '1px solid #ddd', fontWeight: 600, cursor: 'pointer' }}>Mois</button>
            <button onClick={() => setCurrentDate(new Date())} style={{ padding: '8px 24px', background: '#fff', color: OR, border: 'none', borderLeft: '1px solid #ddd', fontWeight: 600, cursor: 'pointer' }}>Aujourd&apos;hui</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#fff', padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd' }}>
            <button onClick={prevDay} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 4, width: 32, height: 32, cursor: 'pointer' }}>←</button>
            <span style={{ fontWeight: 800, fontSize: 18, minWidth: 240, textAlign: 'center', textTransform: 'capitalize' }}>
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </span>
            <button onClick={nextDay} style={{ background: NOIR, color: '#fff', border: 'none', borderRadius: 4, width: 32, height: 32, cursor: 'pointer' }}>→</button>
          </div>
        </div>

        {/* GRILLE AGENDA */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' }}>
            <div style={{ width: 80, flexShrink: 0, borderRight: '1px solid #eee' }}></div>
            {EMPLOYES.map(emp => (
              <div key={emp.id} style={{ flex: 1, padding: '16px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid #eee', color: NOIR }}>
                {emp.nom}
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Chargement de l&apos;agenda...</div>
          ) : (
            HEURES.map(heure => (
              <div key={heure} style={{ display: 'flex', borderBottom: '1px solid #f5f5f5', minHeight: 70 }}>
                <div style={{ width: 80, flexShrink: 0, borderRight: '1px solid #eee', padding: '8px', color: '#888', fontSize: 13, textAlign: 'center', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  {heure}
                </div>
                
                {EMPLOYES.map(emp => {
                  const rdvIci = rdvDuJour.find(r => 
                    r.employe_id === emp.id && 
                    format(new Date(r.date_rdv), 'H:mm') === heure
                  );

                  return (
                    <div 
                      key={`${emp.id}-${heure}`} 
                      onClick={() => handleSlotClick(emp.id, heure)}
                      style={{ flex: 1, borderRight: '1px solid #f5f5f5', position: 'relative', cursor: 'pointer', padding: 4 }}
                      className="agenda-slot"
                    >
                      {rdvIci && (
                        <div 
                          onClick={(e) => handleRdvClick(e, rdvIci)}
                          style={{ background: '#FCF9F2', borderLeft: `4px solid ${OR}`, padding: '8px 12px', borderRadius: 4, height: '100%', cursor: 'grab', transition: 'box-shadow 0.2s' }}
                          className="rdv-card"
                        >
                          <div style={{ fontWeight: 800, fontSize: 12, color: NOIR }}>{rdvIci.client_nom}</div>
                          <div style={{ fontSize: 11, color: '#666', margin: '4px 0' }}>{rdvIci.service_nom}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: OR }}>{rdvIci.service_prix} DA</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
          
          <div style={{ display: 'flex', padding: '16px 24px', background: '#fafafa', borderTop: '1px solid #ddd', justifyContent: 'space-between', fontWeight: 700, color: NOIR }}>
            <div>{rdvDuJour.length} rendez-vous</div>
            <div style={{ color: OR }}>{totalCA} DA</div>
          </div>
        </div>
      </div>

      {/* MODALE : AJOUTER UN RDV MANUEL */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 450, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: 24, color: NOIR, fontWeight: 900 }}>Bloquer un créneau</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <select value={selectedEmploye} onChange={e => setSelectedEmploye(Number(e.target.value))} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6, outline: 'none' }}>
                  {EMPLOYES.map(emp => <option key={emp.id} value={emp.id}>{emp.nom}</option>)}
                </select>
                <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6, outline: 'none' }} />
              </div>

              <input type="text" placeholder="Nom du client (ou motif)" value={clientName} onChange={e => setClientName(e.target.value)} required style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, width: '100%', outline: 'none' }} />
              <input type="text" placeholder="Prestation" value={serviceName} onChange={e => setServiceName(e.target.value)} required style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, width: '100%', outline: 'none' }} />
              <input type="number" placeholder="Prix (DA)" value={servicePrice} onChange={e => setServicePrice(e.target.value)} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, width: '100%', outline: 'none' }} />

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#666' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: 14, background: NOIR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : MODIFIER UN RDV EXISTANT */}
      {isEditModalOpen && activeRdv && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 450, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: 8, color: NOIR, fontWeight: 900 }}>Modifier le rendez-vous</h2>
            <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Client : <strong style={{ color: NOIR }}>{activeRdv.client_nom}</strong></p>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Déplacer le créneau</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <select value={selectedEmploye} onChange={e => setSelectedEmploye(Number(e.target.value))} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6, outline: 'none' }}>
                  {EMPLOYES.map(emp => <option key={emp.id} value={emp.id}>{emp.nom}</option>)}
                </select>
                <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6, outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#666' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: 14, background: OR, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .agenda-slot:hover { background: #fdfdfd; }
        .rdv-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
      `}} />
    </div>
  );
}
