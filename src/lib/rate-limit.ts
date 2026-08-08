/**
 * Rate limiting simple en mémoire (fenêtre glissante).
 * Suffisant pour un déploiement Vercel mono-région ; pour du multi-région
 * il faudrait un store partagé (Upstash Redis, etc.).
 */
type Bucket = { timestamps: number[] }
const buckets = new Map<string, Bucket>()

/**
 * @returns false si la limite est dépassée, true sinon.
 */
export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  let bucket = buckets.get(key)
  if (!bucket) {
    bucket = { timestamps: [] }
    buckets.set(key, bucket)
  }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs)
  if (bucket.timestamps.length >= limit) return false
  bucket.timestamps.push(now)
  // Élagage pour éviter les fuites mémoire sur les vieilles clés
  if (buckets.size > 10_000) {
    const expired: string[] = []
    buckets.forEach((b, k) => {
      if (b.timestamps.every((t) => now - t >= windowMs)) expired.push(k)
    })
    expired.forEach((k) => buckets.delete(k))
  }
  return true
}