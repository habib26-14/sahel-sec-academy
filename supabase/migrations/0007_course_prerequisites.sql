-- ============================================================
-- Sahel Sec Academy — Migration 7 : prérequis de cours
-- Ajout d'un champ libre "prérequis" (texte, optionnel) au cours.
-- Idempotent : peut être ré-exécuté.
-- ============================================================

alter table public.courses
  add column if not exists prerequisites text;

comment on column public.courses.prerequisites is
  'Prérequis conseillés avant de suivre le cours (texte libre, un par ligne).';