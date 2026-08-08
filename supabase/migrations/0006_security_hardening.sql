-- ============================================================
-- Sahel Sec Academy — Migration 6 : durcissement de sécurité
-- Applique des restrictions au niveau colonne et corrige les
-- gaps identifiés lors de l'audit de sécurité.
-- Idempotent : peut être ré-exécuté.
-- ============================================================

-- ------------------------------------------------------------
-- 1) PROFILES — blocage de l'élévation de privilège
-- L'ancienne policy "profiles self update" autorisait UPDATE sur
-- sa propre ligne SANS restriction de colonnes : un utilisateur
-- pouvait se passer role = 'ADMIN' via PostgREST.
-- Correctif : l'utilisateur authentifié ne peut plus modifier
-- que la colonne full_name (le rôle devient immuable via l'API).
-- ------------------------------------------------------------

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ------------------------------------------------------------
-- 2) PROFILES — fuite d'emails entre utilisateurs connectés
-- La policy "profiles public read" (USING true) était justifiée
-- pour afficher nom/rôle (certificats, auteurs), mais le rôle
-- authenticated conservait les droits SELECT par défaut sur
-- TOUTES les colonnes, y compris email.
-- Correctif : authenticated ne lit que id, full_name, role.
-- ------------------------------------------------------------

revoke select on public.profiles from authenticated;
grant select (id, full_name, role) on public.profiles to authenticated;

-- ------------------------------------------------------------
-- 3) QUIZ_QUESTIONS — anti-triche côté anonyme
-- correct_index (bonnes réponses) n'a pas à être lisible par un
-- visiteur non connecté. On restreint les colonnes pour le rôle
-- anon ; authenticated conserve l'accès (nécessaire au corrigé
-- côté serveur lors de la soumission).
-- ------------------------------------------------------------

revoke select on public.quiz_questions from anon;
grant select (id, quiz_id, question, choices, "order") on public.quiz_questions to anon;

-- ------------------------------------------------------------
-- 4) STORAGE — suppression alignée sur insert/update
-- La policy "course-media staff delete" ne vérifiait pas le
-- dossier covers/ contrairement à l'insert et l'update.
-- ------------------------------------------------------------

drop policy if exists "course-media staff delete" on storage.objects;
create policy "course-media staff delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-media'
    and (storage.foldername(name))[1] = 'covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- ------------------------------------------------------------
-- 5) FONCTIONS — réduction des droits d'exécution par défaut
-- Les fonctions utilitaires SECURITY DEFINER n'ont pas besoin
-- d'être exécutables par le rôle anon (EXECUTE est accordé à
-- PUBLIC par défaut). verify_certificate reste publique (elle
-- n'expose que nom/cours/date, usage /verification).
-- ------------------------------------------------------------

revoke execute on function public.quiz_attempt_count(text, uuid) from public, anon;
grant execute on function public.quiz_attempt_count(text, uuid) to authenticated, service_role;

revoke execute on function public.course_is_complete(text, uuid) from public, anon;
grant execute on function public.course_is_complete(text, uuid) to authenticated, service_role;
