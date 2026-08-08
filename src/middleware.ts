import { createClient } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

/**
 * Middleware : rafraîchit la session Supabase à chaque navigation
 * et synchronise les cookies de session (expiration, refresh).
 */
export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)

  // Force le rafraîchissement du jeton si nécessaire
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    // Exclut les ressources statiques et images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)',
  ],
}