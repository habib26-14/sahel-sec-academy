-- ============================================================
-- Sahel Sec Academy — Migration 2 : Row Level Security (RLS)
-- À exécuter dans le SQL Editor Supabase APRÈS la migration Prisma (tables existantes).
-- Ordre : 1) init Prisma → 2) buckets → 3) celui-ci → 4) triggers
-- ============================================================

-- Aide-mémoire : auth.uid()::text = uuid Supabase de l'utilisateur connecté.
-- Désactivation RLS temporaire interdite ; toute requête passe par une policy.

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.progress enable row level security;
alter table public.certificates enable row level security;

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------

-- Lecture publique : seulement nom + rôle (email et autres données jamais exposés)
drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"
  on public.profiles for select
  using (true);

-- Restriction au niveau colonne : l'anonyme (public) ne voit que id, full_name, role.
revoke select on public.profiles from anon;
grant select (id, full_name, role) on public.profiles to anon;

-- Chacun ne modifie que sa propre ligne
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
  on public.profiles for update
  using (auth.uid()::text = id)
  with check (auth.uid()::text = id);

-- Ligne créée par le trigger auth.signup (fonction SECURITY DEFINER) et par l'admin (service_role : bypass). Aucune policy d'insert n'est exposée à l'utilisateur authentifié.
drop policy if exists "profiles service insert" on public.profiles;
create policy "profiles service insert"
  on public.profiles for insert
  to service_role
  with check (true);

-- ------------------------------------------------------------
-- COURSES
-- ------------------------------------------------------------

-- Lecture publique des cours publiés
drop policy if exists "courses public read published" on public.courses;
create policy "courses public read published"
  on public.courses for select
  using (status = 'PUBLISHED');

-- L'auteur lit/écrit ses propres cours (même brouillon)
drop policy if exists "courses author all" on public.courses;
create policy "courses author all"
  on public.courses for all
  using (author_id = auth.uid()::text)
  with check (author_id = auth.uid()::text);

-- INSTRUCTOR / ADMIN : accès complet à tous les cours
drop policy if exists "courses instructor all" on public.courses;
create policy "courses instructor all"
  on public.courses for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- ------------------------------------------------------------
-- MODULES / LESSONS / QUIZZES / QUIZ_QUESTIONS
-- (lecture publique si le cours parent est PUBLISHED ;
--  écriture réservée à l'auteur du cours ou à INSTRUCTOR/ADMIN)
-- ------------------------------------------------------------

-- MODULES
drop policy if exists "modules public read published" on public.modules;
create policy "modules public read published"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.status = 'PUBLISHED'
    )
  );

drop policy if exists "modules author all" on public.modules;
create policy "modules author all"
  on public.modules for all
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  )
  with check (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

drop policy if exists "modules author read draft" on public.modules;
create policy "modules author read draft"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- LESSONS
drop policy if exists "lessons public read published" on public.lessons;
create policy "lessons public read published"
  on public.lessons for select
  using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.status = 'PUBLISHED'
    )
  );

drop policy if exists "lessons author all" on public.lessons;
create policy "lessons author all"
  on public.lessons for all
  using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  )
  with check (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- QUIZZES
drop policy if exists "quizzes public read published" on public.quizzes;
create policy "quizzes public read published"
  on public.quizzes for select
  using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.id = lesson_id and c.status = 'PUBLISHED'
    )
  );

drop policy if exists "quizzes author all" on public.quizzes;
create policy "quizzes author all"
  on public.quizzes for all
  using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.id = lesson_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  )
  with check (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.id = lesson_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- QUIZ_QUESTIONS
drop policy if exists "quiz_questions public read published" on public.quiz_questions;
create policy "quiz_questions public read published"
  on public.quiz_questions for select
  using (
    exists (
      select 1 from public.quizzes q
      join public.lessons l on l.id = q.lesson_id
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where q.id = quiz_id and c.status = 'PUBLISHED'
    )
  );

drop policy if exists "quiz_questions author all" on public.quiz_questions;
create policy "quiz_questions author all"
  on public.quiz_questions for all
  using (
    exists (
      select 1 from public.quizzes q
      join public.lessons l on l.id = q.lesson_id
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where q.id = quiz_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  )
  with check (
    exists (
      select 1 from public.quizzes q
      join public.lessons l on l.id = q.lesson_id
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where q.id = quiz_id and c.author_id = auth.uid()::text
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- ------------------------------------------------------------
-- QUIZ_ATTEMPTS — tentatives de quiz
-- L'utilisateur crée et lit uniquement SES tentatives.
-- INSTRUCTOR/ADMIN peuvent lire l'ensemble (suivi pédagogique).
-- ------------------------------------------------------------

drop policy if exists "quiz_attempts self insert" on public.quiz_attempts;
create policy "quiz_attempts self insert"
  on public.quiz_attempts for insert
  to authenticated
  with check (user_id = auth.uid()::text);

drop policy if exists "quiz_attempts self read" on public.quiz_attempts;
create policy "quiz_attempts self read"
  on public.quiz_attempts for select
  using (user_id = auth.uid()::text);

drop policy if exists "quiz_attempts staff read" on public.quiz_attempts;
create policy "quiz_attempts staff read"
  on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- ------------------------------------------------------------
-- PROGRESS
-- L'utilisateur ne lit / ne modifie que sa propre progression
-- ------------------------------------------------------------

drop policy if exists "progress self insert" on public.progress;
create policy "progress self insert"
  on public.progress for insert
  to authenticated
  with check (user_id = auth.uid()::text);

drop policy if exists "progress self select" on public.progress;
create policy "progress self select"
  on public.progress for select
  using (user_id = auth.uid()::text);

drop policy if exists "progress self update" on public.progress;
create policy "progress self update"
  on public.progress for update
  to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

drop policy if exists "progress self delete" on public.progress;
create policy "progress self delete"
  on public.progress for delete
  to authenticated
  using (user_id = auth.uid()::text);

drop policy if exists "progress staff read" on public.progress;
create policy "progress staff read"
  on public.progress for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- ------------------------------------------------------------
-- CERTS
-- L'utilisateur lit uniquement ses propres certificats.
-- L'insertion se fait via la clé service_role (server), qui contourne RLS.
-- La consultation publique /verify passe par la fonction verify_certificate
-- ci-dessous (SECURITY DEFINER), jamais par un accès direct à la table.
-- ------------------------------------------------------------

drop policy if exists "certificates self read" on public.certificates;
create policy "certificates self read"
  on public.certificates for select
  using (user_id = auth.uid()::text);

drop policy if exists "certificates staff read" on public.certificates;
create policy "certificates staff read"
  on public.certificates for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- ============================================================
-- Fonction publique de vérification de certificat (SECURITY DEFINER)
-- Expose UNIQUEMENT : nom de l'apprenant, titre du cours, date d'obtention
-- Exposée aux rôles anon + authenticated via /verify/[code]
-- ============================================================

create or replace function public.verify_certificate(p_code text)
returns table (
  learner_name    text,
  course_title    text,
  issued_at       timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select p.full_name, c.title, cert.issued_at
  from public.certificates cert
  join public.profiles p  on p.id = cert.user_id
  join public.courses  c  on c.id = cert.course_id
  where cert.verification_code = p_code
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated, service_role;