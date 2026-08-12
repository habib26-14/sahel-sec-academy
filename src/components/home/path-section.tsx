import { ArrowDown } from 'lucide-react'
import Link from 'next/link'
import Reveal from '@/components/reveal'

const STEPS = [
  {
    num: '01',
    title: 'DÉCOUVERTE',
    subtitle: 'Aucune expérience requise',
    points: ['Vocabulaire essentiel', 'Premiers réflexes cyber', 'Usages du quotidien'],
  },
  {
    num: '02',
    title: 'FONDAMENTAUX',
    subtitle: 'Réseaux · Linux · Windows · Sécurité',
    points: ['Comprendre les systèmes', 'Bases techniques solides', 'Attaques courantes'],
  },
  {
    num: '03',
    title: 'SPÉCIALISATION',
    subtitle: 'Pentest · Red Team · SOC · Cloud · OSINT · GRC',
    points: ['Pratique avancée', 'Métiers spécialisés', 'Préparation à l’emploi'],
  },
]

export default function PathSection() {
  return (
    <section id="parcours" className="bg-night py-16 text-white md:py-24">
      <div className="grid-bg absolute" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Parcours pédagogique</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Un chemin, trois étapes, un métier
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-night-100/70">
            De vos premiers clics jusqu’à la spécialisation : chaque étape
            valide les acquis de la précédente.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              <Reveal delay={i * 110} className="h-full">
                <article className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-night-800/70 p-7 transition-colors hover:border-teal/40">
                  <span className="absolute right-5 top-4 font-mono text-4xl font-bold text-white/10">
                    {step.num}
                  </span>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-teal">
                    Étape {step.num}
                  </p>
                  <h3 className="mt-3 text-xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wide text-night-100/60">
                    {step.subtitle}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-night-100/80">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <span className="h-1 w-4 rounded-full bg-teal" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>

              {i < STEPS.length - 1 && (
                <div className="absolute -right-6 top-1/2 z-10 hidden -translate-y-1/2 lg:block" aria-hidden="true">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-teal/40 bg-night text-teal">
                    <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Link href="/cours" className="btn !px-7 !py-3">
            Parcourir les formations
          </Link>
        </Reveal>
      </div>
    </section>
  )
}