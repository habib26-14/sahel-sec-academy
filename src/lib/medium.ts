import { XMLParser } from 'fast-xml-parser'
import { CYBERVICE_RSS_URL, MEDIUM_REVALIDATE_SECONDS } from '@/lib/constants'

export interface CyberViceArticle {
  title: string
  link: string
  excerpt: string
  image: string | null
  pubDate: string | null
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function firstImage(html: string): string | null {
  const re = /<img[^>]+src=["']([^"']+)["']/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const src = match[1]
    // Medium injecte un pixel de tracking (/_/stat?) : on le saute.
    if (!src.includes('/_/stat?')) return src
  }
  return null
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/** fast-xml-parser (v5) enveloppe les CDATA dans { __cdata: '...' }. */
function unwrap(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const cdata = (value as Record<string, unknown>).__cdata
    if (typeof cdata === 'string') return cdata
  }
  return ''
}

/**
 * Récupère les derniers articles CyberVice depuis le flux RSS Medium.
 * Résultat mis en cache par Next.js (data cache) et revalidé toutes les
 * MEDIUM_REVALIDATE_SECONDS — Medium n'est pas appelé à chaque visite.
 */
export async function getCyberViceArticles(limit = 4): Promise<CyberViceArticle[]> {
  try {
    const res = await fetch(CYBERVICE_RSS_URL, {
      next: { revalidate: MEDIUM_REVALIDATE_SECONDS },
      headers: {
        'user-agent': 'SahelSecAcademy/1.0 (+https://sahalsec.academy)',
        accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })
    if (!res.ok) return []

    const xml = await res.text()
    const parser = new XMLParser({
      ignoreAttributes: true,
      parseTagValue: false,
      trimValues: true,
      cdataPropName: '__cdata',
    })
    const doc = parser.parse(xml)
    const channel = doc?.rss?.channel
    if (!channel) return []

    const items = asArray<Record<string, unknown>>(channel.item).slice(0, limit)
    return items.map((item) => {
      const content: string = unwrap(item['content:encoded']) || unwrap(item.description)
      const description: string =
        unwrap(item.description) || unwrap(item['content:encoded'])
      const image = firstImage(content) ?? firstImage(description)
      return {
        title: unwrap(item.title).trim() || 'Article sans titre',
        link: unwrap(item.link).trim() || '#',
        excerpt: stripHtml(description).slice(0, 220),
        image,
        pubDate: unwrap(item.pubDate) || null,
      }
    })
  } catch {
    // Jamais bloquant : le widget retombe proprement sur un état vide.
    return []
  }
}