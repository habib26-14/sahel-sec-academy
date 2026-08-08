'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, ImagePlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string
  onChange: (url: string) => void
}

/** Compresse l'image côté client puis l'uploade. */
async function compressAndUpload(file: File): Promise<string> {
  const supabase = createClient()

  // Limite explicite avant compression : 8 Mo (le bucket limite à 10 Mo ;
  // rejet précoce pour éviter une compression inutile en mémoire).
  const MAX_INPUT = 8 * 1024 * 1024
  if (file.size > MAX_INPUT) {
    throw new Error('Image trop lourde (maximum 8 Mo avant compression).')
  }

  // Compression : max 1280px de large, JPEG q0.8
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1280 / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponible')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Compression impossible'))), 'image/jpeg', 0.8),
  )

  const path = `covers/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('course-media').upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: false,
    cacheControl: '31536000',
  })
  if (error) throw new Error("Échec de l'upload, réessayez.")

  const { data: pub } = supabase.storage.from('course-media').getPublicUrl(path)
  return pub.publicUrl
}

export default function CoverUploader({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const url = await compressAndUpload(file)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="label">Image de couverture (optionnelle)</span>
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200">
          <Image
            src={value}
            alt="Aperçu de la couverture"
            width={1280}
            height={720}
            className="h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white"
            aria-label="Retirer la couverture"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 hover:border-teal">
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Compression et envoi…
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              Choisir une image (compressée automatiquement)
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <input type="hidden" name="coverImageUrl" value={value} readOnly />
    </div>
  )
}