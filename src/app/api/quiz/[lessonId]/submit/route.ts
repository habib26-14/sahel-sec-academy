import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { assertSecureRequest } from '@/lib/security'
import { gradeQuiz, ensureCertificate } from '@/lib/progress'
import { quizSubmissionSchema } from '@/lib/validations'
import type { QuizQuestionRow } from '@/lib/types'

/**
 * POST /api/quiz/[lessonId]/submit
 * Corrige immédiatement côté serveur, enregistre la tentative,
 * et vérifie les conditions de certificat du cours.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } },
) {
  if (!assertSecureRequest(request)) {
    return NextResponse.json({ error: 'Requête non autorisée' }, { status: 403 })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  if (!rateLimit(`quiz:${user.id}:${params.lessonId}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Trop de tentatives, patientez un instant.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }
  const parsed = quizSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Réponses invalides' }, { status: 400 })
  }

  // C1 : seul un quiz rattaché à un cours publié peut être soumis.
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, passing_score, lessons!inner(modules!inner(course_id, courses!inner(status)))')
    .eq('lesson_id', params.lessonId)
    .eq('lessons.modules.courses.status', 'PUBLISHED')
    .maybeSingle<{
      id: string
      passing_score: number
      lessons: { modules: { course_id: string; courses: { status: string } } }
    }>()
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz introuvable' }, { status: 404 })
  }

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, correct_index')
    .eq('quiz_id', quiz.id)
    .order('order', { ascending: true })
  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'Quiz sans question' }, { status: 500 })
  }

  const result = gradeQuiz(
    questions as Pick<QuizQuestionRow, 'id' | 'correct_index'>[],
    parsed.data.answers,
    quiz.passing_score,
  )

  const { error: attemptError } = await supabase.from('quiz_attempts').insert({
    quiz_id: quiz.id,
    user_id: user.id,
    score: result.score,
    passed: result.passed,
    answers: parsed.data.answers,
  })
  if (attemptError) {
    console.error('[quiz:submit]', attemptError.message)
    return NextResponse.json(
      { error: 'Enregistrement impossible, réessayez.' },
      { status: 500 },
    )
  }

  let certificateIssued = false
  if (result.passed) {
    try {
      certificateIssued =
        (await ensureCertificate(user.id, quiz.lessons.modules.course_id)) !== null
    } catch {
      // Non bloquant.
    }
  }

  return NextResponse.json({
    score: result.score,
    passed: result.passed,
    correct: result.correct,
    total: result.total,
    passingScore: quiz.passing_score,
    details: result.details,
    certificateIssued,
  })
}