import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-black text-navy-100">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy">Page introuvable</h1>
      <p className="mt-2 max-w-md text-slate-600">
        Cette page n’existe pas ou n’est plus disponible. Revenez au catalogue,
        tout est gratuit.
      </p>
      <Link href="/" className="btn mt-6">
        <Home className="h-4 w-4" aria-hidden="true" />
        Retour à l’accueil
      </Link>
    </div>
  )
}