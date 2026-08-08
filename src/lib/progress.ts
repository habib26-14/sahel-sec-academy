import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import {
  generateCertificatePdf,
  uploadCertificatePdf,
  type CertificateParams,
} from '@/lib/certificates'
import { formatDateFr } from '@/lib/utils'
import type { CertificateRow, QuizQuestionRow } from '@/lib/types'

export interface GradedQuestion {
  questionId: string
  correct: boolean
  chosen: number
  correctIndex: number
}

export interface GradingResult {
  score: number
  passed: boolean
  correct: number
  total: number
  details: GradedQuestion[]
}

/** Corrige une soumission côté serveur (jamais de confiance portée au client). */
export function gradeQuiz(
  questions: Pick<QuizQuestionRow, 'id' | 'correct_index'>[],
  answers: Record<string, number>,
  passingScore: number,
): GradingResult {
  const total = questions.length
  let correct = 0
  const details: GradedQuestion[] = questions.map((q) => {
    const chosen = answers[q.id]
    const ok = typeof chosen === 'number' && chosen === q.correct_index
    if (ok) correct++
    return { questionId: q.id, correct: ok, chosen, correctIndex: q.correct_index }
  })
  const score = total === 0 ? 0 : Math.round((correct / total) * 100)
  return { score, passed: score >= passingScore, correct, total, details }
}

export interface Completion {
  totalLessons: number
  doneLessons: number
  totalQuizzes: number
  passedQuizzes: number
  completed: boolean
}

/**
 * Conditions de certificat : TOUTES les leçons du cours terminées
 * ET tous les quiz du cours validés (au moins une tentative `passed`).
 */
export async function computeCompletion(
  userId: string,
  courseId: string,
): Promise<Completion> {
  const supabase = createSupabaseClient()

  const [lessonRes, quizRes, progressRes, attemptRes] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, modules!inner(course_id)')
      .eq('modules.course_id', courseId),
    supabase
      .from('quizzes')
      .select('id, lesson_id, lessons!inner(modules!inner(course_id))')
      .eq('lessons.modules.course_id', courseId),
    supabase
      .from('progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true),
    supabase.from('quiz_attempts').select('quiz_id').eq('user_id', userId).eq('passed', true),
  ])

  const quizIds = (quizRes.data ?? []).map((q) => q.id)
  const doneLessonIds = new Set((progressRes.data ?? []).map((p) => p.lesson_id))
  const passedQuizIds = new Set((attemptRes.data ?? []).map((a) => a.quiz_id))

  const totalLessons = (lessonRes.data ?? []).length
  const doneLessons = (lessonRes.data ?? []).filter((l) =>
    doneLessonIds.has(l.id),
  ).length

  return {
    totalLessons,
    doneLessons,
    totalQuizzes: quizIds.length,
    passedQuizzes: quizIds.filter((id) => passedQuizIds.has(id)).length,
    completed:
      totalLessons > 0 &&
      doneLessons === totalLessons &&
      quizIds.every((id) => passedQuizIds.has(id)),
  }
}

/**
 * Génère le certificat si les conditions sont remplies et qu'aucun certificat
 * n'existe pour ce couple (user, course). Le PDF est inséré via service_role
 * (bypass RLS) dans le bucket privé `certificates`.
 */
export async function ensureCertificate(
  userId: string,
  courseId: string,
): Promise<CertificateRow | null> {
  const supabase = createSupabaseClient()

  const existing = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle<CertificateRow>()
  if (existing.data) return existing.data

  const completion = await computeCompletion(userId, courseId)
  if (!completion.completed) return null

  // C1 : aucun certificat pour un cours non publié.
  const [profileRes, courseRes, modulesRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
    supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .eq('status', 'PUBLISHED')
      .maybeSingle(),
    // Compétences validées : titres des modules du cours (ordre du plan).
    supabase
      .from('modules')
      .select('title')
      .eq('course_id', courseId)
      .order('order', { ascending: true }),
  ])
  if (!courseRes.data) return null

  const verificationCode = crypto.randomUUID()
  const issuedAt = new Date().toISOString()

  const params: CertificateParams = {
    learnerName: profileRes.data?.full_name ?? 'Apprenant·e',
    courseTitle: courseRes.data.title,
    issuedAt,
    verificationCode,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sahelsec.academy',
    skills: (modulesRes.data ?? []).map((m) => m.title),
  }

  const pdfBytes = await generateCertificatePdf(params)
  const storagePath = await uploadCertificatePdf(userId, courseId, pdfBytes)

  const admin = getAdminClient()
  const { data: cert, error } = await admin
    .from('certificates')
    .insert({
      user_id: userId,
      course_id: courseId,
      verification_code: verificationCode,
      pdf_url: storagePath,
    })
    .select('*')
    .maybeSingle<CertificateRow>()

  if (error || !cert) {
    throw new Error(`Création certificat : ${error?.message ?? 'échec insertion'}`)
  }
  return cert
}

export { formatDateFr }