import { Metadata } from 'next'
import CourseForm from '@/components/admin/course-form'

export const metadata: Metadata = { title: 'Nouveau cours' }

export default function NewCoursePage() {
  return (
    <div className="card mx-auto max-w-3xl p-6">
      <h2 className="mb-4 text-lg font-bold text-navy">Détails du cours</h2>
      <CourseForm />
    </div>
  )
}