'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, isStaff } from '@/lib/auth'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '@/lib/validations'
import { absoluteUrl } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'

export type AuthActionState = { error?: string; ok?: boolean }

// Limites par IP (proxy Vercel) : évite qu'un attaquant bloque un compte
// cible en saturant la limite par email (verrouillage DoS).
function clientIp(): string {
  const fwd = headers().get('x-forwarded-for')
  return fwd?.split(',')[0]?.trim() ?? 'unknown'
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide' }
  }

  // Anti force-brute : 5 essais par minute et par email.
  if (!rateLimit(`login:${parsed.data.email}`, 5, 60_000)) {
    return { error: 'Trop de tentatives, patientez une minute avant de réessayer.' }
  }
  // Anti verrouillage DoS : complément par IP (20 essais/min/IP).
  if (!rateLimit(`login-ip:${clientIp()}`, 20, 60_000)) {
    return { error: 'Trop de tentatives, patientez une minute avant de réessayer.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Email ou mot de passe incorrect.' }

  revalidatePath('/', 'layout')
  // /admin n'est atteint que par cette redirection, juste après une
  // connexion staff (seul point d'entrée du chemin de gestion).
  const user = await getCurrentUser()
  redirect(isStaff(user) ? '/admin' : '/tableau-de-bord')
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide' }
  }

  // Anti force-brute : 3 inscriptions par minute et par email.
  if (!rateLimit(`register:${parsed.data.email}`, 3, 60_000)) {
    return { error: 'Trop de tentatives, patientez une minute avant de réessayer.' }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: absoluteUrl('/auth/callback'),
    },
  })

  // Anti-énumération : la même réponse est renvoyée pour tous les échecs
  // (compte existant, erreur réseau, etc.) que pour une réussite.
  if (error) {
    return { ok: true }
  }

  // Confirmation d'email activée sur le projet Supabase : pas de session immédiate
  if (!data.session) {
    return { ok: true }
  }

  revalidatePath('/', 'layout')
  redirect('/tableau-de-bord')
}

export async function signOutAction(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide' }
  }

  // Anti-spam de mails : 3 demandes/min/email, 10/min/IP.
  if (!rateLimit(`forgot:${parsed.data.email}`, 3, 60_000)) {
    return { ok: true }
  }
  if (!rateLimit(`forgot-ip:${clientIp()}`, 10, 60_000)) {
    return { ok: true }
  }

  const supabase = createClient()
  // Anti-énumération : réponse identique que l'email existe ou non.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: absoluteUrl('/auth/callback?type=recovery'),
  })
  return { ok: true }
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide' }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Le lien est à usage unique : s'il a déjà été consommé, l'utilisateur
  // n'a plus de session de récupération → redirection vers la demande de lien.
  if (!user) return { error: 'Lien expiré ou déjà utilisé, redemandez un nouveau lien.' }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: 'Réinitialisation impossible, réessayez.' }

  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/connexion?reset=ok')
}