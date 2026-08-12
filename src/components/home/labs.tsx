import Link from 'next/link'
import {
  ArrowRight,
  Boxes,
  Crosshair,
  Fingerprint,
  Radar,
  Server,
  ShieldAlert,
  TerminalSquare,
} from 'lucide-react'
import Reveal from '@/components/reveal'

const LABS = [
  { icon: TerminalSquare, title: 'Web Pentest', text: 'Attaque et défense des applications web.' },
  { icon: Server, title: 'Network Security', text: 'Analyse de trafic, filtrage et segmentation.' },
  { icon: ShieldAlert, title: 'Active Directory', text: 'Domaine Windows : risques et durcissement.' },
  { icon: Radar, title: 'SOC Investigation', text: 'Alertes, corrélation et escalade d’incidents.' },
  { icon: Fingerprint, title: 'Digital Forensics', text: 'Collecte et analyse de preuves numériques.' },
  { icon: Crosshair, title: 'Red Team', text: 'Emulation d’adversaire et scénarios réalistes.' },
]

export default function LabsSection() {
  return (
    <section id="laboratoires" className="relative overflow-hidden bg-night py-16 text-white md:py-24">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-x relative">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Laboratoires</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Apprenez en attaquant.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-night-100/70">
              La cybersécurité ne s’apprend pas uniquement dans des diapositives.
              Testez, analysez, exploitez et défendez.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/cours" className="btn-outline-dark !px-7 !py-3">
              Explorer les labs
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map((lab, i) => (
            <Reveal key={lab.title} delay={i * 70}>
              <article className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-night-800/60 p-6 transition-all hover:border-teal/40 hover:bg-night-800">
                <span
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md border border-teal/25 bg-teal/10 text-teal">
                    <lab.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Boxes className="h-4 w-4 text-night-100/30" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-bold tracking-tight">{lab.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-night-100/70">{lab.text}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-teal/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
                  Environnement sécurisé
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}