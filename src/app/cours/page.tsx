import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/course-card'
import { LEVEL_LABELS, LEVELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { CourseRow } from '@/lib/types'

export const metadata: Metadata = { title: 'Catalogue des cours' }

const FILTERS: Array<{ label: string; value?: string }> = [
  { label: 'Tous les niveaux' },
  ...LEVELS.map((level) => ({ label: LEVEL_LABELS[level], value: level })),
]

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { niveau?: string }
}) {
  const supabase = createClient()
  const niveau = searchParams.niveau

  let courses: CourseRow[] | null = null
  try {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
    if (niveau && LEVELS.includes(niveau as (typeof LEVELS)[number])) {
      query = query.eq('level', niveau)
    }
    const res = await query.returns<CourseRow[]>()
    courses = res.data
  } catch {
    courses = null
  }

  return (
    <div className="container-x py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Catalogue des cours</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Gratuits, en français, accessibles partout. Chaque cours
          est validé par un quiz et débouche sur un certificat vérifiable.
        </p>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filtrer par niveau">
        {FILTERS.map((filter) => {
          const href = filter.value ? `/cours?niveau=${filter.value}` : '/cours'
          const active = filter.value
            ? niveau === filter.value
            : !niveau
          return (
            <Link
              key={filter.label}
              href={href}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy-700 hover:bg-navy-50',
              )}
            >
              {filter.label}
            </Link>
          )
        })}
      </nav>

      {!courses || courses.length === 0 ? (
        <div className="card p-12 text-center text-slate-600">
          Aucun cours publié pour ce niveau pour le moment. Revenez bientôt !
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}