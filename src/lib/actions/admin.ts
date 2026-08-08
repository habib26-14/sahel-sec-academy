'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  courseSchema,
  courseStatusSchema,
  lessonSchema,
  moduleSchema,
  quizSchema,
} from '@/lib/validations'
import { requireStaff } from '@/lib/auth'

export type AdminActionState = { error?: string; ok?: string }

const GENERIC_ERROR = 'Une erreur est survenue. Réessayez ou contactez l’administrateur.'

/**
 * Ne JAMAIS renvoyer error.message au client (fuite d'informations internes) :
 * on journalise côté serveur et on renvoie un message générique.
 */
function friendlyError(error: { message: string }, context: string): string {
  console.error(`[admin:${context}]`, error.message)
  return GENERIC_ERROR
}

async function getSupabase() {
  await requireStaff()
  return createClient()
}

function coursePaths(id: string, slug?: string) {
  const paths = ['/admin', `/admin/cours/${id}`, '/cours']
  if (slug) paths.push(`/cours/${slug}`)
  return paths
}

function revalidateCourse(id: string, slug?: string) {
  coursePaths(id, slug).forEach((p) => revalidatePath(p))
}

/** Redirige vers une page admin en affichant un message (query ?flash=). */
function reloadWithFlash(path: string, message: string): never {
  redirect(`${path}?flash=${encodeURIComponent(message)}`)
}

// ---------------------------------------------------------------------------
// Cours
// ---------------------------------------------------------------------------

export async function createCourse(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getSupabase()
  const parsed = courseSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    prerequisites: formData.get('prerequisites') ?? '',
    level: formData.get('level'),
    estimatedHours: formData.get('estimatedHours'),
    coverImageUrl: formData.get('coverImageUrl') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expirée, reconnectez-vous.' }

  // Mapping explicite camelCase (formulaire) → snake_case (colonne SQL) :
  // utiliser parsed.data brut briserait l'insert (coverImageUrl, estimatedHours
  // n'existent pas comme colonnes → erreur PostgREST).
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      prerequisites: parsed.data.prerequisites || null,
      level: parsed.data.level,
      estimated_hours: parsed.data.estimatedHours,
      cover_image_url: parsed.data.coverImageUrl || null,
      author_id: user.id,
      status: 'DRAFT',
    })
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error) {
    if (error.message.includes('duplicate key')) {
      return { error: 'Ce slug est déjà utilisé, choisissez-en un autre.' }
    }
    return { error: friendlyError(error, 'create-course') }
  }
  if (!data) return { error: 'Création impossible.' }

  redirect(`/admin/cours/${data.id}`)
}

export async function updateCourse(
  courseId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getSupabase()
  const parsed = courseSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    prerequisites: formData.get('prerequisites') ?? '',
    level: formData.get('level'),
    estimatedHours: formData.get('estimatedHours'),
    coverImageUrl: formData.get('coverImageUrl') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { data, error } = await supabase
    .from('courses')
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      prerequisites: parsed.data.prerequisites || null,
      level: parsed.data.level,
      estimated_hours: parsed.data.estimatedHours,
      cover_image_url: parsed.data.coverImageUrl || null,
    })
    .eq('id', courseId)
    .select('slug')
    .maybeSingle<{ slug: string }>()

  if (error) {
    if (error.message.includes('duplicate key')) {
      return { error: 'Ce slug est déjà utilisé.' }
    }
    return { error: friendlyError(error, 'create-course') }
  }
  revalidateCourse(courseId, data?.slug)
  return { ok: 'Cours enregistré.' }
}

const TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['IN_REVIEW', 'PUBLISHED', 'ARCHIVED'],
  IN_REVIEW: ['PUBLISHED', 'DRAFT'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: ['DRAFT'],
}

export async function setCourseStatus(courseId: string, status: string): Promise<void> {
  const supabase = await getSupabase()
  const coursePath = `/admin/cours/${courseId}`
  const target = courseStatusSchema.safeParse(status)
  if (!target.success) reloadWithFlash(coursePath, 'Statut invalide.')

  const { data: course } = await supabase
    .from('courses')
    .select('status, slug')
    .eq('id', courseId)
    .maybeSingle<{ status: string; slug: string }>()
  if (!course) reloadWithFlash(coursePath, 'Cours introuvable.')
  if (!TRANSITIONS[course!.status]?.includes(target!.data)) {
    reloadWithFlash(coursePath, `Transition ${course!.status} → ${target!.data} non autorisée.`)
  }

  const { error } = await supabase
    .from('courses')
    .update({ status: target!.data })
    .eq('id', courseId)
  if (error) reloadWithFlash(coursePath, friendlyError(error, 'admin'))
  revalidateCourse(courseId, course!.slug)
  reloadWithFlash(coursePath, `Statut mis à jour : ${target!.data}.`)
}

export async function deleteCourse(courseId: string): Promise<void> {
  const supabase = await getSupabase()

  const [{ count: progressCount }, { count: certCount }] = await Promise.all([
    supabase.from('progress').select('id', { count: 'exact', head: true }).eq('course_id', courseId),
    supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('course_id', courseId),
  ])
  if ((progressCount ?? 0) > 0 || (certCount ?? 0) > 0) {
    reloadWithFlash(
      `/admin/cours/${courseId}`,
      'Des apprenants suivent déjà ce cours : vous ne pouvez pas le supprimer. Archivez-le à la place.',
    )
  }

  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  if (error) reloadWithFlash('/admin', friendlyError(error, 'delete-course'))
  revalidatePath('/admin')
  revalidatePath('/cours')
  redirect('/admin')
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export async function createModule(courseId: string, formData: FormData): Promise<void> {
  const supabase = await getSupabase()
  const coursePath = `/admin/cours/${courseId}`
  const parsed = moduleSchema.safeParse({ title: formData.get('title') })
  if (!parsed.success) reloadWithFlash(coursePath, parsed.error.issues[0]?.message ?? 'Module invalide')

  const { data: last } = await supabase
    .from('modules')
    .select('order')
    .eq('course_id', courseId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle<{ order: number }>()

  const { error } = await supabase.from('modules').insert({
    course_id: courseId,
    title: parsed!.data.title,
    order: (last?.order ?? 0) + 1,
  })
  if (error) reloadWithFlash(coursePath, friendlyError(error, 'admin'))
  revalidatePath(coursePath)
  reloadWithFlash(coursePath, 'Module ajouté.')
}

export async function updateModuleTitle(
  moduleId: string,
  courseId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await getSupabase()
  const coursePath = `/admin/cours/${courseId}`
  const parsed = moduleSchema.safeParse({ title: formData.get('title') })
  if (!parsed.success) {
    reloadWithFlash(coursePath, parsed.error.issues[0]?.message ?? 'Titre de module invalide')
  }
  const { error } = await supabase
    .from('modules')
    .update({ title: parsed!.data.title })
    .eq('id', moduleId)
  if (error) reloadWithFlash(coursePath, friendlyError(error, 'admin'))
  revalidatePath(coursePath)
  reloadWithFlash(coursePath, 'Module renommé.')
}

export async function deleteModule(moduleId: string, courseId: string): Promise<void> {
  const supabase = await getSupabase()
  const coursePath = `/admin/cours/${courseId}`
  const { count } = await supabase
    .from('progress')
    .select('id', { count: 'exact', head: true })
    .eq('lessons!inner.module_id', moduleId)
  if ((count ?? 0) > 0) {
    reloadWithFlash(
      coursePath,
      'Des apprenants ont déjà suivi des leçons de ce module : vous ne pouvez pas le supprimer.',
    )
  }
  const { error } = await supabase.from('modules').delete().eq('id', moduleId)
  if (error) reloadWithFlash(coursePath, friendlyError(error, 'admin'))
  revalidatePath(coursePath)
}

export async function moveModule(
  moduleId: string,
  courseId: string,
  direction: 'up' | 'down',
): Promise<void> {
  const supabase = await getSupabase()
  const coursePath = `/admin/cours/${courseId}`
  const { data: modules } = await supabase
    .from('modules')
    .select('id, order')
    .eq('course_id', courseId)
    .order('order', { ascending: true })
  if (!modules) reloadWithFlash(coursePath, 'Modules introuvables.')

  const idx = modules!.findIndex((m) => m.id === moduleId)
  const swapWith = direction === 'up' ? idx - 1 : idx + 1
  if (idx === -1 || swapWith < 0 || swapWith >= modules!.length) {
    reloadWithFlash(coursePath, 'Déplacement impossible.')
  }

  const a = modules![idx]
  const b = modules![swapWith]
  await supabase.from('modules').update({ order: b.order }).eq('id', a.id)
  const { error } = await supabase.from('modules').update({ order: a.order }).eq('id', b.id)
  if (error) reloadWithFlash(coursePath, friendlyError(error, 'admin'))
  revalidatePath(coursePath)
}

// ---------------------------------------------------------------------------
// Leçons
// ---------------------------------------------------------------------------

export async function createLesson(
  courseId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getSupabase()
  const moduleId = String(formData.get('moduleId') ?? '')
  if (!moduleId) return { error: 'Module manquant.' }

  const parsed = lessonSchema.safeParse({
    title: formData.get('title'),
    contentType: formData.get('contentType'),
    contentBody: formData.get('contentBody'),
    videoUrl: formData.get('videoUrl') ?? '',
    transcript: formData.get('transcript') ?? '',
    durationMin: formData.get('durationMin'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  if (parsed.data.contentType === 'VIDEO' && !parsed.data.videoUrl) {
    return { error: 'Une leçon vidéo doit avoir une URL vidéo.' }
  }
  if (parsed.data.contentType !== 'VIDEO' && !parsed.data.contentBody.trim()) {
    return { error: 'Le contenu texte de la leçon est vide.' }
  }

  const { data: last } = await supabase
    .from('lessons')
    .select('order')
    .eq('module_id', moduleId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle<{ order: number }>()

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      module_id: moduleId,
      title: parsed.data.title,
      order: (last?.order ?? 0) + 1,
      content_type: parsed.data.contentType,
      content_body: parsed.data.contentBody,
      video_url: parsed.data.videoUrl || null,
      transcript: parsed.data.transcript || null,
      duration_min: parsed.data.durationMin,
    })
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error) return { error: friendlyError(error, 'create-course') }
  revalidatePath(`/admin/cours/${courseId}`)
  revalidatePath(`/cours/`)
  redirect(`/admin/cours/${courseId}/lecons/${data?.id}`)
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getSupabase()
  const parsed = lessonSchema.safeParse({
    title: formData.get('title'),
    contentType: formData.get('contentType'),
    contentBody: formData.get('contentBody'),
    videoUrl: formData.get('videoUrl') ?? '',
    transcript: formData.get('transcript') ?? '',
    durationMin: formData.get('durationMin'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  if (parsed.data.contentType === 'VIDEO' && !parsed.data.videoUrl) {
    return { error: 'Une leçon vidéo doit avoir une URL vidéo.' }
  }

  const { error } = await supabase
    .from('lessons')
    .update({
      title: parsed.data.title,
      content_type: parsed.data.contentType,
      content_body: parsed.data.contentBody,
      video_url: parsed.data.videoUrl || null,
      transcript: parsed.data.transcript || null,
      duration_min: parsed.data.durationMin,
    })
    .eq('id', lessonId)
  if (error) return { error: friendlyError(error, 'create-course') }

  revalidatePath(`/admin/cours/${courseId}`)
  revalidatePath(`/admin/cours/${courseId}/lecons/${lessonId}`)
  return { ok: 'Leçon enregistrée.' }
}

export async function deleteLesson(
  lessonId: string,
  courseId: string,
): Promise<void> {
  const supabase = await getSupabase()
  const coursePath = `/admin/cours/${courseId}`
  const { count } = await supabase
    .from('progress')
    .select('id', { count: 'exact', head: true })
    .eq('lesson_id', lessonId)
  if ((count ?? 0) > 0) {
    reloadWithFlash(
      coursePath,
      'Des apprenants ont déjà suivi cette leçon : vous ne pouvez pas la supprimer.',
    )
  }
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
  if (error) reloadWithFlash(coursePath, friendlyError(error, 'admin'))
  revalidatePath(coursePath)
  revalidatePath('/cours')
}

export async function moveLesson(
  lessonId: string,
  moduleId: string,
  courseId: string,
  direction: 'up' | 'down',
): Promise<void> {
  const supabase = await getSupabase()
  const coursePath = `/admin/cours/${courseId}`
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, order')
    .eq('module_id', moduleId)
    .order('order', { ascending: true })
  if (!lessons) reloadWithFlash(coursePath, 'Leçons introuvables.')

  const idx = lessons!.findIndex((l) => l.id === lessonId)
  const swapWith = direction === 'up' ? idx - 1 : idx + 1
  if (idx === -1 || swapWith < 0 || swapWith >= lessons!.length) {
    reloadWithFlash(coursePath, 'Déplacement impossible.')
  }

  const a = lessons![idx]
  const b = lessons![swapWith]
  await supabase.from('lessons').update({ order: b.order }).eq('id', a.id)
  const { error } = await supabase.from('lessons').update({ order: a.order }).eq('id', b.id)
  if (error) reloadWithFlash(coursePath, friendlyError(error, 'admin'))
  revalidatePath(coursePath)
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

export async function saveQuiz(
  lessonId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getSupabase()

  const rawQuestions: Array<Record<string, FormDataEntryValue>> = []
  for (const key of Array.from(formData.keys())) {
    const m = key.match(/^q_(\d+)_(question|choice_(\d+)|correctIndex)$/)
    if (m) {
      const index = Number(m[1])
      const type = m[2]
      const choiceIdx = m[3] ? Number(m[3]) : null
      if (!rawQuestions[index]) rawQuestions[index] = {}
      if (type === 'question') rawQuestions[index].question = formData.get(key)!
      if (choiceIdx !== null) {
        rawQuestions[index][`choice_${choiceIdx}`] = formData.get(key)!
      }
      if (type === 'correctIndex') rawQuestions[index].correctIndex = formData.get(key)!
    }
  }

  const parsed = quizSchema.safeParse({
    passingScore: formData.get('passingScore'),
    questions: rawQuestions
      .filter((q) => q.question)
      .map((q, i) => ({
        question: q.question,
        choices: Object.keys(q)
          .filter((k) => k.startsWith('choice_'))
          .sort((a, b) => Number(a.split('_')[1]) - Number(b.split('_')[1]))
          .map((k) => q[k]),
        correctIndex: q.correctIndex,
        order: i,
      })),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  // Récupère le cours parent pour la revalidation
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, modules!inner(course_id)')
    .eq('id', lessonId)
    .maybeSingle<{ id: string; modules: { course_id: string } }>()
  const courseId = lesson?.modules?.course_id

  // Upsert quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .eq('lesson_id', lessonId)
    .maybeSingle<{ id: string }>()

  let quizId: string
  if (quiz) {
    const { data: updated } = await supabase
      .from('quizzes')
      .update({ passing_score: parsed.data.passingScore })
      .eq('id', quiz.id)
      .select('id')
      .maybeSingle<{ id: string }>()
    quizId = updated?.id ?? quiz.id
  } else {
    const { data: created, error: createError } = await supabase
      .from('quizzes')
      .insert({ lesson_id: lessonId, passing_score: parsed.data.passingScore })
      .select('id')
      .maybeSingle<{ id: string }>()
    if (createError) return { error: friendlyError(createError, 'quiz-create') }
    quizId = created?.id ?? ''
  }
  if (!quizId) return { error: 'Quiz introuvable.' }

  // Remplacement des questions
  await supabase.from('quiz_questions').delete().eq('quiz_id', quizId)
  const { error } = await supabase.from('quiz_questions').insert(
    parsed.data.questions.map((q) => ({
      quiz_id: quizId,
      question: q.question,
      choices: q.choices,
      correct_index: q.correctIndex,
      order: q.order,
    })),
  )
  if (error) return { error: friendlyError(error, 'quiz-questions') }

  if (courseId) {
    revalidatePath(`/admin/cours/${courseId}`)
    revalidatePath(`/admin/cours/${courseId}/lecons/${lessonId}`)
  }
  return { ok: 'Quiz enregistré.' }
}

export async function deleteQuiz(
  lessonId: string,
  courseId: string,
): Promise<void> {
  const supabase = await getSupabase()
  const lessonPath = `/admin/cours/${courseId}/lecons/${lessonId}`
  const coursePath = `/admin/cours/${courseId}`
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .eq('lesson_id', lessonId)
    .maybeSingle<{ id: string }>()
  if (!quiz) reloadWithFlash(lessonPath, 'Quiz introuvable.')

  const { count } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', quiz!.id)
  if ((count ?? 0) > 0) {
    reloadWithFlash(
      lessonPath,
      'Des apprenants ont déjà répondu : vous ne pouvez pas supprimer ce quiz.',
    )
  }

  const { error } = await supabase.from('quizzes').delete().eq('id', quiz!.id)
  if (error) reloadWithFlash(lessonPath, friendlyError(error, 'delete-quiz'))
  revalidatePath(coursePath)
  revalidatePath(lessonPath)
}