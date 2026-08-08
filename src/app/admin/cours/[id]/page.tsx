import Link from 'next/link'
import {
  CheckCircle2,
  FileText,
  LayoutGrid,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth'
import { STATUS_LABELS, CONTENT_TYPE_LABELS } from '@/lib/constants'
import CourseForm from '@/components/admin/course-form'
import {
  createModule,
  updateModuleTitle,
  deleteModule,
  moveModule,
  moveLesson,
  deleteLesson,
  setCourseStatus,
} from '@/lib/actions/admin'
import type { CourseRow, ModuleRow, LessonRow } from '@/lib/types'

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { flash?: string }
}) {
  await requireStaff()
  const supabase = createClient()
  const { id } = params
  const flash = searchParams.flash

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .maybeSingle<CourseRow>()
  if (!course) return <p>Cours introuvable.</p>

  const { data: modules } = await supabase
    .from('modules')
    .select('id, course_id, title, "order", created_at')
    .eq('course_id', id)
    .order('order', { ascending: true })
    .returns<ModuleRow[]>()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, module_id, title, "order", content_type, duration_min, modules!inner(course_id)')
    .eq('modules.course_id', id)
    .order('order', { ascending: true })

  const lessonsByModule = new Map<string, LessonRow[]>()
  for (const lesson of lessons ?? []) {
    const list = lessonsByModule.get(lesson.module_id) ?? []
    list.push(lesson as unknown as LessonRow)
    lessonsByModule.set(lesson.module_id, list)
  }

  const statusOptions =
    course.status === 'DRAFT'
      ? ['IN_REVIEW', 'PUBLISHED', 'ARCHIVED']
      : course.status === 'IN_REVIEW'
        ? ['PUBLISHED', 'DRAFT']
        : course.status === 'PUBLISHED'
          ? ['ARCHIVED']
          : ['DRAFT']

  return (
    <div className="space-y-8">
      {flash && (
        <p className="rounded-lg bg-navy-50 px-4 py-3 text-sm font-medium text-navy" role="status">
          {flash}
        </p>
      )}
      {/* Statut */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-slate-500">Statut actuel</p>
          <p className="font-bold text-navy">{STATUS_LABELS[course.status]}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <form key={status} action={setCourseStatus.bind(null, id, status)}>
              <button
                type="submit"
                className={
                  status === 'PUBLISHED'
                    ? 'btn'
                    : status === 'ARCHIVED'
                      ? 'btn-outline'
                      : 'btn-outline'
                }
              >
                {status === 'PUBLISHED' && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                {status === 'IN_REVIEW' ? 'Soumettre en revue' : STATUS_LABELS[status]}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Métadonnées */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy">
          <Pencil className="h-5 w-5 text-teal" aria-hidden="true" />
          Métadonnées
        </h2>
        <CourseForm
          course={{
            id: course.id,
            slug: course.slug,
            title: course.title,
            description: course.description,
            prerequisites: course.prerequisites,
            level: course.level,
            estimated_hours: course.estimated_hours,
            cover_image_url: course.cover_image_url,
          }}
        />
      </div>

      {/* Modules & leçons */}
      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
            <LayoutGrid className="h-5 w-5 text-teal" aria-hidden="true" />
            Plan du cours ({modules?.length ?? 0} module{(modules?.length ?? 0) > 1 ? 's' : ''})
          </h2>
          <form action={createModule.bind(null, id)} className="flex gap-2">
            <input
              type="text"
              name="title"
              required
              minLength={3}
              className="input max-w-[240px]"
              placeholder="Nouveau module…"
              aria-label="Titre du nouveau module"
            />
            <button type="submit" className="btn">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter
            </button>
          </form>
        </div>

        {!modules || modules.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ajoutez votre premier module pour structurer le cours.
          </p>
        ) : (
          <ul className="space-y-3">
            {modules.map((moduleRow, index) => {
              const moduleLessons = lessonsByModule.get(moduleRow.id) ?? []
              return (
                <li key={moduleRow.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <form action={updateModuleTitle.bind(null, moduleRow.id, course.id)} className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 font-bold text-navy">{index + 1}.</span>
                      <input
                        type="text"
                        name="title"
                        defaultValue={moduleRow.title}
                        required
                        minLength={3}
                        className="input min-w-0 flex-1 !px-2 !py-1 text-sm !shadow-none"
                        aria-label={`Titre du module ${index + 1}`}
                      />
                      <button type="submit" className="btn-ghost !p-1 text-teal" title="Renommer" aria-label="Renommer">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </form>
                    <div className="flex items-center gap-1">
                      <form action={moveModule.bind(null, moduleRow.id, course.id, 'up')}>
                        <button type="submit" className="btn-ghost !p-1" title="Monter" aria-label="Monter">
                          <ArrowUp className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={moveModule.bind(null, moduleRow.id, course.id, 'down')}>
                        <button type="submit" className="btn-ghost !p-1" title="Descendre" aria-label="Descendre">
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={deleteModule.bind(null, moduleRow.id, course.id)}>
                        <button type="submit" className="btn-ghost !p-1 text-red-600" title="Supprimer" aria-label="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {moduleLessons.length > 0 && (
                    <ul className="mt-2 space-y-1 border-l-2 border-slate-100 pl-4">
                      {moduleLessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between gap-2 py-0.5">
                          <Link
                            href={`/admin/cours/${course.id}/lecons/${lesson.id}`}
                            className="inline-flex items-center gap-2 text-sm text-navy-700 hover:text-teal"
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                            {lesson.title}
                            <span className="text-xs text-slate-400">
                              · {CONTENT_TYPE_LABELS[lesson.content_type]} · {lesson.duration_min} min
                            </span>
                          </Link>
                          <div className="flex items-center gap-1">
                            <form action={moveLesson.bind(null, lesson.id, lesson.module_id, course.id, 'up')}>
                              <button type="submit" className="btn-ghost !p-1" aria-label="Monter la leçon">
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                            </form>
                            <form action={moveLesson.bind(null, lesson.id, lesson.module_id, course.id, 'down')}>
                              <button type="submit" className="btn-ghost !p-1" aria-label="Descendre la leçon">
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </form>
                            <form action={deleteLesson.bind(null, lesson.id, course.id)}>
                              <button type="submit" className="btn-ghost !p-1 text-red-600" aria-label="Supprimer la leçon">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-2">
                    <Link
                      href={`/admin/cours/${course.id}/lecons/nouveau?moduleId=${moduleRow.id}`}
                      className="btn-outline !px-3 !py-1 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Ajouter une leçon
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}