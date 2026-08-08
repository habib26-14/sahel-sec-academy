'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function CertificateLookup() {
  const [code, setCode] = useState('')
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed) router.push(`/verification/${trimmed}`)
  }

  return (
    <form onSubmit={submit} className="flex max-w-md gap-2" role="search">
      <label htmlFor="certCode" className="sr-only">
        Code de vérification
      </label>
      <input
        id="certCode"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Collez le code de vérification…"
        className="input"
        autoComplete="off"
      />
      <button type="submit" className="btn">
        <Search className="h-4 w-4" aria-hidden="true" />
        Vérifier
      </button>
    </form>
  )
}