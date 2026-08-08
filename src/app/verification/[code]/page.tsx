import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { formatDateFr } from '@/lib/utils'
import CertificateLookup from '@/components/verify/certificate-lookup'

export const metadata: Metadata = { title: 'Vérification du certificat' }

interface VerificationResult {
  learner_name: string
  course_title: string
  issued_at: string
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: { code: string }
}) {
  // Anti-énumération brute-force des codes à 20 caractères :
  // 20 vérifications/min par code + plafond global par IP.
  const ok =
    rateLimit(`verify:${params.code.toLowerCase()}`, 20, 60_000) &&
    rateLimit(`verify-global`, 120, 60_000)

  const supabase = createClient()
  let result: VerificationResult | null = null
  if (ok) {
    try {
      const { data } = await supabase.rpc('verify_certificate', {
        p_code: params.code,
      })
      result = (data?.[0] as VerificationResult | undefined) ?? null
    } catch {
      // Service injoignable : la page reste consultable.
    }
  }

  return (
    <div className="container-x max-w-xl py-16">
      {result ? (
        <div className="card overflow-hidden">
          <div className="border-b border-teal-300 bg-teal-50 px-6 py-4">
            <p className="flex items-center gap-2 text-lg font-bold text-teal-700">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              Certificat valide
            </p>
            <p className="text-sm text-teal-700/80">
              Ce certificat est authentique et émis par Sahel Sec Academy.
            </p>
          </div>
          <dl className="space-y-4 px-6 py-6">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Apprenant·e</dt>
              <dd className="mt-0.5 text-lg font-bold text-navy">{result.learner_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Cours suivi</dt>
              <dd className="mt-0.5 text-lg font-semibold text-navy">{result.course_title}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Date d’obtention</dt>
              <dd className="mt-0.5 text-navy">{formatDateFr(result.issued_at)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Code vérifié</dt>
              <dd className="mt-0.5 font-mono text-sm text-teal">{params.code}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-navy">
            Aucun certificat ne correspond à ce code
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Vérifiez le code saisi (il est sensible à la casse) ou demandez le
            certificat original à son détenteur.
          </p>
          <div className="mt-6">
            <CertificateLookup />
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-400">
        <Link href="/verification" className="hover:text-teal">
          ← Vérifier un autre certificat
        </Link>
      </p>
    </div>
  )
}