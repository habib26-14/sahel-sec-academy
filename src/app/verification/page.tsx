import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import CertificateLookup from '@/components/verify/certificate-lookup'

export const metadata: Metadata = { title: 'Vérifier un certificat' }

export default function VerifyLandingPage() {
  return (
    <div className="container-x flex flex-col items-center py-16 text-center">
      <ShieldCheck className="h-14 w-14 text-teal" aria-hidden="true" />
      <h1 className="mt-4 text-3xl font-bold text-navy">Vérification de certificat</h1>
      <p className="mt-2 max-w-lg text-slate-600">
        Saisissez le code de vérification inscrit sur un certificat Sahel Sec
        Academy pour confirmer son authenticité.
      </p>
      <div className="mt-6 w-full">
        <CertificateLookup />
      </div>
    </div>
  )
}