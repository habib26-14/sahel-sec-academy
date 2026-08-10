import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Menu,
  Monitor,
  PlayCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { getPublishedCourseBySlug, flattenLessons, getCourseProgress } from '@/lib/queries'
import { markdownToHtml } from '@/lib/markdown'
import MarkCompleteButton from '@/components/learn/mark-complete-button'
import TranscriptToggle from '@/components/learn/transcript-toggle'
import QuizPlayer from '@/components/learn/quiz-player'
import ProgressBar from '@/components/progress-bar'
import { CONTENT_TYPE_LABELS } from '@/lib/constants'
import type { QuizAttemptRow, QuizQuestionPublic, QuizRow } from '@/lib/types'

function videoEmbed(url: string) {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/,
  )
  if (yt) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt[1]}`}
          title="Lecteur vidéo"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }
  const isMp4 = /\.(mp4|webm|ogg)(\?|$)/i.test(url)
  if (isMp4) {
    return (
      <video controls preload="none" className="w-full rounded-xl border border-slate-200">
        <source src={url} />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-outline inline-flex"
    >
      <PlayCircle className="h-4 w-4" aria-hidden="true" />
      Lancer la vidéo (nouvel onglet)
    </a>
  )
}

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string }
}) {
  const user = await requireUser()
  const supabase = createClient()

  const course = await getPublishedCourseBySlug(params.slug)
  if (!course) notFound()

  const lessons = flattenLessons(course)
  const lesson = lessons.find((l) => l.id === params.lessonId)
  if (!lesson) notFound()

  const progressMap = await getCourseProgress(user.id, course.id)
  const isCompleted = Boolean(progressMap[lesson.id])

  // Suivi dès la première consultation : crée la ligne de progression
  // (non terminée) pour que le cours apparaisse dans « Mes cours » du
  // tableau de bord, même avant la première validation.
  if (!progressMap[lesson.id]) {
    await supabase
      .from('progress')
      .upsert(
        {
          user_id: user.id,
          course_id: course.id,
          lesson_id: lesson.id,
          completed: false,
        },
        { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
      )
  }

  const idx = lessons.findIndex((l) => l.id === lesson.id)
  const prev = idx > 0 ? lessons[idx - 1] : null
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null

  // Anti-triche : correct_index n'est pas envoyé au navigateur - la
  // correction s'appuie uniquement sur la réponse du serveur (result.details).
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, passing_score, questions:quiz_questions(id, quiz_id, question, choices, "order")')
    .eq('lesson_id', lesson.id)
    .maybeSingle<QuizRow & { questions: QuizQuestionPublic[] }>()

  let attempts: QuizAttemptRow[] = []
  if (quiz) {
    const { data: qa } = await supabase
      .from('quiz_attempts')
      .select('id, quiz_id, user_id, score, passed, answers, attempted_at')
      .eq('quiz_id', quiz.id)
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false })
      .limit(5)
    attempts = (qa ?? []) as QuizAttemptRow[]
  }

  const doneCount = Object.values(progressMap).filter(Boolean).length
  const progressPct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0

  return (
    <div className="container-x py-8">
      <Link
        href={`/cours/${course.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au cours : {course.title}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Colonne principale : la leçon */}
        <div className="min-w-0">
          <header>
            <p className="text-sm font-medium text-teal">
              {CONTENT_TYPE_LABELS[lesson.content_type]} · {lesson.duration_min} min
            </p>
            <h1 className="mt-1 text-2xl font-bold text-navy md:text-3xl">{lesson.title}</h1>
            <p className="mt-2 text-xs text-slate-500">
              Leçon {idx + 1} sur {lessons.length}
            </p>
          </header>

          <div className="mt-6">
            {lesson.content_type === 'VIDEO' ? (
              <div className="space-y-4">
                {lesson.video_url && (
                  <div className="flex justify-center">{videoEmbed(lesson.video_url)}</div>
                )}
                {lesson.content_body && (
                  <div
                    className="prose-lean"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content_body) }}
                  />
                )}
                {lesson.transcript ? (
                  <TranscriptToggle transcript={lesson.transcript} />
                ) : null}
              </div>
            ) : (
              <div
                className="prose-lean"
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(lesson.content_body || ''),
                }}
              />
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <MarkCompleteButton
              lessonId={lesson.id}
              initiallyCompleted={isCompleted}
              nextHref={next ? `/cours/${course.slug}/lecon/${next.id}` : undefined}
            />
            <div className="flex gap-2">
              {prev ? (
                <Link
                  href={`/cours/${course.slug}/lecon/${prev.id}`}
                  className="btn-outline !px-3 !py-2"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Précédente</span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={`/cours/${course.slug}/lecon/${next.id}`}
                  className="btn !px-3 !py-2"
                >
                  <span className="hidden sm:inline">Suivante</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>

          {quiz && (
            <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                <FileText className="h-5 w-5 text-teal" aria-hidden="true" />
                Quiz de la leçon
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-600">
                {quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''} ·
                il faut réussir ce quiz pour valider le cours et obtenir le certificat.
              </p>
              <QuizPlayer
                quiz={{
                  lessonId: lesson.id,
                  quizId: quiz.id,
                  passingScore: quiz.passing_score,
                  questions: quiz.questions,
                }}
                attempts={attempts.map((a) => ({
                  score: a.score,
                  passed: a.passed,
                  attempted_at: a.attempted_at,
                }))}
              />
            </section>
          )}

          <p className="mt-10 flex items-center gap-2 text-xs text-slate-400">
            <Monitor className="h-4 w-4" aria-hidden="true" />
            Cette page charge très peu de données : focus sur la leçon.
          </p>
        </div>

        {/* Plan du cours : en dessous sur mobile, sticky à droite sur grand écran */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-bold text-navy">
              <Menu className="h-4 w-4 text-teal" aria-hidden="true" />
              Programme
            </h2>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{progressPct}% terminé</span>
              <span>
                {doneCount}/{lessons.length} leçons
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar percent={progressPct} label="Progression du cours" />
            </div>

            <ol className="mt-4 space-y-3">
              {course.modules.map((module, mi) => (
                <li key={module.id}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Module {mi + 1}
                  </p>
                  <ul className="mt-1 space-y-1">
                    {module.lessons.map((lessonRow, li) => {
                      const isCurrent = lessonRow.id === lesson.id
                      const isDone = Boolean(progressMap[lessonRow.id])
                      return (
                        <li key={lessonRow.id}>
                          <Link
                            href={`/cours/${course.slug}/lecon/${lessonRow.id}`}
                            aria-current={isCurrent ? 'page' : undefined}
                            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                              isCurrent
                                ? 'bg-teal-50 font-semibold text-navy'
                                : 'text-slate-600 hover:bg-navy-50'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2
                                className="h-4 w-4 shrink-0 text-teal"
                                aria-hidden="true"
                              />
                            ) : (
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                                  isCurrent
                                    ? 'border-teal text-teal'
                                    : 'border-slate-300 text-slate-400'
                                }`}
                                aria-hidden="true"
                              >
                                {li + 1}
                              </span>
                            )}
                            <span className="min-w-0 flex-1 truncate">{lessonRow.title}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}