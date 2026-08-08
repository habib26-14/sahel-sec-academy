import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { assertSecureRequest } from '@/lib/security'
import { ensureCertificate } from '@/lib/progress'

/**
 * POST /api/lessons/[lessonId]/complete
 * Marque la leçon comme terminée (progress upsert) puis vérifie
 * les conditions de certificat pour le cours parent.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } },
) {
  if (!assertSecureRequest(request)) {
    return NextResponse.json({ error: 'Requête non autorisée' }, { status: 403 })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  if (!rateLimit(`complete:${user.id}:${params.lessonId}`, 15, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes, patientez un instant.' }, { status: 429 })
  }

  // C1 : seule une leçon rattachée à un cours publié peut être marquée terminée.
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, modules!inner(course_id, courses!inner(status))')
    .eq('id', params.lessonId)
    .eq('modules.courses.status', 'PUBLISHED')
    .maybeSingle<{
      id: string
      modules: { course_id: string; courses: { status: string } }
    }>()
  if (!lesson) {
    return NextResponse.json({ error: 'Leçon introuvable' }, { status: 404 })
  }
  const courseId = lesson.modules.course_id

  const now = new Date().toISOString()
  const { data: existing } = await supabase
    .from('progress')
    .select('id, completed')
    .eq('user_id', user.id)
    .eq('lesson_id', params.lessonId)
    .maybeSingle<{ id: string; completed: boolean }>()

  if (existing) {
    if (!existing.completed) {
      await supabase
        .from('progress')
        .update({ completed: true, completed_at: now })
        .eq('id', existing.id)
    }
  } else {
    await supabase.from('progress').insert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: params.lessonId,
      completed: true,
      completed_at: now,
    })
  }

  let certificateIssued = false
  try {
    certificateIssued = (await ensureCertificate(user.id, courseId)) !== null
  } catch {
    // La certification est opportuniste : jamais bloquante pour la leçon.
  }

  return NextResponse.json({ ok: true, certificateIssued })
}