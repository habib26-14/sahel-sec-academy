'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createLesson, updateLesson, type AdminActionState } from '@/lib/actions/admin'
import { CONTENT_TYPES, CONTENT_TYPE_LABELS } from '@/lib/constants'
import type { LessonRow } from '@/lib/types'

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

interface LessonFormProps {
  courseId: string
  lessonId?: string
  initial?: LessonRow
  moduleId?: string
}

export default function LessonForm({ courseId, lessonId, initial, moduleId }: LessonFormProps) {
  const action = lessonId
    ? updateLesson.bind(null, courseId, lessonId)
    : createLesson.bind(null, courseId)
  const [state, formAction] = useFormState(action, initialState)
  const [contentType, setContentType] = useState(initial?.content_type ?? 'TEXT')

  return (
    <form action={formAction} className="space-y-5">
      {moduleId && !lessonId && <input type="hidden" name="moduleId" value={moduleId} readOnly />}
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="title" className="label">
            Titre de la leçon *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            defaultValue={initial?.title}
            className="input"
            placeholder="Comprendre le phishing"
          />
        </div>
        <div>
          <label htmlFor="contentType" className="label">
            Format
          </label>
          <select
            id="contentType"
            name="contentType"
            className="input"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as typeof contentType)}
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {CONTENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {contentType === 'VIDEO' ? (
        <>
          <div>
            <label htmlFor="videoUrl" className="label">
              URL de la vidéo *
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              defaultValue={initial?.video_url ?? ''}
              className="input"
              placeholder="https://www.youtube.com/…"
            />
          </div>
          <div>
            <label htmlFor="transcript" className="label">
              Transcription complète * <span className="text-slate-400">(mode texte demandé)</span>
            </label>
            <textarea
              id="transcript"
              name="transcript"
              rows={8}
              required
              defaultValue={initial?.transcript ?? ''}
              className="input"
              placeholder="Le texte intégral de la vidéo, pour lire ou revoir à votre rythme…"
            />
          </div>
          <div>
            <label htmlFor="contentBody" className="label">
              Notes complémentaires <span className="text-slate-400">(optionnel)</span>
            </label>
            <textarea
              id="contentBody"
              name="contentBody"
              rows={5}
              defaultValue={initial?.content_body ?? ''}
              className="input"
              placeholder="Markdown supporté"
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="contentBody" className="label">
            Contenu de la leçon * <span className="text-slate-400">(Markdown supporté)</span>
          </label>
          <textarea
            id="contentBody"
            name="contentBody"
            rows={14}
            required
            defaultValue={initial?.content_body ?? ''}
            className="input font-mono"
            placeholder="# Titre&#10;&#10;Le contenu pédagogique… Utilisez **gras**, _italique_, - listes, [liens](https://…)"
          />
        </div>
      )}

      <div>
        <label htmlFor="durationMin" className="label">
          Durée estimée (minutes)
        </label>
        <input
          id="durationMin"
          name="durationMin"
          type="number"
          min={1}
          max={600}
          required
          defaultValue={initial?.duration_min ?? 10}
          className="input w-40"
        />
      </div>

      <SubmitButton label={lessonId ? 'Enregistrer la leçon' : "Créer la leçon"} />
    </form>
  )
}