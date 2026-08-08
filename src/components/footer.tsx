import Link from 'next/link'
import { Rss, Music2, ExternalLink, ShieldCheck } from 'lucide-react'
import { CYBERVICE_MEDIUM_URL, CYBERVICE_TIKTOK_URL, SITE_NAME, COMPANY_NAME } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-teal">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-bold text-navy">{SITE_NAME}</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-slate-600">
            Des cours de cybersécurité gratuits, en français, ouverts à tous.
            Une initiative de {COMPANY_NAME} pour rendre le numérique plus sûr
            au Sahel et en Afrique de l’Ouest.
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            Fait avec
            <span aria-hidden="true">♥</span>
            pour les 100% gratuits, du premier clic au certificat.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-navy">Navigation</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link className="hover:text-teal" href="/cours">Catalogue des cours</Link></li>
            <li><Link className="hover:text-teal" href="/inscription">Créer un compte</Link></li>
            <li><Link className="hover:text-teal" href="/connexion">Se connecter</Link></li>
            <li><Link className="hover:text-teal" href="/verification">Vérifier un certificat</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-navy">Découvrez CyberVice</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <a
                href={CYBERVICE_MEDIUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-teal"
              >
                <Rss className="h-4 w-4" aria-hidden="true" />
                Articles Medium
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={CYBERVICE_TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-teal"
              >
                <Music2 className="h-4 w-4" aria-hidden="true" />
                TikTok
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            {new Date().getFullYear()} · {COMPANY_NAME} · Licence ouverte, savoir partagé
          </p>
        </div>
      </div>
    </footer>
  )
}