'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { registerAction, type AuthActionState } from '@/lib/actions/auth'

const initialState: AuthActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn w-full">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Création du compte…' : 'Créer mon compte gratuit'}
    </button>
  )
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState)

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700" role="status">
          Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse,
          puis connectez-vous.
        </p>
      )}
      <div>
        <label htmlFor="fullName" className="label">
          Nom complet
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          className="input"
          placeholder="Awa Diallo"
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
          placeholder="8 caractères minimum"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="input"
          placeholder="8 caractères minimum"
        />
      </div>
      <SubmitButton />
      <p className="text-xs leading-relaxed text-slate-500">
        Vos données restent chez nous : aucun partage, aucun usage commercial.
        Inscription 100% gratuite.
      </p>
    </form>
  )
}