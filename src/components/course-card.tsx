import { Clock, GraduationCap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { LEVEL_LABELS } from '@/lib/constants'
import type { CourseRow } from '@/lib/types'

const LEVEL_COLORS: Record<string, string> = {
  DECOUVERTE: 'bg-teal-50 text-teal-700',
  FONDAMENTAUX: 'bg-navy-50 text-navy',
  SPECIALISATION: 'bg-amber-50 text-amber-700',
}

export default function CourseCard({
  course,
  progressPct,
}: {
  course: CourseRow
  progressPct?: number
}) {
  return (
    <Link
      href={`/cours/${course.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full bg-navy-50">
        {course.cover_image_url ? (
          <Image
            src={course.cover_image_url}
            alt={`Couverture du cours : ${course.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy text-white">
            <GraduationCap className="h-10 w-10 text-teal" aria-hidden="true" />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_COLORS[course.level]}`}
        >
          {LEVEL_LABELS[course.level]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-navy group-hover:text-teal">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{course.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            ~{course.estimated_hours} h
          </span>
          {typeof progressPct === 'number' && (
            <span className="font-semibold text-teal">{progressPct}% suivi</span>
          )}
        </div>
        {typeof progressPct === 'number' && progressPct > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  )
}