import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'
import GoogleButton from '@/components/auth/google-button'

export const metadata: Metadata = { title: 'Connexion' }

export default function LoginPage({
  searchParams,
}: {
  searchParams: { checkEmail?: string; confirmed?: string; error?: string }
}) {
  return (
    <div className="container-x flex justify-center py-14">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy">Bon retour parmi nous</h1>
        <p className="mt-1 text-sm text-slate-600">
          Connectez-vous pour reprendre vos cours et votre progression.
        </p>

        {searchParams.checkEmail && (
          <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">
            Votre compte est créé ! Confirmez votre email, puis connectez-vous.
          </p>
        )}
        {searchParams.confirmed && (
          <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">
            Email confirmé, vous pouvez vous connecter.
          </p>
        )}
        {searchParams.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            La connexion a échoué, réessayez.
          </p>
        )}

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          ou
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleButton />

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="font-semibold text-teal hover:underline">
            Inscrivez-vous gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}