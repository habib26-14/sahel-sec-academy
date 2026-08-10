export const SITE_NAME = 'Sahel Sec Academy'
export const COMPANY_NAME = 'Sahel Sec'

export const CYBERVICE_MEDIUM_URL = 'https://medium.com/@cybervice26'
export const CYBERVICE_TIKTOK_URL = 'https://www.tiktok.com/@cybervice26'
export const CYBERVICE_RSS_URL =
  process.env.MEDIUM_RSS_URL ?? 'https://medium.com/feed/@cybervice26'
export const MEDIUM_REVALIDATE_SECONDS = Number(
  process.env.MEDIUM_REVALIDATE_SECONDS ?? 600,
)

export const BUCKET_CERTIFICATES = 'certificates'
export const BUCKET_COURSE_MEDIA = 'course-media'

export const LEVELS = ['DECOUVERTE', 'FONDAMENTAUX', 'SPECIALISATION'] as const
export const STATUSES = ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'] as const
export const CONTENT_TYPES = ['TEXT', 'VIDEO', 'LAB'] as const

export const LEVEL_LABELS: Record<string, string> = {
  DECOUVERTE: 'Découverte',
  FONDAMENTAUX: 'Fondamentaux',
  SPECIALISATION: 'Spécialisation',
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  IN_REVIEW: 'En revue',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Texte',
  VIDEO: 'Vidéo',
  LAB: 'Atelier (lab)',
}

export const COURSE_LEVEL_DESCRIPTIONS: Record<string, string> = {
  DECOUVERTE: 'Pour débuter sans prérequis : concepts et vocabulaire essentiels.',
  FONDAMENTAUX: 'Les bases techniques solides : réseaux, systèmes, attaques courantes.',
  SPECIALISATION: 'Pratique avancée : exploitation, défense, conformité, OSINT.',
}