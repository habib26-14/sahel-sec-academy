import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { BookOpen, CheckCircle2, Clock, GraduationCap, PlayCircle } from 'lucide-react'
import { getPublishedCourseBySlug, flattenLessons, getCourseProgress } from '@/lib/queries'
import { computeCompletion } from '@/lib/progress'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import LevelBadge from '@/components/level-badge'
import ProgressBar from '@/components/progress-bar'
import { formatDateFr } from '@/lib/utils'
import { CONTENT_TYPE_LABELS, LEVEL_LABELS } from '@/lib/constants'
import type { CertificateRow, CourseDetail } from '@/lib/types'

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  let course: CourseDetail | null = null
  try {
    course = await getPublishedCourseBySlug(params.slug)
  } catch {
    course = null
  }
  if (!course) notFound()

  const lessons = flattenLessons(course)
  const user = await getCurrentUser()

  let progressMap: Record<string, boolean> = {}
  let progressPct = 0
  let completion = { completed: false, doneLessons: 0, totalLessons: lessons.length }
  let certificate: CertificateRow | null = null

  if (user) {
    progressMap = await getCourseProgress(user.id, course.id)
    const done = lessons.filter((l) => progressMap[l.id]).length
    progressPct = lessons.length ? Math.round((done / lessons.length) * 100) : 0
    completion = {
      ...(await computeCompletion(user.id, course.id)),
      doneLessons: done,
      totalLessons: lessons.length,
    }

    const { data: cert } = await createClient()
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle<CertificateRow>()
    certificate = cert
  }

  const firstLesson = lessons[0]
  const nextLesson =
    lessons.find((l) => !progressMap[l.id]) ?? (completion.completed ? undefined : firstLesson)

  let ctaHref = '/connexion'
  let ctaLabel = 'Se connecter pour commencer'
  if (user && firstLesson && !completion.completed) {
    ctaHref = `/cours/${course.slug}/lecon/${nextLesson?.id ?? firstLesson.id}`
    ctaLabel = progressPct > 0 ? 'Continuer mon apprentissage' : 'Commencer le cours'
  } else if (user && completion.completed && certificate) {
    ctaHref = `/tableau-de-bord#certificats`
    ctaLabel = 'Mon certificat est prêt !'
  } else if (user && completion.completed) {
    ctaHref = `/cours/${course.slug}/lecon/${firstLesson.id}`
    ctaLabel = 'Revoir le cours'
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-navy text-white">
        <div className="container-x grid gap-8 py-10 md:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <LevelBadge level={course.level} />
              <span className="text-sm text-navy-100">
                <Clock className="mr-1 inline h-4 w-4" aria-hidden="true" />
                ~{course.estimated_hours} heures d’apprentissage
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">{course.title}</h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-navy-50">{course.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ctaHref} className="btn !rounded-lg !px-6 !py-3 text-base">
                <PlayCircle className="h-5 w-5" aria-hidden="true" />
                {ctaLabel}
              </Link>
              {user && progressPct > 0 && (
                <div className="w-full max-w-sm">
                  <div className="mb-1 flex justify-between text-xs text-navy-100">
                    <span>Progression</span>
                    <span>{progressPct}%</span>
                  </div>
                  <ProgressBar percent={progressPct} label="Progression du cours" />
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-navy-100">
              Par {course.author?.full_name ?? 'Sahel Sec Academy'}
            </p>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-navy-800">
            {course.cover_image_url ? (
              <Image
                src={course.cover_image_url}
                alt={`Couverture du cours : ${course.title}`}
                fill
                priority={false}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <GraduationCap className="h-16 w-16 text-teal" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prérequis */}
      {course.prerequisites && (
        <section className="border-b border-slate-200 bg-white">
          <div className="container-x grid gap-4 py-8 md:grid-cols-[200px_1fr]">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Prérequis
            </h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {course.prerequisites
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((prereq, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                    {prereq}
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      {/* Programme */}
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
            <BookOpen className="h-5 w-5 text-teal" aria-hidden="true" />
            Programme ({lessons.length} leçon{lessons.length > 1 ? 's' : ''})
          </h2>

          <ol className="mt-6 space-y-4">
            {course.modules.map((module, mi) => (
              <li key={module.id} className="card overflow-hidden">
                <h3 className="border-b border-slate-100 bg-navy-50/50 px-4 py-3 font-bold text-navy">
                  Module {mi + 1} — {module.title}
                </h3>
                <ul className="divide-y divide-slate-100">
                  {module.lessons.map((lesson, li) => {
                    const done = progressMap[lesson.id]
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/cours/${course.slug}/lecon/${lesson.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50/40"
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                          ) : (
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400"
                              aria-hidden="true"
                            >
                              {mi + 1}.{li + 1}
                            </span>
                          )}
                          <span className="flex-1 text-sm text-navy-700">{lesson.title}</span>
                          <span className="text-xs text-slate-400">
                            {CONTENT_TYPE_LABELS[lesson.content_type]} · {lesson.duration_min} min
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-navy">Informations</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Niveau</dt>
                <dd className="font-medium">{LEVEL_LABELS[course.level]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Durée estimée</dt>
                <dd className="font-medium">~{course.estimated_hours} h</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Leçons</dt>
                <dd className="font-medium">{lessons.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Certificat</dt>
                <dd className="font-medium text-teal">Inclus</dd>
              </div>
            </dl>
          </div>

          {certificate && (
            <div className="card border-teal/40 p-5">
              <h3 className="font-semibold text-navy">Certificat obtenu</h3>
              <p className="mt-1 text-sm text-slate-600">
                Le {formatDateFr(certificate.issued_at)}
              </p>
              <Link href="/tableau-de-bord#certificats" className="btn mt-4 w-full">
                Voir et télécharger
              </Link>
            </div>
          )}

          <div className="card p-5 text-sm text-slate-600">
            <p>
              💡 <strong>Lecture flexible</strong> Toutes les leçons en vidéo sont
              accompagnées d’une transcription intégrale : lisez ou regardez,
              à votre convenance.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}