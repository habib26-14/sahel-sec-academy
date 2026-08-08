# Audit de sécurité — Sahel Sec Academy

Date : 8 août 2026 — Portée : application Next.js 14.2.35 + Supabase
Méthode : revue de code manuelle (fichier:ligne), vérifications SQL en base, `npm audit`, smoke tests HTTP.

Légende : ✅ conforme · ⚠️ risque résiduel/amélioration · ❌ corrigé au cours de cet audit (avec la correction en référence)

---

## 1. Inventaire — surface d'attaque

| Surface | Exposition | Statut |
|---|---|---|
| Pages publiques : `/`, `/cours`, `/cours/[slug]`, `/verification`, `/verification/[code]`, `/connexion`, `/inscription`, `/mot-de-passe-oublie` | anon | ✅ |
| Pages authentifiées : `/tableau-de-bord`, leçons | authenticated | ✅ |
| Pages staff : `/admin*` | INSTRUCTOR/ADMIN — garde `requireStaff()` `src/lib/auth.ts:40-44` | ✅ |
| 4 API routes (quiz submit, leçon complete, certificat download, callback) | auth + CSRF + rate limit | ✅ |
| 8 Server Actions (`auth.ts` ×3, `admin.ts` ×9) | auth + Zod | ✅ |
| RPCs : `verify_certificate`, `quiz_attempt_count`, `course_is_complete` | durci (v. §2.5) | ✅ |

Aucun endpoint de debug dans le bundle (`/logout` GET supprimé → 405). Pas de repo git → pas d'historique exposable (`git status` : absent).

## 2. Configuration Supabase — RLS, politiques, rôles

### 2.1 RLS activée
✅ RLS activée sur les 8 tables (`supabase/migrations/0002_rls_policies.sql:14-22`). Vérifié en base : aucune table publique sans `enable_row_level_security`.

### 2.2 ❌ Élévation de privilège — CORRIGÉ (Critique avant correction)
La policy `profiles self update` autorisait `UPDATE` sur sa propre ligne **sans restriction de colonnes** : tout étudiant pouvait passer `role = 'ADMIN'` via PostgREST (le code ignore le champ mais l'API ne le bloquait pas).

**Correction** — `supabase/migrations/0006_security_hardening.sql` (appliquée) :
```sql
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
```
Vérifié en base : `authenticated` ne possède plus `UPDATE` que sur `full_name`. Le rôle devient immuable via l'API. Un futur changement de rôle devra passer par SQL/service_role.

### 2.3 ❌ Fuite d'emails entre utilisateurs — CORRIGÉE
La policy `profiles public read` (`USING(true)`) était justifiée (nom/rôle publics pour certificats/auteurs), mais le rôle `authenticated` conservait `SELECT` sur **toutes** les colonnes → lecture des emails de tout le monde via PostgREST.

**Correction** — migration 0006 :
```sql
revoke select on public.profiles from authenticated;
grant select (id, full_name, role) on public.profiles to authenticated;
```
Le code ne lit plus `profiles.email` (`src/lib/auth.ts` lit l'email depuis le JWT : `user.email`), donc aucun impact applicatif. Vérifié en base : colonnes `email`+`created_at`+`updated_at` non accordées.

### 2.4 ❌ quiz_questions — anti-triche anonyme — CORRIGÉE
`correct_index` (les bonnes réponses) était lisible par `anon`.

**Correction** — migration 0006 : `anon` ne lit plus que `(id, quiz_id, question, choices, "order")`. `authenticated` conserve l'accès complet (nécessaire au corrigé serveur de l'API de soumission).

**Complément code** — `correct_index` n'est plus envoyé au navigateur (v. §10).

### 2.5 ❌ Fonctions SQL — droits d'exécution par défaut — CORRIGÉE
`quiz_attempt_count` et `course_is_complete` (SECURITY DEFINER) restaient exécutables par `public`/`anon`. Migration 0006 :
```sql
revoke execute on function public.quiz_attempt_count(text, uuid) from public, anon;
grant execute ... to authenticated, service_role;
-- idem course_is_complete
```
`verify_certificate` reste **publique** par conception (vérification publique de certificats, ne renvoie que nom/cours/date).

### 6. Storage
✅ Policies `course-media` : lecture publique, insert/update staff avec restriction dossier `covers/` + rôle (`0004_storage_hardening.sql:50-60`).
❌ **DELETE staff sans restriction de dossier — CORRIGÉE** (`0006`) : la policy delete vérifie désormais `folder(name)==covers/` + rôle, alignée sur l'insert.
✅ Bucket `certificates` : privé, policy owner-read/owner-delete (`cert-policy.mjs`, `0004_storage_hardening.sql`).

## 3. API Routes

| Route | Auth | CSRF | Rate limit | Statut |
|---|---|---|---|---|
| `POST /api/quiz/[lessonId]/submit` (`src/app/api/quiz/[lessonId]/submit/route.ts`) | ✅ session (`:23-28`) | ✅ `assertSecureRequest` (Origin + `x-sahel-csrf: 1`) `:18-20` | ✅ 10/min/utilisateur/leçon (`:30-32`) | ✅ |
| `GET /api/lessons/[lessonId]/complete` | ✅ session | ✅ POST only | — | ✅ |
| `GET /api/certificates/[id]/download` | ✅ session + **ownership** (`:29`) | — | ✅ 30/min/utilisateur (ajouté) | ✅ |
| `GET/POST /logout` | — | ✅ | ❌ GET — **CORRIGÉ** : route GET supprimée (`src/app/logout/route.ts`), 405 désormais. Le header utilisait `<Link href="/logout">` (`header.tsx:38`) → remplacé par un `<form action={signOutAction}>` POST | ✅ |

## 4. Server Actions & validation

✅ **Validation Zod systématique côté serveur** : `src/lib/validations.ts` (login, register, course, module, lesson, quiz, soumission quiz) ; aucun `any` exploitable ; `quizSubmissionSchema` limite les réponses (`:90-96`).
✅ `requireStaff()` sur toutes les actions admin (`src/lib/actions/admin.ts:17-20`).
✅ Règles métier dans les actions admin :
  – transitions de statut autorisées uniquement (`admin.ts:118-123`) → une action ne peut pas publier en sautant les étapes ;
  – suppression bloquée si progression/certificats existent (`admin.ts:153-162, 224-231, 371-379, 532-541`) → pas de perte de données.
✅ Déplacements de modules/leçons à base de requêtes explicites (`admin.ts:244-262, 391-409`).

## 5. Authentification & sessions

- Mot de passe : Zod `min(8)` max 128 (`validations.ts:9-12`), hash Argon2/Bcrypt par Supabase GoTrue.
- Confirmation d'email **activée** (vérifié : `GET /auth/v1/settings` → `mailer_autoconfirm: false`).
- Anti-énumération inscription : même réponse pour tous les échecs (`auth.ts:66-75`) ; anti force-brute 3/min/email (`:52`).
- Login : message générique `'Email ou mot de passe incorrect.'` (`:31`) + rate limit 5/min/email (`:25`) + **nouveau :** limite complémentaire par IP (20/min, anti-blocage de compte par force-brute ciblé).
- ❌ **Mot de passe oublié absent — CORRIGÉ (nouvelle fonctionnalité)** :
  – `src/lib/actions/auth.ts` : `forgotPasswordAction` (anti-spam 3/min/email + 10/min/IP, anti-énumération : réponse identique) et `resetPasswordAction` (lien à usage unique — Supabase, session de récupération requise).
  – `src/app/mot-de-passe-oublie/page.tsx`, `src/app/reinitialiser-mot-de-passe/page.tsx` + 2 composants de formulaire.
  – Callback `src/app/auth/callback/route.ts` : gère désormais `type=recovery` (redirection vers `/reinitialiser-mot-de-passe`, jamais l'open-redirect `next`), + rate limit 5/min par code.
  – Lien « Mot de passe oublié ? » ajouté au formulaire de connexion.
  - Expiration du lien : **1 heure** (défaut Supabase) ✓.
- ✅ OAuth Google (`src/components/auth/google-button.tsx`) prévu ; **provider désactivé côté dashboard** → action manuelle (cf. §13).
- Session cookies : HTTPOnly + SameSite=Lax gérés par `@supabase/ssr` (`src/lib/supabase/server.ts`, `middleware.ts` — rafraîchissement du jeton + propagation des cookies). Secure délégué à HTTPS du déploiement.
- Logout : GET supprimé, plus de logout par forgery (déjà-vu §3) ✓.

## 6. Rate limiting (état global)

| Cible | Mécanisme | Statut |
|---|---|---|
| Login | 5/min/email + 20/min/IP | ✅ |
| Inscription | 3/min/email + 5/min/IP | ✅ |
| Quiz submit | 10/min/utilisateur/leçon | ✅ |
| Download certificat | 30/min/utilisateur | ✅ (ajouté) |
| Vérification certificat (`/verification/[code]`) | 20/min/code + 120/min global | ✅ (ajouté) |
| Échange code OAuth/recovery | 5/min/code | ✅ (ajouté) |
| Demandes reset password | 3/min/email + 10/min/IP | ✅ (ajouté) |

⚠️ **Résidu** : `src/lib/rate-limit.ts` est un cache **en mémoire** (Map) — efficace en mono-instance (Vercel, une région, une fonction), **inefficace si multi-région ou plusieurs fonctions**. À remplacer par Upstash/Redis dès que le déploiement se diversifie.

## 7. Secrets & dépendances

- ❌ **`scripts/debug-cert4.ts` contenait identifiants en clair** (`instructeur@sahelsec.academy` / mot de passe, UID, COURSE) — **CORRIGÉ** : tout passe par l'environnement (`DEBUG_EMAIL`, `DEBUG_PASSWORD`, `DEBUG_UID`, `DEBUG_COURSE_ID`, exit si manquants).
- ❌ `prisma/seed.ts`/`seed-red-team.ts` : mots de passe démo en dur — **CORRIGÉ** (`SEED_DEMO_PASSWORD ?? '…'`).
- ✅ `.env` : `.git` absent ; `SUPABASE_SERVICE_ROLE_KEY` nommée et commentée « serveur uniquement » ; utilisée uniquement dans `src/lib/supabase/admin.ts` (server-side). Requêtes brutes PostgREST aucune trace de la clé.
- ✅ `.env` : les lignes commentées avec ancien mot de passe DB supprimées (hygiène).
- ❌ **CVE Next.js (`npm audit --omit=dev`, majeur)** :
  - `GHSA-h25m-26qc-wcjf` — RSC deserialization DoS — high, fix < 15.0.8 ;
  - `GHSA-9g9p-9gw9-jx7f` — Image Optimizer DoS (serveur) ;
  - `GHSA-ggv3-7p47-pfv8` — request smuggling.
  - `next@14.2.35` = **dernière release 14.x** → aucun correctif en 14 ; **la migration majeure vers Next 15+ est requise** (à traiter comme décision de sprint dédié : `next upgrade`, vérif `useFormState`→`useActionState`, paramètres `params/searchParams` async, `headers()/cookies()` async).
- ⚠️ `rejectUnauthorized: false` dans 2 scripts de dev (`cert-policy.mjs:7`, `apply-supabase-migrations.mjs:33`) : outils locaux uniquement, commentés (jamais livrés au serveur).

## 8. Headers & CSP

`src/next.config.mjs` :
- ✅ `poweredByHeader: false` ;
- ✅ `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/interest-cohort off) ;
- ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains` ;
- ⚠️ `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (CSP) : nécessaire en partie à Next 14 (bootstrap `unsafe-inline`) ; le `unsafe-eval` n'est pas nécessaire en prod → **candidat au retrait**, à valider avec la montée v15. img-src `https:` (leviers images Medium/CDN ok).

## 9. Gestion d'erreurs — fuites `error.message`

- ❌ **16 occurrences de `Erreur : ${error.message}` dans `src/lib/actions/admin.ts`** — CORRIGÉ : helper `friendlyError()` (`src/lib/actions/admin.ts:17-24`) qui journalise `console.error` côté serveur et renvoie un message générique au client.
- ❌ `src/app/api/quiz/[lessonId]/submit/route.ts:84` — CORRIGÉ (message générique + console.error).
- ❌ `src/components/admin/cover-uploader.tsx:38` — CORRIGÉ (message générique).
- ✅ `certificates.ts` : erreurs stockées serveur try/catch non-bloquant (pas renvoyées au client).
- ✅ Log : pas de `console.log` de données sensibles (sessions, tokens) trouvés.

## 10. Énumération

- Login : message 100% identique quel que soit le résultat (`auth.ts`), aucune API de « vérifier si email exists » côté client.
- Inscription : réponse `{ok:true}` identique à tous (compte existant/erreur réseau) (`auth.ts:66-74`).
- Reset password : réponse identique si l'email existe ou non.
- Vérification de certificat : page générique « Aucun certificat » — combinée au rate limiting §6.
- ⚠️ `GET /auth/v1/settings` expose la configuration du projet (adresse du projet, providers) — comportement standard Supabase (non blocable côté app), ne fuite rien d'exploitable hors adresse de sous-domaine.

## 11. Logique métier — quiz & certificats

- ✅ **Scoring côté serveur immuable** : le client envoie les réponses, le serveur re-lit `correct_index` et calcule (`submit/route.ts:60-73`) ; impossible de tricher sur le score (row `quiz_attempts` écrit serveur).
- ✅ Tentatives : `quiz_attempts` RLS = lecture de ses propres lignes uniquement.
- ✅ Condition certificat : `computeCompletion` (serveur, toutes leçons + tous quiz passés) + `ensureCertificate` (service_role) ; l'API de téléchargement re-vérifie l'ownership (`download/route.ts:29`).
- ✅ Codes de certificat : 20 caractères générés, `verify_certificate` ne renvoie que nom/cours/date.
- ❌ Anti-triche par inspection du bundle corrigé : `correct_index` n'est plus dans le HTML (`cours/[slug]/lecon/[lessonId]/page.tsx` select sans `correct_index` ; `quiz-player.tsx` colore depuis `result.details.correctIndex` serveur). Nouveau type `QuizQuestionPublic` (`types.ts`).
- ⚠️ Restant : un utilisateur authentifié peut toujours interroger `quiz_questions` via l'API PostgREST (droit nécessité par la correction serveur). Alternative plus stricte (fonction SECURITY DEFINER `grade_attempt` + revok colonne pour authenticated) à évaluer si la triche devient un problème réel.

## 13. Actions manuelles (dashboard / external)

| # | Action | Où | Risque sans elle |
|---|---|---|---|
| 1 | **Activer le provider Google** : Google Cloud Console → OAuth client (redirect URI `https://vmywhbcwmlsjgxhzwwxp.supabase.co/auth/v1/callback`) puis Supabase → Authentication → Providers → Google | Dashboard Supabase + Google | Bouton Google inerte (code en place) |
| 2 | **Mettre à jour Next.js 14 → 15/16** pour GHSA-h25m-26qc-wcjf etc. | dev | CVE high non corrigées en 14 |
| 3 | Sécurité → Auth → « Minimum password length » : 8 (état global équiv. au Zod) | Dashboard Supabase | Politique mdp non alignée côté GoTrue |
| 4 | Vérifier l'expiration des liens mail (1 h par défaut) | Dashboard Supabase | — |
| 5 | (Option) HSTS `preload` après enregistrement | Dashboard Vercel → headers | — |
| 6 | Si passage multi-région : rate limiting Redis/Upstash | lib/rate-limit.ts | Limites in-memory par instance |
| 7 | En prod : `NODE_ENV=production` + check https (Secure cookie auto) ; clé de rotation SESSION si exposée | env | — |

## Récapitulatif des corrections appliquées (code)

- `supabase/migrations/0006_security_hardening.sql` — RLS : profiles (élévation de rôle + email), quiz_questions (anon), functions EXECUTE, storage delete covers/ — **appliquée et vérifiée en base** ✅
- `src/app/logout/route.ts` + `src/components/header.tsx` — logout POST uniquement (anti-CSRF)
- `src/lib/auth.ts` — profile sans email (post-restriction colonnes)
- `src/app/cours/[slug]/lecon/[lessonId]/page.tsx` + `src/components/learn/quiz-player.tsx` + `src/lib/types.ts` — anti-triche `correct_index` hors bundle, filtre `user_id` sur les tentatives
- `src/lib/actions/auth.ts` — forgot/reset password, rate limit IP complémentaire
- `src/app/auth/callback/route.ts` — gestion `type=recovery` + rate limit code
- `src/app/api/certificates/[id]/download/route.ts` — ownership `eq(user_id)` + rate limit
- `src/app/verification/[code]/page.tsx` — rate limit code + global
- `src/lib/actions/admin.ts` — 16 fuites `error.message` → génériques + console.error
- `src/app/api/quiz/[lessonId]/submit/route.ts` — idem
- `src/components/admin/cover-uploader.tsx` — limite 8 Mo avant compression
- Nouveaux : `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe` (2 pages + 2 formulaires)
- Secrets : `scripts/debug-cert4.ts`, `prisma/seed*.ts` → env ; `.env` nettoyé

**Vérification finale** : typecheck ✓ · `next build` ✓ · smoke test (pages 200, `/logout` GET=405, POST fonctionnel) ✓ · contrôles SQL post-migration ✓

Risques résiduels assumés : rate limiting in-memory (mono-instance), `unsafe-eval` CSP en 14, accès API possible aux bonnes réponses par un étudiant authentifié (score inviolable), CVEs Next 14 (migration planifiée).