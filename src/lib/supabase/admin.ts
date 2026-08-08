import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

let admin: SupabaseClient | null = null

/**
 * Client Supabase avec la clé `service_role` — usage STRICTEMENT serveur :
 * génération de certificats, uploads storage privilégiés, URLs signées.
 * Il contourne RLS : ne jamais l'utiliser avec des données clients.
 */
export function getAdminClient(): SupabaseClient {
  if (admin) return admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !serviceRoleKey) {
    throw new Error('Variables Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  admin = createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return admin
}