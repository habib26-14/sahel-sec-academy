-- ============================================================
-- Sahel Sec Academy — Migration 1 : Buckets Storage
-- À exécuter dans le SQL Editor Supabase (ou via `npm run db:migrate:supabase`)
-- Ordre d'exécution : 1) init Prisma (schéma) → 2) celui-ci → 3) RLS → 4) triggers
-- Idempotent : peut être rejoué sans doublons.
-- ============================================================

-- Bucket privé : certificats PDF
insert into storage.buckets (id, name, public, file_size_limit)
values ('certificates', 'certificates', false, 5242880)
on conflict (id) do nothing;

-- Bucket public : images de couverture et médias de cours
insert into storage.buckets (id, name, public, file_size_limit)
values ('course-media', 'course-media', true, 10485760)
on conflict (id) do nothing;

-- ============================================================
-- Policies storage.objects
-- ============================================================

-- course-media : lecture publique (les URLs sont publiques)
drop policy if exists "course-media public read" on storage.objects;
create policy "course-media public read"
  on storage.objects for select
  using (bucket_id = 'course-media');

-- course-media : upload/modif par tout utilisateur authentifié
-- (les rôles INSTRUCTOR/ADMIN gèrent le contenu ; un STUDENT peut uploader un avatar éventuel)
drop policy if exists "course-media authenticated insert" on storage.objects;
create policy "course-media authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'course-media');

drop policy if exists "course-media authenticated update" on storage.objects;
create policy "course-media authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'course-media')
  with check (bucket_id = 'course-media');

-- certificates : accès strictement privé.
-- Les téléchargements passent par des URLs signées générées côté serveur
-- (clé service_role), elles sont donc autorisées sans policy de lecture directe.
-- Le propriétaire peut malgré tout lire ses propres objets (sécurité renforcée).
drop policy if exists "certificates owner read" on storage.objects;
create policy "certificates owner read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "certificates owner delete" on storage.objects;
create policy "certificates owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text);
