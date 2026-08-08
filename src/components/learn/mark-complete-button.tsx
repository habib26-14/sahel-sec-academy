'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Medal } from 'lucide-react'
import Link from 'next/link'

export default function MarkCompleteButton({
  lessonId,
  initiallyCompleted,
  nextHref,
}: {
  lessonId: string
  initiallyCompleted: boolean
  nextHref?: string
}) {
  const [completed, setCompleted] = useState(initiallyCompleted)
  const [busy, setBusy] = useState(false)
  const [certificateReady, setCertificateReady] = useState(false)

  async function markComplete() {
    if (completed || busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-sahel-csrf': '1',
        },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setCompleted(true)
        if (data.certificateIssued) setCertificateReady(true)
        // Avance vers la leçon suivante au lieu de recharger la même page,
        // pour que l'apprenant progresse pas à pas sans recommencer au début.
        window.location.href = nextHref || window.location.href
      }
    } finally {
      setBusy(false)
    }
  }

  if (completed) {
    return (
      <p className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        Leçon terminée
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button onClick={markComplete} disabled={busy} className="btn">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Marquer comme terminée
      </button>
      {certificateReady && (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
          <Medal className="h-5 w-5" aria-hidden="true" />
          Félicitations, votre certificat est disponible !{' '}
          <Link href="/tableau-de-bord#certificats" className="underline">
            Le voir
          </Link>
        </p>
      )}
      <p className="text-xs text-slate-400">
        Confirmez simplement : votre progression est enregistrée, même hors ligne conceptuel.
        Note : cela valide aussi la leçon pour le certificat.
      </p>
    </div>
  )
}