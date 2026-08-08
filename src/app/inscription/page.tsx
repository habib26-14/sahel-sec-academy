import type { Metadata } from 'next'
import Link from 'next/link'
import RegisterForm from '@/components/auth/register-form'

export const metadata: Metadata = { title: 'Inscription' }

export default function RegisterPage() {
  return (
    <div className="container-x flex justify-center py-14">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy">Rejoignez Sahel Sec Academy</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tous les cours sont gratuits, pour toujours.
        </p>

        <div className="mt-6">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà inscrit·e ?{' '}
          <Link href="/connexion" className="font-semibold text-teal hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  )
}