# Sahel Sec Academy

Plateforme e-learning **gratuite** et **open source** de cybersécurité, 100% en français,
ouverte à tous.

- Cours en trois niveaux progressifs (Découverte → Fondamentaux → Spécialisation)
- Leçons texte / vidéo + **transcriptions** intégrales
- **Quiz à correction immédiate** et suivi de progression
- **Certificats PDF vérifiables** (URL de vérification publique)
- Veille **CyberVice** intégrée (flux Medium + TikTok)
- Administration de contenu réservée aux rôles `INSTRUCTOR` / `ADMIN`

---

## Stack

| Brique | Choix |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS 3, icônes lucide-react |
| Auth / BDD / Storage / RLS | Supabase (GoTrue, Postgres, Storage, RLS) |
| ORM | Prisma 6 (schéma source de vérité, migration SQL initiale fournie) |
| PDF | pdf-lib (certificats A4 paysage) |
| RSS | fast-xml-parser (widget articles CyberVice) |

## Installation

Prérequis : Node.js ≥ 18.18, un projet Supabase, npm.

```bash
cd sahel-sec-academy
npm install
```

## Configuration

Copier `.env.example` en `.env` puis renseigner :

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé `service_role` (uniquement côté serveur) |
| `DATABASE_URL` | Connexion poolée (pgBouncer, port 6543) |
| `DIRECT_URL` | Connexion directe (port 5432) |
| `NEXT_PUBLIC_SITE_URL` | URL publique de production (ex : `https://academy.sahalsec.example`) |
| `MEDIUM_RSS_URL` | Flux RSS CyberVice : `https://medium.com/feed/@cybervice26` |
| `MEDIUM_REVALIDATE_SECONDS` | Cache du flux RSS (défaut `21600` = 6 h) |

### 1. Créer les tables (schéma)

Le schéma source de vérité est `prisma/schema.prisma`. La migration initiale est déjà
générée dans `prisma/migrations/` :

```bash
npx prisma migrate deploy
```

> Astuce : la migration initiale a été générée hors ligne via
> `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma`.
> Si vous modifiez le schéma, régénérez propres migrations avec `prisma migrate dev`.

### 2. Provisionner Supabase (Storage + RLS + triggers)

Exécuter dans l'ordre, dans le **SQL Editor de Supabase** (ou via la CLI) :

1. `supabase/migrations/0001_storage_buckets.sql` — buckets `certificates` (privé) et
   `course-media` (public, couvertures), policies Storage + dossier `covers/`.
2. `supabase/migrations/0002_rls_policies.sql` — Row Level Security sur toutes les
   tables + fonction publique `verify_certificate(text)` (SECURITY DEFINER).
3. `supabase/migrations/0003_triggers.sql` — trigger `handle_new_user` (création auto
   du profil), rattrapage des profils déjà présents, fonctions
   `count_attempts` / `course_completion_percentage` (informatives).

> Ordre impératif : migrations Prisma d'abord (tables), puis ces trois fichiers.

### 3. Démarrer

```bash
npm run dev        # http://localhost:3000
```

Lancer un build de production :

```bash
npm run build && npm start
```

## Contenu de démonstration (optionnel)

```bash
npm run db:seed
```

Crée (idempotent) :

- `instructeur@sahelsec.academy` / `SahelSec!2026` — rôle `INSTRUCTOR`
- `etudiant@sahelsec.academy` / `SahelSec!2026` — rôle `STUDENT`
- 1 cours publié avec module, leçon et quiz.

> Le seed utilise l'API Admin de Supabase (service_role), puis Prisma pour le contenu.

## Routes

| Page | URL |
|---|---|
| Accueil + carrousel CyberVice | `/` |
| Catalogue (filtre par niveau) | `/cours` |
| Fiche cours | `/cours/[slug]` |
| Leçon (lecture + transcription + quiz) | `/cours/[slug]/lecon/[lessonId]` |
| Tableau de bord apprenant | `/tableau-de-bord` |
| Vérification certificat | `/verification/[code]` |
| Administration | `/admin` |
| Connexion / Inscription | `/connexion`, `/inscription` |

Sécurité incluse : refresh de session via middleware, sessions côté serveur,
protection CSRF (`x-sahel-csrf`) sur les mutations, validation des formulaires par
Zod, RLS systématique, certificats émis via service_role, vérification publique
sans exposer les données.

## Licence

Usage libre pour la communauté Sahel Sec. Le contenu vidéo et articles
CyberVice restent la propriété de leurs auteurs.