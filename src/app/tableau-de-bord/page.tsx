import Link from 'next/link'
import Image from 'next/image'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  Medal,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import ProgressBar from '@/components/progress-bar'
import { getOrderedLessonsForCourse, type OrderedLesson } from '@/lib/queries'
import { formatDateFr } from '@/lib/utils'
import type { CertificateRow, CourseRow } from '@/lib/types'

export default async function DashboardPage() {
  const user = await requireUser()
  const supabase = createClient()

  // Cours suivis : dérivés des lignes de progression et des cours publiés
  const [progressRes, certRes, coursesRes] = await Promise.all([
    supabase.from('progress').select('course_id, lesson_id, completed').eq('user_id', user.id),
    supabase.from('certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }),
    supabase.from('courses').select('*').eq('status', 'PUBLISHED').order('created_at', { ascending: false }),
  ])

  const certificates: CertificateRow[] = (certRes.data ?? []) as CertificateRow[]
  const publishedCourses: CourseRow[] = (coursesRes.data ?? []) as CourseRow[]
  const publishedById = new Map(publishedCourses.map((c) => [c.id, c]))

  const courseIds = Array.from(
    new Set([
      ...(progressRes.data ?? []).map((p) => p.course_id as string),
      ...certificates.map((c) => c.course_id),
    ]),
  )

  const myCourses = courseIds
    .map((id) => publishedById.get(id))
    .filter((c): c is CourseRow => Boolean(c))

  // Calcule la progression de chaque cours
  const courseStats: Array<{
    course: CourseRow
    completedLessons: number
    totalLessons: number
    nextLessonId: string | null
    certificate: CertificateRow | null
  }> = []

  for (const course of myCourses) {
    const ordered = await getOrderedLessonsForCourse(course.id)
    const totalLessons = ordered.length
    const completed = new Set(
      (progressRes.data ?? [])
        .filter((p) => p.course_id === course.id && p.completed)
        .map((p) => p.lesson_id as string),
    )
    const nextLesson = ordered.find((l: OrderedLesson) => !completed.has(l.id))
    const cert = certificates.find((c) => c.course_id === course.id) ?? null
    courseStats.push({
      course,
      completedLessons: completed.size,
      totalLessons,
      nextLessonId: nextLesson?.id ?? null,
      certificate: cert,
    })
  }

  const doneCount = courseStats.filter((c) => c.completedLessons === c.totalLessons).length

  return (
    <div className="container-x py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Bonjour {user.fullName?.split(' ')[0] ?? ''} 👋</h1>
          <p className="mt-1 text-slate-600">Voici vos cours et vos certificats.</p>
        </div>
        <Link href="/cours" className="btn">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Parcourir le catalogue
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          label="Cours suivis"
          value={String(myCourses.length)}
        />
        <Stat
          icon={<GraduationCap className="h-5 w-5" aria-hidden="true" />}
          label="Cours terminés"
          value={String(doneCount)}
        />
        <Stat
          icon={<Medal className="h-5 w-5" aria-hidden="true" />}
          label="Certificats"
          value={String(certificates.length)}
        />
      </div>

      {myCourses.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-4 p-12 text-center">
          <ShieldCheck className="h-12 w-12 text-teal" aria-hidden="true" />
          <p className="max-w-md text-slate-600">
            Vous n’avez pas encore commencé de cours. Lancez-vous :
            c’est gratuit, dès maintenant.
          </p>
          <Link href="/cours" className="btn">
            Découvrir les cours
          </Link>
        </div>
      ) : (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-navy">Mes cours</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {courseStats.map(({ course, completedLessons, totalLessons, nextLessonId, certificate }) => {
              const pct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
              const done = certificate !== null && pct === 100
              const continueHref =
                nextLessonId && !done
                  ? `/cours/${course.slug}/lecon/${nextLessonId}`
                  : `/cours/${course.slug}`
              return (
                <li key={course.id} className="card overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                      {course.cover_image_url ? (
                        <Image
                          src={course.cover_image_url}
                          alt=""
                          fill
                          sizes="112px"
                          loading="lazy"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-teal">
                          <GraduationCap className="h-8 w-8" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/cours/${course.slug}`}
                        className="line-clamp-2 font-bold text-navy hover:text-teal"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {completedLessons}/{totalLessons} leçons terminées
                        {certificate && ' · Certificat ✔'}
                      </p>
                      <ProgressBar percent={pct} className="mt-2" label={`Progression ${course.title}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2">
                    <Link
                      href={certificate ? `/tableau-de-bord#certificats` : continueHref}
                      className="text-xs font-semibold text-teal hover:underline"
                    >
                      {certificate ? 'Voir le certificat' : done ? 'Certificat !' : 'Continuer'}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section id="certificats" className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-navy">
          <Award className="h-5 w-5 text-teal" aria-hidden="true" />
          Mes certificats
        </h2>
        {certificates.length === 0 ? (
          <div className="card p-6 text-sm text-slate-600">
            Terminez un cours (toutes les leçons + les quiz réussis) pour générer
            automatiquement votre certificat.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {certificates.map((cert) => (
              <li key={cert.id} className="card p-5">
                <p className="flex items-center gap-2 font-bold text-navy">
                  <CheckCircle2 className="h-5 w-5 text-teal" aria-hidden="true" />
                  {publishedById.get(cert.course_id)?.title ?? 'Cours'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Obtenu le {formatDateFr(cert.issued_at)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`/api/certificates/${cert.id}/download`}>
                    <span className="btn !px-3 !py-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Télécharger (PDF)
                    </span>
                  </a>
                  <a
                    href={linkedinShareUrl(cert, publishedById.get(cert.course_id)?.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline !px-3 !py-1.5 text-xs"
                  >
                    Partager sur LinkedIn
                  </a>
                  <Link
                    href={`/verification/${cert.verification_code}`}
                    className="btn-ghost !px-3 !py-1.5 text-xs"
                  >
                    Page publique de vérification
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function linkedinShareUrl(cert: CertificateRow, courseTitle?: string) {
  const url = new URL('https://www.linkedin.com/shareArticle')
  url.searchParams.set('mini', 'true')
  url.searchParams.set(
    'title',
    `J’ai obtenu mon certificat « ${courseTitle ?? ''} » sur Sahel Sec Academy`,
  )
  url.searchParams.set('url', verifyUrl(cert.verification_code))
  return url.toString()
}

function verifyUrl(code: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return new URL(`/verification/${code}`, base).toString()
}