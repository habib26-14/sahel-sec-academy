'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { forgotPasswordAction, type AuthActionState } from '@/lib/actions/auth'

const initialState: AuthActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn w-full">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Envoi…' : 'M’envoyer le lien'}
    </button>
  )
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState)

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.ok ? (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700" role="status">
          Si un compte existe pour cette adresse, un lien de réinitialisation
          vient d’être envoyé (valable 1 heure).
        </p>
      ) : (
        <>
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
          <SubmitButton />
        </>
      )}
    </form>
  )
}