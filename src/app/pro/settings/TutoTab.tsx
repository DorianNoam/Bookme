'use client'

const NOIR = '#0A0A0A'
const OR = '#B8922A'

type TutoVideo = {
  titre: string
  description: string
  url: string
  duree?: string
}

type TutoCategorie = {
  categorie: string
  videos: TutoVideo[]
}

// ═══════════════════════════════════════════════════════════════════
// Pour ajouter une video :
// 1. Uploadez le fichier dans Supabase > Storage > bucket "tutoriels"
// 2. Copiez l'URL publique (bouton "Copy URL" sur le fichier)
// 3. Ajoutez une entree ci-dessous
// ═══════════════════════════════════════════════════════════════════
const TUTORIELS: TutoCategorie[] = [
  {
    categorie: 'Prise en main',
    videos: [
      {
        titre: 'Decouvrir votre tableau de bord',
        description: 'Un tour rapide des statistiques et de votre agenda.',
        url: 'https://VOTRE-PROJET.supabase.co/storage/v1/object/public/tutoriels/dashboard.mp4',
        duree: '2 min',
      },
    ],
  },
  {
  {
    categorie: 'Gerer vos prestations',
    videos: [
      {
        titre: 'Ajouter une prestation',
        description: 'Creer une nouvelle prestation avec prix et duree.',
        url: 'https://nnrozegyirqxjpkqghxi.supabase.co/storage/v1/object/public/tutoriels/Prestations.mp4',
      },
    ],
  },
      {
        titre: 'Importer votre carte via une photo (IA)',
        description: 'Scannez votre menu de prestations, l\'IA le remplit automatiquement.',
        url: 'https://VOTRE-PROJET.supabase.co/storage/v1/object/public/tutoriels/import-ia.mp4',
      },
    ],
  },
  {
    categorie: 'Agenda & rendez-vous',
    videos: [
      {
        titre: 'Gerer votre agenda',
        description: 'Vues jour/semaine/mois, fermetures exceptionnelles.',
        url: 'https://VOTRE-PROJET.supabase.co/storage/v1/object/public/tutoriels/agenda.mp4',
      },
    ],
  },
  {
    categorie: 'QR Code & partage',
    videos: [
      {
        titre: 'Telecharger votre QR code',
        description: 'Imprimez-le pour que vos clients reservent en scannant.',
        url: 'https://VOTRE-PROJET.supabase.co/storage/v1/object/public/tutoriels/qr-code.mp4',
      },
    ],
  },
]

export default function TutoTab() {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: NOIR, marginBottom: 8 }}>Tutoriels video</h3>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 28 }}>
        Des videos courtes pour bien demarrer et exploiter toutes les fonctionnalites de Bookmedz.
      </p>

      {TUTORIELS.map((cat) => (
        <div key={cat.categorie} style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            {cat.categorie}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {cat.videos.map((v) => (
              <div key={v.titre} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
                <video controls preload="metadata" style={{ width: '100%', display: 'block', background: NOIR, aspectRatio: '16 / 9' }}>
                  <source src={v.url} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture video.
                </video>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: NOIR, fontSize: 14 }}>{v.titre}</span>
                    {v.duree && <span style={{ fontSize: 11, color: OR, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{v.duree}</span>}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#888', margin: '6px 0 0 0', lineHeight: 1.5 }}>{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
