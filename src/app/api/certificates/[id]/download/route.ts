import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCertificateDownloadUrl } from '@/lib/certificates'
import { rateLimit } from '@/lib/rate-limit'
import type { CertificateRow } from '@/lib/types'

/**
 * GET /api/certificates/[id]/download
 * Génère une URL signée (bucket privé) et redirige vers le PDF.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // M1 : garde d'ownership explicite — seul le propriétaire télécharge son PDF.
  const { data: cert } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle<CertificateRow>()
  if (!cert) {
    return NextResponse.redirect(new URL('/tableau-de-bord', request.url))
  }

  // Anti-abuse : 30 téléchargements par minute et par utilisateur.
  if (!rateLimit(`cert-dl:${user.id}`, 30, 60_000)) {
    return NextResponse.json(
      { error: 'Trop de téléchargements, patientez un instant.' },
      { status: 429 },
    )
  }

  try {
    const signedUrl = await getCertificateDownloadUrl(cert.pdf_url, 300)
    return NextResponse.redirect(signedUrl)
  } catch {
    return NextResponse.json({ error: 'Téléchargement indisponible, réessayez.' }, { status: 500 })
  }
}