'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createCourse, updateCourse, type AdminActionState } from '@/lib/actions/admin'
import { LEVEL_LABELS, LEVELS } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import CoverUploader from '@/components/admin/cover-uploader'

const initialState: AdminActionState = {}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {label}
    </button>
  )
}

interface CourseFormProps {
  course?: {
    id: string
    slug: string
    title: string
    description: string
    prerequisites: string | null
    level: string
    estimated_hours: number
    cover_image_url: string | null
  }
}

export default function CourseForm({ course }: CourseFormProps) {
  const action = course ? updateCourse.bind(null, course.id) : createCourse
  const [state, formAction] = useFormState(action, initialState)
  const [cover, setCover] = useState(course?.cover_image_url ?? '')
  const [title, setTitle] = useState(course?.title ?? '')
  const [slug, setSlug] = useState(course?.slug ?? '')
  const [enrichSlug, setEnrichSlug] = useState(true)

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700" role="status">
          {state.ok}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="title" className="label">
            Titre du cours *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            className="input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (enrichSlug) setSlug(slugify(e.target.value))
            }}
            placeholder="Introduction à la cybersécurité"
          />
        </div>
        <div>
          <label htmlFor="slug" className="label">
            Slug (URL) *
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="input"
            value={slug}
            onChange={(e) => {
              setEnrichSlug(false)
              setSlug(e.target.value)
            }}
            placeholder="introduction-cybersecurite"
          />
          <p className="mt-1 text-xs text-slate-500">
            URL publique : /cours/{slug}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          minLength={20}
          className="input"
          placeholder="Ce que les apprenants vont découvrir…"
        />
      </div>

      <div>
        <label htmlFor="prerequisites" className="label">
          Prérequis (optionnel)
        </label>
        <textarea
          id="prerequisites"
          name="prerequisites"
          rows={3}
          defaultValue={course?.prerequisites ?? ''}
          className="input"
          placeholder={'Connaissances de base en réseaux\nBases Linux'}
        />
        <p className="mt-1 text-xs text-slate-500">
          Un prérequis par ligne, tels qu&apos;ils seront affichés sur la page du cours.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="level" className="label">
            Niveau
          </label>
          <select id="level" name="level" className="input" defaultValue={course?.level ?? 'DECOUVERTE'}>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="estimatedHours" className="label">
            Durée estimée (heures)
          </label>
          <input
            id="estimatedHours"
            name="estimatedHours"
            type="number"
            min={1}
            max={1000}
            required
            defaultValue={course?.estimated_hours ?? 2}
            className="input"
          />
        </div>
      </div>

      <div className="max-w-md">
        <CoverUploader value={cover} onChange={setCover} />
      </div>

      <div className="flex gap-3">
        <SubmitButton label={course ? 'Enregistrer les modifications' : 'Créer le cours'} />
      </div>
    </form>
  )
}