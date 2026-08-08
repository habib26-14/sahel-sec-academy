import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { CourseDetail } from '@/lib/types'

const lessonSelect =
  'id, module_id, title, order, content_type, content_body, video_url, transcript, duration_min'

export interface FlatLesson {
  id: string
  module_id: string
  title: string
  order: number
  content_type: string
  content_body: string
  video_url: string | null
  transcript: string | null
  duration_min: number
  course_id: string
}

/** Récupère un cours publié avec ses modules et leçons. */
export async function getPublishedCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const supabase = createSupabaseClient()
  const { data: course } = await supabase
    .from('courses')
    .select(
      `id, slug, title, description, level, status, cover_image_url, estimated_hours,
       prerequisites, author_id, created_at, updated_at,
       author:profiles(id, full_name, role),
       modules( id, course_id, title, "order", created_at,
                lessons(${lessonSelect}) )`,
    )
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .maybeSingle<CourseDetail>()

  if (!course) return null
  for (const mod of course.modules ?? []) {
    mod.lessons.sort((a, b) => a.order - b.order)
  }
  course.modules.sort((a, b) => a.order - b.order)
  return course
}

/** Toutes les leçons d'un cours (plan plat, ordonné). */
export function flattenLessons(course: CourseDetail): FlatLesson[] {
  const flat: FlatLesson[] = []
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      flat.push({ ...lesson, course_id: course.id })
    }
  }
  return flat
}

/** Progression de l'utilisateur sur un cours : map lesson_id -> completed. */
export async function getCourseProgress(
  userId: string,
  courseId: string,
): Promise<Record<string, boolean>> {
  const supabase = createSupabaseClient()
  const { data } = await supabase
    .from('progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
  const map: Record<string, boolean> = {}
  for (const row of data ?? []) map[row.lesson_id] = row.completed
  return map
}

export async function getLessonIdsForCourse(courseId: string): Promise<string[]> {
  const supabase = createSupabaseClient()
  const { data } = await supabase
    .from('lessons')
    .select('id, modules!inner(course_id)')
    .eq('modules.course_id', courseId)
  return (data ?? []).map((l) => l.id as string)
}

export interface OrderedLesson {
  id: string
  moduleOrder: number
  lessonOrder: number
}

/** Leçons d'un cours ordonnées (module puis leçon), pour « reprendre au pas près ». */
export async function getOrderedLessonsForCourse(courseId: string): Promise<OrderedLesson[]> {
  const supabase = createSupabaseClient()
  const { data } = await supabase
    .from('lessons')
    .select('id, "order", modules!inner("order", course_id)')
    .eq('modules.course_id', courseId)
  const rows = (data ?? []) as unknown as Array<{
    id: string
    order: number
    modules: { order: number }
  }>
  return rows
    .map((l) => ({
      id: l.id,
      moduleOrder: l.modules.order,
      lessonOrder: l.order,
    }))
    .sort((a, b) => a.moduleOrder - b.moduleOrder || a.lessonOrder - b.lessonOrder)
}