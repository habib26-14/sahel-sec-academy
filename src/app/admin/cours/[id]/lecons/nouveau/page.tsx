import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth'
import LessonForm from '@/components/admin/lesson-form'

export default async function NewLessonPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { moduleId?: string }
}) {
  await requireStaff()
  const supabase = createClient()
  const { id: courseId } = params
  const moduleId = searchParams.moduleId

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .maybeSingle<{ title: string }>()

  return (
    <div className="card mx-auto max-w-3xl p-6">
      <h2 className="mb-1 text-lg font-bold text-navy">Nouvelle leçon</h2>
      <p className="mb-5 text-sm text-slate-500">Cours : {course?.title}</p>
      <LessonForm courseId={courseId} moduleId={moduleId} />
    </div>
  )
}