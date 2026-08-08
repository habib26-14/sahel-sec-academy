import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth'
import LessonForm from '@/components/admin/lesson-form'
import QuizEditor from '@/components/admin/quiz-editor'
import type { LessonRow, QuizQuestionRow } from '@/lib/types'

export default async function EditLessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  await requireStaff()
  const supabase = createClient()
  const { id: courseId, lessonId } = params

  const { data: lesson } = await supabase
    .from('lessons')
    .select(
      'id, module_id, title, "order", content_type, content_body, video_url, transcript, duration_min',
    )
    .eq('id', lessonId)
    .maybeSingle<LessonRow>()
  if (!lesson) return <p>Leçon introuvable.</p>

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, passing_score')
    .eq('lesson_id', lessonId)
    .maybeSingle<{ id: string; passing_score: number }>()

  let questions: QuizQuestionRow[] = []
  if (quiz) {
    const { data: qs } = await supabase
      .from('quiz_questions')
      .select('id, quiz_id, question, choices, correct_index, "order"')
      .eq('quiz_id', quiz.id)
      .order('order', { ascending: true })
    questions = (qs ?? []) as QuizQuestionRow[]
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/cours/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au plan du cours
      </Link>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-navy">Contenu de la leçon</h2>
        <LessonForm courseId={courseId} lessonId={lessonId} initial={lesson} />
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-lg font-bold text-navy">Quiz</h2>
        <p className="mb-4 text-sm text-slate-500">
          Un quiz par leçon. L’apprenant doit réussir le quiz pour valider le cours
          et obtenir son certificat.
        </p>
        <QuizEditor lessonId={lessonId} courseId={courseId} quiz={quiz ? { ...quiz, questions } : null} />
      </div>
    </div>
  )
}