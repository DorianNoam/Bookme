'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const NOIR = '#0A0A0A';
const OR = '#B8922A';
const BG = '#F8F5F0';

interface QRCodeSalonProps {
  salonNom: string;
  salonUrl: string;
}

export default function QRCodeSalon({ salonNom, salonUrl }: QRCodeSalonProps) {
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!salonUrl) return;
    QRCode.toDataURL(salonUrl, {
      width: 400,
      margin: 1,
      color: { dark: NOIR, light: '#FFFFFF' },
    })
      .then(setPreview)
      .catch(() => setPreview(''));
  }, [salonUrl]);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleDownload = async () => {
    setLoading(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(salonUrl, {
        width: 1000,
        margin: 1,
        color: { dark: NOIR, light: '#FFFFFF' },
      });

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      doc.setFillColor(248, 245, 240);
      doc.rect(0, 0, pageW, pageH, 'F');

      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageW, 45, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(30);
      const bookme = 'Bookme';
      const dz = 'dz';
      const bookmeW = doc.getTextWidth(bookme);
      const totalW = bookmeW + doc.getTextWidth(dz);
      const startX = (pageW - totalW) / 2;
      doc.setTextColor(255, 255, 255);
      doc.text(bookme, startX, 27);
      doc.setTextColor(184, 146, 42);
      doc.text(dz, startX + bookmeW, 27);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(200, 200, 200);
      doc.text('Reservation en ligne', pageW / 2, 37, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(10, 10, 10);
      doc.text(salonNom, pageW / 2, 78, { align: 'center', maxWidth: pageW - 40 });

      const qrSize = 100;
      const qrX = (pageW - qrSize) / 2;
      const qrY = 95;
      const pad = 8;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(184, 146, 42);
      doc.setLineWidth(1);
      doc.roundedRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 4, 4, 'FD');
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(10, 10, 10);
      doc.text('Scannez pour prendre rendez-vous', pageW / 2, qrY + qrSize + pad + 22, {
        align: 'center',
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(184, 146, 42);
      doc.text(salonUrl, pageW / 2, qrY + qrSize + pad + 32, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Propulse par Bookmedz - bookmedz.dz', pageW / 2, pageH - 15, {
        align: 'center',
      });

      doc.save(`qrcode-${slugify(salonNom) || 'salon'}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la generation du PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${OR}33`,
        borderRadius: 'clamp(8px, 2vw, 12px)',
        padding: 'clamp(16px, 4vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(12px, 3vw, 20px)',
        maxWidth: 420,
      }}
    >
      <h3
        style={{
          margin: 0,
          color: NOIR,
          fontSize: 'clamp(16px, 3.5vw, 20px)',
          fontWeight: 700,
        }}
      >
        QR Code du salon
      </h3>
      <p style={{ margin: 0, color: '#555', fontSize: 'clamp(12px, 2.8vw, 14px)', textAlign: 'center' }}>
        Telechargez et imprimez ce QR code. Vos clients le scannent pour arriver
        directement sur votre page de reservation.
      </p>

      {preview ? (
        <div
          style={{
            background: '#FFFFFF',
            border: `2px solid ${OR}`,
            borderRadius: 8,
            padding: 12,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="QR code du salon" style={{ width: 180, height: 180, display: 'block' }} />
        </div>
      ) : (
        <div style={{ width: 204, height: 204, background: BG, borderRadius: 8 }} />
      )}

      <button
        onClick={handleDownload}
        disabled={loading || !salonUrl}
        style={{
          width: '100%',
          background: NOIR,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'clamp(6px, 1.5vw, 10px)',
          padding: 'clamp(10px, 2.5vw, 14px)',
          fontSize: 'clamp(13px, 3vw, 15px)',
          fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading || !salonUrl ? 0.6 : 1,
        }}
      >
        {loading ? 'Generation...' : 'Telecharger le PDF a imprimer'}
      </button>
    </div>
  );
}
