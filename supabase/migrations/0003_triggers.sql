-- ============================================================
-- Sahel Sec Academy — Migration 3 : Trigger création automatique du profil
-- À exécuter dans le SQL Editor Supabase APRÈS la migration RLS.
-- Ordre : 1) init Prisma → 2) buckets → 3) RLS → 4) celui-ci
-- ============================================================

-- Les colonnes @updatedAt (Prisma) n'ont pas de défaut en base :
-- sans cela, tout INSERT qui omet updated_at (trigger, PostgREST, backfill)
-- échoue avec une violation NOT NULL.
alter table public.profiles alter column updated_at set default now();
alter table public.courses alter column updated_at set default now();

-- Crée automatiquement la ligne `profiles` à chaque nouvel utilisateur Supabase Auth.
-- full_name provient des métadonnées d'inscription (option data.full_name du signUp).
-- SECURITY DEFINER : la fonction s'exécute avec les droits de son propriétaire
-- (supabase_admin), ce qui lui permet d'écrire malgré RLS activée.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id::text,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'STUDENT'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger sur auth.users (schéma interne Supabase)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Re-création du profil manquante pour les comptes déjà existants (rattrapage one-shot)
insert into public.profiles (id, email, full_name, role)
select u.id::text, u.email,
       coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)),
       'STUDENT'
from auth.users u
left join public.profiles p on p.id = u.id::text
where p.id is null
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Fonction utilitaire (applicatif) : nombre de tentatives d'un quiz
-- Utilisée par l'API pour le rate limiting applicatif.
-- ------------------------------------------------------------

create or replace function public.quiz_attempt_count(p_quiz_id text, p_user_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.quiz_attempts
  where quiz_id = p_quiz_id and user_id = p_user_id::text
$$;

grant execute on function public.quiz_attempt_count(text, uuid) to authenticated, service_role;

-- ------------------------------------------------------------
-- Fonction utilitaire (applicatif) : progression complète d'un cours ?
-- 1 = toutes les leçons marquées terminées + tous les quiz réussis.
-- ------------------------------------------------------------

create or replace function public.course_is_complete(p_course_id text, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    not exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where m.course_id = p_course_id
      and not exists (
        select 1 from public.progress pr
        where pr.lesson_id = l.id and pr.user_id = p_user_id::text and pr.completed
      )
    )
    and not exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.quizzes q on q.lesson_id = l.id
      where m.course_id = p_course_id
      and not exists (
        select 1 from public.quiz_attempts qa
        where qa.quiz_id = q.id and qa.user_id = p_user_id::text and qa.passed
      )
    )
$$;

grant execute on function public.course_is_complete(text, uuid) to authenticated, service_role;