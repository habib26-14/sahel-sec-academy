'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Medal,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import type { QuizQuestionPublic } from '@/lib/types'

interface QuizData {
  lessonId: string
  quizId: string
  passingScore: number
  questions: QuizQuestionPublic[]
}

interface QuizResult {
  score: number
  passed: boolean
  correct: number
  total: number
  passingScore: number
  details: Array<{ questionId: string; correct: boolean; chosen: number; correctIndex: number }>
  certificateIssued: boolean
}

interface Attempt {
  score: number
  passed: boolean
  attempted_at: string
}

export default function QuizPlayer({
  quiz,
  attempts,
}: {
  quiz: QuizData
  attempts: Attempt[]
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/quiz/${quiz.lessonId}/submit`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-sahel-csrf': '1',
        },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Envoi impossible, réessayez.')
      } else {
        setResult(data as QuizResult)
      }
    } catch {
      setError('Problème de connexion. Vérifiez votre réseau et réessayez.')
    } finally {
      setBusy(false)
    }
  }

  const allAnswered = quiz.questions.every((q) => typeof answers[q.id] === 'number')

  if (result) {
    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl border p-5 ${
            result.passed ? 'border-teal/40 bg-teal-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <p className="flex items-center gap-2 text-lg font-bold text-navy">
            {result.passed ? (
              <CheckCircle2 className="h-6 w-6 text-teal" aria-hidden="true" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            )}
            Score : {result.score}% ({result.correct}/{result.total})
          </p>
          <p className="text-sm text-navy-700">
            Seuil de réussite : {result.passingScore}%.{' '}
            {result.passed
              ? 'Quiz réussi - bravo !'
              : 'Quiz non validé, vous pouvez réessayer.'}
          </p>
          {result.certificateIssued && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-teal-700">
              <Medal className="h-4 w-4" aria-hidden="true" />
              Certificat débloqué !
              <Link href="/tableau-de-bord#certificats" className="underline">
                Le télécharger
              </Link>
            </p>
          )}
        </div>

        <ol className="space-y-3">
          {quiz.questions.map((q, qi) => {
            const det = result.details.find((d) => d.questionId === q.id)
            return (
              <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-navy">
                  {qi + 1}. {q.question}
                </p>
                <ul className="mt-2 space-y-1">
                  {q.choices.map((choice, ci) => {
                    // Les bonnes réponses viennent du serveur (result.details),
                    // jamais du HTML de la page.
                    const isCorrect = ci === det?.correctIndex
                    const isChosen = ci === det?.chosen
                    return (
                      <li
                        key={ci}
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          isCorrect
                            ? 'bg-teal-50 font-medium text-teal-700'
                            : isChosen
                              ? 'bg-red-50 text-red-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {isCorrect && <CheckCircle2 className="mr-1.5 inline h-4 w-4" aria-hidden="true" />}
                        {isChosen && !isCorrect && <XCircle className="mr-1.5 inline h-4 w-4" aria-hidden="true" />}
                        {choice}
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-1 text-xs text-slate-400">
                  Votre réponse : {q.choices[det?.chosen ?? -1] ?? 'aucune'}
                </p>
              </li>
            )
          })}
        </ol>

        <button
          type="button"
          onClick={() => {
            setResult(null)
            setAnswers({})
          }}
          className="btn-outline"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Recommencer le quiz
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}

      <ol className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-navy">
              <span className="text-teal">{qi + 1}.</span> {q.question}
            </p>
            <ul className="mt-3 space-y-2">
              {q.choices.map((choice, ci) => {
                const selected = answers[q.id] === ci
                return (
                  <li key={ci}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        selected
                          ? 'border-teal bg-teal-50 font-medium text-navy'
                          : 'border-slate-200 hover:border-teal/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={ci}
                        checked={selected}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: ci }))
                        }
                        className="h-4 w-4 accent-teal"
                      />
                      {choice}
                    </label>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>

      <p className="text-xs text-slate-500">
        Note de réussite requise : {quiz.passingScore}%. Correction immédiate.
      </p>

      <button onClick={submit} disabled={busy || !allAnswered} className="btn">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Valider mes réponses
      </button>

      {attempts.length > 0 && (
        <p className="text-xs text-slate-500">
          Tentatives précédentes :{' '}
          {attempts.map((a) => `${a.score}%${a.passed ? ' ✓' : ' ✗'}`).join(' · ')}
        </p>
      )}
    </div>
  )
}