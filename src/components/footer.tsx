import Link from 'next/link'
import { ExternalLink, Mail, MapPin, Music2, Rss } from 'lucide-react'
import Logo from '@/components/logo'
import { CYBERVICE_MEDIUM_URL, CYBERVICE_TIKTOK_URL, COMPANY_NAME } from '@/lib/constants'

const NAV = [
  { href: '/cours', label: 'Formations' },
  { href: '/#parcours', label: 'Parcours' },
  { href: '/#laboratoires', label: 'Labs' },
  { href: '/verification', label: 'Certifications' },
  { href: '/#cybervice', label: 'CyberVice' },
  { href: '/#apropos', label: 'À propos' },
]

const LEGAL = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Politique de confidentialité' },
  { href: '/conditions', label: "Conditions d'utilisation" },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-night text-white">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-night-100/70">
            Former. Protéger. Impacter. L’académie qui transforme les
            débutants en professionnels capables de protéger les organisations.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-teal/25 bg-teal/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-teal">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Sahel &amp; Afrique de l’Ouest
          </p>
        </div>

        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            Navigation
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-night-100/75">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition-colors hover:text-teal">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            Communauté
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-night-100/75">
            <li>
              <Link href="/inscription" className="transition-colors hover:text-teal">
                Rejoindre l’académie
              </Link>
            </li>
            <li>
              <Link href="/verification" className="transition-colors hover:text-teal">
                Vérifier un certificat
              </Link>
            </li>
            <li>
              <a
                href={CYBERVICE_MEDIUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-teal"
              >
                <Rss className="h-4 w-4" aria-hidden="true" />
                CyberVice sur Medium
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={CYBERVICE_TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-teal"
              >
                <Music2 className="h-4 w-4" aria-hidden="true" />
                @cybervice26 sur TikTok
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@sahelsec.academy"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-teal"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                contact@sahelsec.academy
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            Légal
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-night-100/75">
            {LEGAL.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition-colors hover:text-teal">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-night-100/50">
            © {new Date().getFullYear()} · {COMPANY_NAME} · Licence ouverte,
            savoir partagé.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-2 py-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-night-100/40">
            Former. Protéger. Impacter.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-night-100/40">
            Sahel Sec Academy · Intelligence cyber africaine
          </p>
        </div>
      </div>
    </footer>
  )
}