import { Binary, Briefcase, Crosshair, Users } from 'lucide-react'
import Reveal from '@/components/reveal'

const PILLARS = [
  {
    icon: Crosshair,
    num: '01',
    title: 'Expertise terrain',
    text: 'Des contenus conçus autour de situations réelles de cybersécurité.',
  },
  {
    icon: Binary,
    num: '02',
    title: 'Apprentissage pratique',
    text: 'Passez de la théorie à la pratique grâce aux labs et exercices.',
  },
  {
    icon: Briefcase,
    num: '03',
    title: 'Parcours professionnel',
    text: 'Construisez progressivement les compétences nécessaires pour entrer dans le secteur.',
  },
  {
    icon: Users,
    num: '04',
    title: 'Impact africain',
    text: 'Développons ensemble les compétences cyber dont l’Afrique a besoin.',
  },
]

export default function Pillars() {
  return (
    <section id="apropos" className="bg-white py-16 md:py-24">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Pourquoi Sahel Sec Academy ?</p>
          <h2 className="section-title mt-3 text-balance">
            Une école de cyber, pensée pour le Sahel
          </h2>
          <p className="section-lead">
            Pas une simple plateforme de cours : un écosystème de formation,
            de pratique et d’employabilité cyber.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.num} delay={i * 90}>
              <article className="card card-hover group relative h-full overflow-hidden p-6">
                <span
                  className="absolute -right-2 -top-4 font-mono text-6xl font-bold text-night-50 transition-colors group-hover:text-teal/10"
                  aria-hidden="true"
                >
                  {pillar.num}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-md border border-teal/25 bg-teal/10 text-teal">
                  <pillar.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-night">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}