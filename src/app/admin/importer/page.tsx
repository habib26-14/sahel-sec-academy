import { requireStaff } from '@/lib/auth'
import CourseImporter from '@/components/admin/course-importer'

export default async function ImportCoursePage() {
  await requireStaff()
  return <CourseImporter />
}