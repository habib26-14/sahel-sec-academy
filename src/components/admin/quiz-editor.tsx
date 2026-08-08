'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { saveQuiz, deleteQuiz, type AdminActionState } from '@/lib/actions/admin'
import type { QuizQuestionRow } from '@/lib/types'

const initialState: AdminActionState = {}

interface Q {
  question: string
  choices: string[]
  correctIndex: number
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Enregistrement…' : 'Enregistrer le quiz'}
    </button>
  )
}

export default function QuizEditor({
  lessonId,
  courseId,
  quiz,
}: {
  lessonId: string
  courseId: string
  quiz:
    | ({ id: string; passing_score: number } & { questions: QuizQuestionRow[] })
    | null
}) {
  const [state, formAction] = useFormState(saveQuiz.bind(null, lessonId), initialState)
  const [passingScore, setPassingScore] = useState(quiz?.passing_score ?? 70)
  const [questions, setQuestions] = useState<Q[]>(() =>
    quiz?.questions.length
      ? quiz.questions.map((q) => ({
          question: q.question,
          choices: [...q.choices],
          correctIndex: q.correct_index,
        }))
      : [{ question: '', choices: ['', '', '', ''], correctIndex: 0 }],
  )

  function update(index: number, patch: Partial<Q>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { question: '', choices: ['', '', '', ''], correctIndex: 0 },
    ])
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  function moveQuestion(index: number, dir: -1 | 1) {
    setQuestions((prev) => {
      const target = index + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <div>
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

      <form action={formAction} className="space-y-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="passingScore" className="label">
              Note de réussite (%)
            </label>
            <input
              id="passingScore"
              name="passingScore"
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="input w-24"
            />
          </div>
          <button type="button" onClick={addQuestion} className="btn-outline">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter une question
          </button>
        </div>

        {questions.map((q, qi) => (
          <fieldset
            key={qi}
            className="rounded-lg border border-slate-200 p-4"
            aria-label={`Question ${qi + 1}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-navy">Question {qi + 1}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveQuestion(qi, -1)}
                  className="btn-ghost !p-1"
                  aria-label="Monter la question"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(qi, 1)}
                  className="btn-ghost !p-1"
                  aria-label="Descendre la question"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="btn-ghost !p-1 text-red-600"
                  aria-label="Supprimer la question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <textarea
              name={`q_${qi}_question`}
              required
              minLength={5}
              value={q.question}
              onChange={(e) => update(qi, { question: e.target.value })}
              className="input"
              rows={2}
              placeholder="Votre question…"
            />

            <div className="mt-3 space-y-2">
              {q.choices.map((choice, ci) => (
                <div key={ci} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q_${qi}_correctIndex`}
                    value={ci}
                    checked={q.correctIndex === ci}
                    onChange={() => update(qi, { correctIndex: ci })}
                    className="h-4 w-4 accent-teal"
                    aria-label={`Bonne réponse : choix ${ci + 1}`}
                  />
                  <input
                    type="text"
                    name={`q_${qi}_choice_${ci}`}
                    value={choice}
                    onChange={(e) => {
                      const choices = [...q.choices]
                      choices[ci] = e.target.value
                      update(qi, { choices })
                    }}
                    className="input"
                    placeholder={`Choix ${ci + 1}`}
                  />
                  {q.choices.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const choices = [...q.choices]
                        choices.splice(ci, 1)
                        update(qi, { choices, correctIndex: 0 })
                      }}
                      className="btn-ghost !p-1 text-slate-400"
                      aria-label="Retirer ce choix"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Sélectionnez la radio de la bonne réponse.
            </p>
          </fieldset>
        ))}

        <SubmitButton />
      </form>

      {quiz && (
        <form action={deleteQuiz.bind(null, lessonId, courseId)} className="mt-6">
          <button type="submit" className="btn-danger">
            Supprimer ce quiz
          </button>
        </form>
      )}
    </div>
  )
}