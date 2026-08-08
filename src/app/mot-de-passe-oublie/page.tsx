import type { Metadata } from 'next'
import Link from 'next/link'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'

export const metadata: Metadata = { title: 'Mot de passe oublié' }

export default function ForgotPasswordPage() {
  return (
    <div className="container-x flex justify-center py-14">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-slate-600">
          Saisissez votre adresse email : nous vous enverrons un lien de
          réinitialisation valable une heure.
        </p>

        <div className="mt-6">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/connexion" className="font-semibold text-teal hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}