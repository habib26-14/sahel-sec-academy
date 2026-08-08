-- ============================================================
-- Sahel Sec Academy — Migration 5 : défauts d'`id` pour PostgREST
--
-- Problème : Prisma génère les ids (cuid) CÔTÉ CLIENT. En base,
-- les colonnes `id` n'ont AUCUN défaut : toute insertion passée
-- par PostgREST (l'API REST utilisée par les route handlers et les
-- server actions) qui omet `id` échoue avec une violation NOT NULL.
-- Exemples concrets : soumission de quiz (quiz_attempts), marquer
-- une leçon terminée (progress), création de module/lesson via
-- l'admin, etc.
--
-- Solution : poser gen_random_uuid()::text comme défaut sur toutes
-- les colonnes d'id applicatives. Idempotent.
-- ============================================================

alter table public.courses        alter column id set default gen_random_uuid()::text;
alter table public.modules        alter column id set default gen_random_uuid()::text;
alter table public.lessons        alter column id set default gen_random_uuid()::text;
alter table public.quizzes        alter column id set default gen_random_uuid()::text;
alter table public.quiz_questions alter column id set default gen_random_uuid()::text;
alter table public.quiz_attempts  alter column id set default gen_random_uuid()::text;
alter table public.progress       alter column id set default gen_random_uuid()::text;
alter table public.certificates   alter column id set default gen_random_uuid()::text;

-- vérification_code est aussi généré côté client (randomUUID) :
-- défaut pour les insertions qui l'omettraient.
alter table public.certificates alter column verification_code set default gen_random_uuid()::text;