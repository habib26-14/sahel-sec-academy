'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'

/** Bouton "mode texte" pour les leçons vidéo (transcription intégrale). */
export default function TranscriptToggle({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-navy"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal" aria-hidden="true" />
          Transcription complète (mode texte)
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-800">
            {transcript}
          </p>
        </div>
      )}
    </div>
  )
}