import { z } from 'zod'
import { courseImportSchema, type CourseImportData } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export type CourseImportResult =
  | { ok: true; data: CourseImportData }
  | { ok: false; error: string }

/**
 * Formate une erreur zod en localisant précisément le chemin fautif
 * (ex. « Module 2 › Leçon 3 › Titre ») pour faciliter la correction du fichier.
 */
function formatZodIssue(issue: z.ZodIssue): string {
  const labels: Record<string, string> = {
    title: 'Titre',
    description: 'Description',
    prerequisites: 'Prérequis',
    level: 'Niveau',
    estimatedHours: 'Durée estimée',
    coverImageUrl: 'URL de couverture',
    modules: 'Modules',
    lessons: 'Leçons',
    quiz: 'Quiz',
    passingScore: 'Score de réussite',
    questions: 'Questions',
    question: 'Question',
    choices: 'Choix',
    correctIndex: 'Bonne réponse',
    contentType: 'Type de contenu',
    contentBody: 'Contenu',
    videoUrl: 'URL vidéo',
    transcript: 'Transcript',
    durationMin: 'Durée (min)',
    slug: 'Slug',
  }

  const parts: string[] = []
  for (const segment of issue.path) {
    if (typeof segment === 'number') {
      parts.push(`#${segment + 1}`)
    } else if (typeof segment === 'string') {
      parts.push(labels[segment] ?? segment)
    }
  }
  // Réécriture lisible : « Modules #1 › Leçons #3 › Titre : … »
  return `${parts.join(' › ')} : ${issue.message}`
}

/**
 * Parse et valide un fichier JSON d'import de cours.
 * Renvoie soit les données normalisées, soit un message d'erreur précis.
 */
export function parseCourseImport(raw: string): CourseImportResult {
  if (raw.length > 4 * 1024 * 1024) {
    return { ok: false, error: 'Le fichier est trop volumineux (4 Mo maximum).' }
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Fichier JSON illisible : la syntaxe du fichier est invalide.' }
  }

  const parsed = courseImportSchema.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: `Fichier invalide — ${formatZodIssue(first)}` }
  }

  return { ok: true, data: parsed.data }
}

/**
 * Génère un slug unique : slug fourni dans le fichier sinon dérivé du titre.
 * Le suffixe « -2 », « -3 »… est ajouté si le slug existe déjà côté base.
 */
export function resolveImportSlug(
  title: string,
  explicitSlug: string | undefined,
  existingSlugs: Set<string>,
): string {
  const base = (explicitSlug?.trim() || slugify(title)).toLowerCase()
  if (!existingSlugs.has(base)) return base
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`
    if (!existingSlugs.has(candidate)) return candidate
  }
  return `${base}-${Date.now()}`
}

/** Récap destiné au message flash après import. */
export function summarizeImport(data: CourseImportData): string {
  const lessonCount = data.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const quizCount = data.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.quiz).length,
    0,
  )
  return `Cours importé avec ${data.modules.length} module(s), ${lessonCount} leçon(s) et ${quizCount} quiz.`
}

export type { CourseImportData }