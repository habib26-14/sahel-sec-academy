import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

/**
 * Callback OAuth Google + confirmation d'email + réinitialisation de mot
 * de passe : échange le code d'autorisation contre une session, puis redirige.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  // Anti open-redirect : seuls les chemins internes sont acceptés.
  const next = searchParams.get('next') ?? '/tableau-de-bord'
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') ? next : '/tableau-de-bord'

  if (code) {
    // Anti force-brute : 5 échanges de code par minute.
    if (!rateLimit(`oauth-code:${code}`, 5, 60_000)) {
      return NextResponse.redirect(`${origin}/connexion?error=rate`)
    }

    // Les liens de réinitialisation pointent toujours vers la page de
    // nouveau mot de passe, quel que soit le paramètre `next` fourni.
    const recovery = type === 'recovery' ? '/reinitialiser-mot-de-passe' : null

    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${recovery ?? safeNext}`)
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`)
}