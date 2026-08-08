'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { resetPasswordAction, type AuthActionState } from '@/lib/actions/auth'

const initialState: AuthActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn w-full">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Enregistrement…' : 'Réinitialiser le mot de passe'}
    </button>
  )
}

export default function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPasswordAction, initialState)

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="password" className="label">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="input"
          placeholder="8 caractères minimum"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">
          Confirmation
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="input"
          placeholder="Répétez le mot de passe"
        />
      </div>
      <SubmitButton />
    </form>
  )
}