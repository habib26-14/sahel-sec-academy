import Link from 'next/link'
import Image from 'next/image'
import { Pencil, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth'
import { LEVEL_LABELS, STATUS_LABELS } from '@/lib/constants'
import DeleteCourseButton from '@/components/admin/delete-course-button'
import type { CourseRow } from '@/lib/types'

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  IN_REVIEW: 'bg-amber-50 text-amber-700',
  PUBLISHED: 'bg-teal-50 text-teal-700',
  ARCHIVED: 'bg-slate-50 text-slate-400',
}

export default async function AdminPage() {
  const user = await requireStaff()
  const supabase = createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })
    .returns<CourseRow[]>()

  return (
    <div>
      {!courses || courses.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 p-12 text-center">
          <p className="text-slate-600">
            Aucun cours pour le moment. Lancez-vous : c’est votre premier pas vers un
            contenu publié à des milliers d’apprenants.
          </p>
          <Link href="/admin/nouveau" className="btn">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Créer mon premier cours
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {courses.map((course: CourseRow) => (
            <li key={course.id} className="card flex items-center gap-4 p-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                {course.cover_image_url ? (
                  <Image
                    src={course.cover_image_url}
                    alt=""
                    fill
                    sizes="96px"
                    loading="lazy"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy">{course.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {LEVEL_LABELS[course.level]} · ~{course.estimated_hours} h ·{' '}
                  <span className={`rounded-full px-2 py-0.5 ${STATUS_BADGE[course.status]}`}>
                    {STATUS_LABELS[course.status]}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/admin/cours/${course.id}`} className="btn-outline !px-3 !py-1.5 text-xs">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Gérer
                </Link>
                <DeleteCourseButton courseId={course.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}