'use client'

import { useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Download, FileJson2, Loader2, UploadCloud } from 'lucide-react'
import { importCourseFromFile, type AdminActionState } from '@/lib/actions/admin'
import { parseCourseImport } from '@/lib/course-import'

const initialState: AdminActionState = {}

/** Modèle de fichier JSON à télécharger pour guider la saisie. */
const TEMPLATE: Record<string, unknown> = {
  title: 'Titre du cours',
  slug: 'titre-du-cours', // optionnel : autogénéré depuis le titre si absent
  description: 'Description du cours (au moins 20 caractères).',
  prerequisites: 'Prérequis, un par ligne (optionnel)',
  level: 'DECOUVERTE | FONDAMENTAUX | SPECIALISATION',
  estimatedHours: 5,
  coverImageUrl: '', // optionnel
  modules: [
    {
      title: 'Titre du module 1',
      lessons: [
        {
          title: 'Titre de la leçon 1',
          contentType: 'TEXT', // TEXT | VIDEO | LAB
          contentBody: 'Contenu de la leçon (markdown).',
          videoUrl: '', // requis si contentType = VIDEO
          transcript: '', // optionnel
          durationMin: 15,
          quiz: {
            // optionnel
            passingScore: 70,
            questions: [
              {
                question: 'Une question ?',
                choices: ['Bonne réponse', 'Mauvaise réponse'],
                correctIndex: 0, // index de la bonne réponse
              },
            ],
          },
        },
      ],
    },
  ],
}

function downloadTemplate() {
  const blob = new Blob([JSON.stringify(TEMPLATE, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'modele-import-cours.json'
  a.click()
  URL.revokeObjectURL(url)
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? 'Import en cours…' : 'Importer ce cours'}
    </button>
  )
}

export default function CourseImporter() {
  const [state, formAction] = useFormState(importCourseFromFile, initialState)
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<{
    title?: string
    moduleCount?: number
    lessonCount?: number
    quizCount?: number
    error?: string
  } | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) {
      setPreview(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPreview({ error: 'Fichier trop volumineux (5 Mo maximum).' })
      return
    }
    void file.text().then((raw) => {
      const parsed = parseCourseImport(raw)
      if (!parsed.ok) {
        setPreview({ error: parsed.error })
        return
      }
      const d = parsed.data
      setPreview({
        title: d.title,
        moduleCount: d.modules.length,
        lessonCount: d.modules.reduce((n, m) => n + m.lessons.length, 0),
        quizCount: d.modules.reduce((n, m) => n + m.lessons.filter((l) => l.quiz).length, 0),
      })
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card space-y-5 p-6">
        <div>
          <h2 className="text-lg font-bold text-navy">Importer un cours depuis un fichier JSON</h2>
          <p className="mt-1 text-sm text-slate-600">
            Un seul fichier peut créer le cours, ses modules, toutes ses leçons et leurs quiz.
            Idéal pour préparer un cours dans un éditeur ou le déplacer d’un environnement à
            l’autre.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input
            ref={inputRef}
            id="file"
            name="file"
            type="file"
            accept=".json,application/json"
            required
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <label
            htmlFor="file"
            className="flex min-h-[9rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-teal hover:bg-teal-50/50"
          >
            <FileJson2 className="h-8 w-8 text-teal" aria-hidden="true" />
            <span className="text-sm font-semibold text-navy">Choisir un fichier JSON</span>
            <span className="text-xs text-slate-500">
              Cliquez pour parcourir vos fichiers - le fichier est analysé localement avant
              l’import.
            </span>
          </label>

          {preview && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                preview.error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-teal-200 bg-teal-50 text-teal-800'
              }`}
            >
              {preview.error ? (
                <>
                  <p className="font-medium">Fichier invalide</p>
                  <p className="mt-1">{preview.error}</p>
                </>
              ) : (
                <>
                  <p className="font-medium">{preview.title}</p>
                  <p className="mt-1 text-teal-700">
                    {preview.moduleCount} module(s) · {preview.lessonCount} leçon(s) ·{' '}
                    {preview.quizCount} quiz - sera créé en statut « Brouillon ».
                  </p>
                </>
              )}
            </div>
          )}

          {preview && !preview.error && (
            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn-outline"
              >
                Changer de fichier
              </button>
            </div>
          )}
        </form>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}
      </div>

      <aside className="card space-y-4 p-6 text-sm">
        <div>
          <h3 className="font-semibold text-navy">Modèle de fichier</h3>
          <p className="mt-1 text-slate-600">
            Le fichier accepté est du JSON avec une structure simple : un titre de cours, puis une
            liste de modules, chacun contenant ses leçons, et chaque leçon peut embarquer un quiz.
          </p>
        </div>
        <button type="button" onClick={downloadTemplate} className="btn-outline w-full">
          <Download className="h-4 w-4" aria-hidden="true" />
          Télécharger un modèle
        </button>
        <p className="text-xs text-slate-500">
          Après import, le cours arrive en statut Brouillon, à publier depuis sa page de gestion.
          Un modèle par fichier : créez-en un par cours.
        </p>
      </aside>
    </div>
  )
}