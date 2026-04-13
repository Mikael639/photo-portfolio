# Jerrypicsart Portfolio

Portfolio photo en Next.js + Tailwind + Framer Motion, avec back-office V1 pour publier des photos sans modifier le code.

## Prerequisites

- Node.js >= 20.9.0
- npm
- Projet Supabase

## Local setup

1. Installer les dependances:

```bash
npm install
```

2. Creer le fichier d'environnement:

```bash
cp .env.example .env.local
```

3. Remplir les variables dans `.env.local`:

- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL` (optionnel mais recommande pour les metadata, le sitemap et le partage social)
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_AUTO_REPLY_SUBJECT` (optionnel)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_API_KEY` (pour l'accès programmatique aux messages de contact)

Le formulaire Contact envoie un email via Resend vers `CONTACT_TO_EMAIL` et envoie aussi un accusé de reception automatique au client.

4. Appliquer le schema SQL dans Supabase:

- Ouvrir SQL Editor
- Executer `supabase/schema.sql`

5. Lancer le projet:

```bash
npm run dev
```

## Admin photos

- URL: `/admin/photos`
- Login avec `ADMIN_USERNAME` + `ADMIN_PASSWORD`
- Actions disponibles:
  - upload simple ou multiple (max 12 photos/envoi, 15MB max/fichier)
  - categorie
  - roles (`hero`, `featured`, `servicesBackground`)
  - publier/non publier
  - epingler en haut
  - supprimer

## Tri automatique des photos

Les photos sont triees ainsi:

1. `is_pinned DESC`
2. `created_at DESC`

Donc les nouvelles presta apparaissent automatiquement en haut.

## API

- Public: `GET /api/photos?category=...&limit=...`
- Contact:
  - `POST /api/contact` (envoi d'un message)
  - `GET /api/contact` (nécessite header `x-admin-key`)
- Admin auth:
  - `POST /api/admin/login`
  - `POST /api/admin/logout`
- Admin photos:
  - `GET /api/admin/photos`
  - `POST /api/admin/photos`
  - `PATCH /api/admin/photos`
  - `DELETE /api/admin/photos?id=...`

## Sécurité

> [!CAUTION]
> Ne jamais versionner les fichiers `.env.local` ou toute clé privée sur un dépôt public.

- Utilisez des secrets longs et complexes pour `ADMIN_SESSION_SECRET` et `ADMIN_API_KEY`.
- Les accès admin utilisent des signatures HMAC sécurisées pour les sessions.
- Le stockage Supabase est protégé par RLS (Row Level Security), assurez-vous que `supabase/schema.sql` est bien appliqué.
