import Link from 'next/link'
import { ArrowRight, BadgeCheck, BookOpenCheck, ShieldCheck } from 'lucide-react'
import AfricaNetwork from '@/components/home/africa-network'

const TRUST = [
  { icon: BookOpenCheck, label: 'Formations accessibles' },
  { icon: ShieldCheck, label: 'Apprentissage pratique' },
  { icon: BadgeCheck, label: 'Certificats vérifiables' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-teal/10 blur-[140px]"
        aria-hidden="true"
      />
      <div className="scanline absolute inset-0" aria-hidden="true" />

      <div className="container-x relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            L’académie africaine de cybersécurité
          </p>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
            Formez-vous.
            <br />
            <span className="bg-gradient-to-r from-teal via-teal-300 to-teal bg-clip-text text-transparent">
              Protégez.
            </span>
            <br />
            Impactez.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-night-100/80">
            Développez des compétences concrètes en cybersécurité et participez
            à la construction d’une Afrique numérique plus sûre.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/cours" className="btn !px-7 !py-3.5 !text-base">
              Découvrir les formations
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/inscription"
              className="btn-outline-dark !px-7 !py-3.5 !text-base"
            >
              Commencer gratuitement
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-night-100/85">
                <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <AfricaNetwork />
          </div>
        </div>
      </div>

      {/* Bandeau de statut */}
      <div className="relative border-t border-white/10 bg-night-900/60">
        <div className="container-x flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-4 font-mono text-[11px] uppercase tracking-widest text-night-100/55">
          <span>Formation gratuite · Toi inclus</span>
          <span className="hidden text-teal/80 sm:inline">Certificats vérifiables en ligne</span>
          <span>Laboratoires · Parcours · Mentorat</span>
        </div>
      </div>
    </section>
  )
}