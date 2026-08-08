'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { deleteCourse } from '@/lib/actions/admin'

function SubmitIcon() {
  const { pending } = useFormStatus()
  return pending ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
  ) : (
    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
  )
}

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  return (
    <form
      action={deleteCourse.bind(null, courseId)}
      onSubmit={(e) => {
        if (!window.confirm('Supprimer définitivement ce cours ?')) e.preventDefault()
      }}
    >
      <button type="submit" className="btn-danger !px-3 !py-1.5 text-xs" title="Supprimer">
        <SubmitIcon />
      </button>
    </form>
  )
}