-- ============================================================
-- Sahel Sec Academy — Migration 4 : Durcissement Storage (H1)
-- Restreint les écritures sur `course-media` au staff
-- (INSTRUCTOR/ADMIN) et au dossier covers/ uniquement.
-- Idempotent : peut être rejoué sans doublons.
-- ============================================================

-- Supprime les policies larges créées en 0001
-- (tout utilisateur authentifié pouvait écrire).
drop policy if exists "course-media authenticated insert" on storage.objects;
drop policy if exists "course-media authenticated update" on storage.objects;

-- Insert réservé au staff (INSTRUCTOR/ADMIN) + dossier covers/.
drop policy if exists "course-media staff insert" on storage.objects;
create policy "course-media staff insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-media'
    and (storage.foldername(name))[1] = 'covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- Update réservé au staff (dossier covers/).
drop policy if exists "course-media staff update" on storage.objects;
create policy "course-media staff update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'course-media'
    and (storage.foldername(name))[1] = 'covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  )
  with check (
    bucket_id = 'course-media'
    and (storage.foldername(name))[1] = 'covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );

-- Delete réservé au staff.
drop policy if exists "course-media staff delete" on storage.objects;
create policy "course-media staff delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-media'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()::text and p.role in ('INSTRUCTOR', 'ADMIN')
    )
  );