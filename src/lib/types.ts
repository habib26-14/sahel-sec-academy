export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
export type CourseLevel = 'DECOUVERTE' | 'FONDAMENTAUX' | 'SPECIALISATION'
export type CourseStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
export type LessonContentType = 'TEXT' | 'VIDEO' | 'LAB'

export interface ProfileRow {
  id: string
  email: string
  full_name: string
  role: Role
  created_at: string
  updated_at: string
}

export interface CourseRow {
  id: string
  slug: string
  title: string
  description: string
  level: CourseLevel
  status: CourseStatus
  cover_image_url: string | null
  prerequisites: string | null
  estimated_hours: number
  author_id: string
  created_at: string
  updated_at: string
}

export interface ModuleRow {
  id: string
  course_id: string
  title: string
  order: number
  created_at: string
}

export interface LessonRow {
  id: string
  module_id: string
  title: string
  order: number
  content_type: LessonContentType
  content_body: string
  video_url: string | null
  transcript: string | null
  duration_min: number
}

export interface QuizRow {
  id: string
  lesson_id: string
  passing_score: number
}

export interface QuizQuestionRow {
  id: string
  quiz_id: string
  question: string
  choices: string[]
  correct_index: number
  order: number
}

/**
 * Rendu public d'une question : la bonne réponse n'est JAMAIS envoyée
 * au navigateur. La correction affichée provient du serveur (result.details).
 */
export type QuizQuestionPublic = Omit<QuizQuestionRow, 'correct_index'>

export interface QuizAttemptRow {
  id: string
  quiz_id: string
  user_id: string
  score: number
  passed: boolean
  answers: Record<string, number>
  attempted_at: string
}

export interface ProgressRow {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
}

export interface CertificateRow {
  id: string
  user_id: string
  course_id: string
  verification_code: string
  issued_at: string
  pdf_url: string
}

export interface ModuleWithLessons extends ModuleRow {
  lessons: LessonRow[]
}

export interface CourseDetail extends CourseRow {
  author?: Pick<ProfileRow, 'id' | 'full_name' | 'role'> | null
  modules: ModuleWithLessons[]
}

export interface SessionUser {
  id: string
  email: string | undefined
  fullName: string | null
  role: Role | null
}