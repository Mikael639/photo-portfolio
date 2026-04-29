# Jerrypicsart Portfolio

Portfolio photo en Next.js pour Jerrypicsart, avec une galerie publique, une page d'accueil avec diaporama, une page À propos éditoriale et un back-office simple pour gérer les photos sans intervention développeur.

## Stack

- Next.js 16
- React 19
- Tailwind CSS
- Framer Motion
- GSAP
- Supabase pour la base de données
- Cloudflare R2 pour le stockage public des images
- Resend pour les messages de contact
- Vercel pour le déploiement

## Installation Locale

1. Installer les dépendances :

```bash
npm install
```

2. Créer le fichier d'environnement :

```bash
cp .env.example .env.local
```

3. Remplir les variables dans `.env.local`.

Variables principales :

- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_API_KEY`

4. Appliquer le schéma Supabase :

```text
supabase/schema.sql
```

5. Lancer le projet :

```bash
npm run dev
```

## Fonctionnement Des Images

Supabase sert principalement à stocker les informations des photos : titre, description, catégorie, rôles, statut de publication, etc.

Les fichiers image sont stockés dans Cloudflare R2. Cela permet d'éviter de consommer le quota Supabase Storage et de réduire le risque de dépassement du Cached Egress Supabase.

Les nouvelles images ajoutées depuis l'admin sont envoyées vers R2 si les variables R2 sont configurées.

## Page Admin

URL :

```text
/admin/photos
```

Connexion avec :

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Actions disponibles :

- importer une ou plusieurs photos
- choisir la catégorie
- publier ou masquer une photo
- épingler une photo
- supprimer une photo
- choisir les rôles d'affichage

Rôles disponibles :

- `Diaporama accueil` : affiche la photo dans le diaporama de la page d'accueil
- `Mise en avant` : rend la photo prioritaire dans certaines sélections
- `Fond` : peut servir d'image d'ambiance
- `Image approche` : peut servir à illustrer la section approche

Le diaporama de la page d'accueil est limité à 10 photos. L'admin bloque l'ajout si cette limite est atteinte.

## Galerie

Catégories principales :

- Events
- Fashion Week & Celebrities
- Studio
- Fashion Wedding

La galerie affiche :

- `Tout`
- puis chaque catégorie séparément

Tous les filtres utilisent désormais le même rendu encadré. La galerie charge 24 photos au départ, puis 24 photos supplémentaires avec le bouton `Voir plus`.

## Page D'accueil

La page d'accueil utilise les photos cochées `Diaporama accueil` dans l'admin.

Comportement actuel :

- maximum 10 photos
- autoplay du diaporama
- animations premium sur desktop
- animations simplifiées sur tablette pour éviter les saccades
- scroll natif sur tablette pour améliorer la fluidité

Après une modification dans l'admin, l'accueil peut mettre quelques minutes à refléter les changements à cause du cache.

## Page À Propos

La page À propos est une page éditoriale centrée sur le parcours de JerryPicsart.

Elle utilise deux portraits locaux :

- `public/images/about/jerrypicsart-profile-bw.jpeg`
- `public/images/about/jerrypicsart-portrait-blue.jpeg`

Ces images ne dépendent pas de Supabase ni de R2.

## Scripts Utiles

```bash
npm run lint
npm run build
npm run import:local-photos
npm run optimize:images
npm run migrate:images:r2
```

Scripts image :

- `scripts/import-local-photos.mjs` : importe des photos locales vers le projet
- `scripts/optimize-supabase-images.mjs` : ancien script d'optimisation Supabase
- `scripts/migrate-supabase-images-to-r2.mjs` : migre les images Supabase Storage vers R2

## API

Photos publiques :

```text
GET /api/photos?category=...&limit=...
```

Contact :

```text
POST /api/contact
GET /api/contact
```

Le `GET /api/contact` nécessite le header :

```text
x-admin-key
```

Admin auth :

```text
POST /api/admin/login
POST /api/admin/logout
GET /api/admin/session
```

Admin photos :

```text
GET /api/admin/photos
POST /api/admin/photos
PATCH /api/admin/photos
DELETE /api/admin/photos?id=...
```

## Déploiement Vercel

Ajouter les variables d'environnement une par une dans Vercel.

Ne pas importer tout le fichier `.env.local` si des variables sensibles ou locales y sont présentes.

À mettre dans Vercel :

- variables Supabase publiques et serveur
- variables R2
- variables admin
- variables Resend/contact

Ne jamais exposer en `NEXT_PUBLIC_` :

- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_SECRET_ACCESS_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_API_KEY`

## Sécurité

Ne jamais versionner :

- `.env.local`
- clés R2 privées
- clé Supabase service role
- mot de passe admin
- secrets de session

Le fichier `.env.example` sert uniquement de modèle et ne doit contenir aucune vraie clé.

## Vérification Avant Push

Avant de pousser :

```bash
npm run lint
npm run build
```

Puis :

```bash
git status -sb
```
