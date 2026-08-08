'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { loginAction, type AuthActionState } from '@/lib/actions/auth'

const initialState: AuthActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn w-full">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Connexion…' : 'Se connecter'}
    </button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="label">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="vous@exemple.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
        />
      </div>
      <div className="flex justify-end">
        <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-teal hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <SubmitButton />
    </form>
  )
}