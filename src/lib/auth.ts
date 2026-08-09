import { notFound, redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ProfileRow, SessionUser } from '@/lib/types'

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = createSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // L'email provient du JWT (user.email) : la colonne profiles.email
  // n'est plus lisible par les clients (durcissement RLS migration 0006).
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle<Pick<ProfileRow, 'id' | 'full_name' | 'role'>>()

  return {
    id: user.id,
    email: user.email ?? undefined,
    fullName: profile?.full_name ?? null,
    role: profile?.role ?? null,
  }
}

/** Redirige vers /connexion si non connecté (le login renvoie sur le tableau de bord). */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/connexion')
  }
  return user
}

export function isStaff(user: Pick<SessionUser, 'role'> | null): boolean {
  return user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'
}

/**
 * Garde des pages /admin : non connecté ou non staff → 404 (le chemin
 * n'existe pas pour eux : ni accessible, ni énumérable).
 */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user || !isStaff(user)) notFound()
  return user
}