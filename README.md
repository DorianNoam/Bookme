# Bookme.dz — Next.js + Supabase + Vercel

Plateforme de réservation en ligne pour salons de beauté, coiffure et spa.

## Stack technique

- **Frontend / Backend** : Next.js 14 (App Router)
- **Base de données** : Supabase (PostgreSQL)
- **Hébergement** : Vercel
- **Auth** : JWT (cookies httpOnly)
- **Email** : Nodemailer (SMTP)

---

## 🚀 Mise en ligne — étape par étape

### 1. Supabase — Créer la base de données

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Donner un nom (ex: `bookme`) → choisir une région → créer
3. Aller dans **SQL Editor** → coller le contenu de `supabase_schema.sql` → **Run**
4. Récupérer vos clés dans **Settings > API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. GitHub — Pousser le code

```bash
git init
git add .
git commit -m "Initial commit - Bookme Next.js"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/bookme.git
git push -u origin main
```

### 3. Vercel — Déployer

1. Aller sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importer votre repo GitHub `bookme`
3. Dans **Environment Variables**, ajouter toutes les variables de `.env.local.example` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (générer une chaîne aléatoire de 32+ caractères)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
   - `NEXT_PUBLIC_APP_URL` (l'URL Vercel de votre projet)
4. Cliquer **Deploy** ✅

### 4. Développement local

```bash
cp .env.local.example .env.local
# Remplir les variables dans .env.local

npm install
npm run dev
# → http://localhost:3000
```

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Page d'accueil
│   ├── search/               # Recherche de salons
│   ├── salon/[id]/           # Fiche salon
│   ├── booking/              # Réservation
│   ├── login/                # Connexion client
│   ├── register/             # Inscription client
│   ├── dashboard/            # Espace client
│   ├── profile/              # Profil utilisateur
│   ├── pro/                  # Espace professionnel
│   └── api/                  # Routes API
│       ├── auth/             # Login, register, logout
│       ├── salons/           # CRUD salons
│       ├── reservations/     # RDV + créneaux
│       └── avis/             # Notes et commentaires
├── lib/
│   └── supabase/             # Clients Supabase (client + server)
└── middleware.ts             # Protection des routes
```

---

## 🔄 Workflow de développement

Chaque `git push` sur `main` déclenche un déploiement automatique sur Vercel.

```bash
git add .
git commit -m "feat: ajout page salon"
git push
# → Vercel déploie automatiquement en 1-2 minutes
```
