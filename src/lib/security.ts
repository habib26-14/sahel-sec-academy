import type { NextRequest } from 'next/server'

/**
 * Vérifie que la requête provient bien de notre propre origine
 * (protection CSRF sur les mutations API). Les navigateurs envoient
 * systématiquement l'en-tête Origin sur les POST cross-site.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // non-browser / navigations même-origine
  try {
    return new URL(origin).host === request.nextUrl.host
  } catch {
    return false
  }
}

/** En-tête custom exigé par nos endpoints de mutation (anti-CSRF renforcé). */
export const CSRF_HEADER = 'x-sahel-csrf'

export function hasCsrfHeader(request: NextRequest): boolean {
  return request.headers.get(CSRF_HEADER) === '1'
}

export function assertSecureRequest(request: NextRequest): boolean {
  return isSameOrigin(request) && hasCsrfHeader(request)
}

export function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'local'
}