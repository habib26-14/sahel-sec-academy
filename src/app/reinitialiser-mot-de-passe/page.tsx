import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ResetPasswordForm from '@/components/auth/reset-password-form'

export const metadata: Metadata = { title: 'Nouveau mot de passe' }

export const dynamic = 'force-dynamic'

/**
 * Accessible via un lien de récupération (code échangé par le callback en
 * `type=recovery`) ou, à défaut, par une session valide. Sans l'un des
 * deux, un message explique comment obtenir un nouveau lien.
 */
export default async function ResetPasswordPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const hasRecovery = Boolean(user?.email)

  return (
    <div className="container-x flex justify-center py-14">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy">Nouveau mot de passe</h1>
        {hasRecovery ? (
          <>
            <p className="mt-1 text-sm text-slate-600">
              Choisissez un nouveau mot de passe pour le compte{' '}
              <span className="font-semibold text-navy">{user?.email}</span>.
            </p>
            <div className="mt-6">
              <ResetPasswordForm />
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Ce lien est expiré ou déjà utilisé.{' '}
            <Link href="/mot-de-passe-oublie" className="font-semibold underline">
              Demandez un nouveau lien
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}