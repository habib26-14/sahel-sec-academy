import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Anti-CSRF : la déconnexion n'est possible qu'en POST (formulaire).
// Le GET a été supprimé pour éviter la déconnexion forcée par simple image/lien.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url))
}