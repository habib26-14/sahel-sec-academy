import Link from 'next/link'
import {
  ArrowRight,
  Clock,
  Flame,
  Globe,
  Layers,
  ServerCog,
  ShieldHalf,
  Search,
} from 'lucide-react'
import { LEVEL_LABELS } from '@/lib/constants'
import type { CourseRow } from '@/lib/types'
import Reveal from '@/components/reveal'

/**
 * Placeholders de spécialisation, clairement marqués « Bientôt » :
 * ils décrivent les filières vers lesquelles la plateforme s'oriente
 * sans inventer de formations existantes.
 */
const SPECIALIZATIONS = [
  {
    icon: Flame,
    title: 'Pentest & Offensive Security',
    text: 'Identifier et exploiter les vulnérabilités dans un cadre légal.',
    tag: 'Bientôt',
  },
  {
    icon: ShieldHalf,
    title: 'Blue Team & SOC',
    text: 'Détection, analyse et réponse aux incidents.',
    tag: 'Bientôt',
  },
  {
    icon: ServerCog,
    title: 'Cloud Security',
    text: 'Sécuriser les infrastructures AWS, Azure et GCP.',
    tag: 'Bientôt',
  },
  {
    icon: Globe,
    title: 'Cybersécurité industrielle (OT)',
    text: 'Sécuriser les infrastructures industrielles et systèmes critiques.',
    tag: 'Bientôt',
  },
  {
    icon: Layers,
    title: 'GRC & Conformité',
    text: 'ISO 27001, gestion des risques, gouvernance et conformité.',
    tag: 'Bientôt',
  },
  {
    icon: Search,
    title: 'OSINT & Cyber Intelligence',
    text: 'Collecte, analyse et exploitation du renseignement open source.',
    tag: 'Bientôt',
  },
]

export default function TrainingsSection({ courses }: { courses: CourseRow[] }) {
  return (
    <section id="formations" className="bg-slate-50 py-16 md:py-24">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Formations</p>
            <h2 className="section-title mt-3">Des cursus conçus pour les métiers du terrain</h2>
            <p className="section-lead">
              Chaque formation combine contenu, mise en pratique et évaluation
              menant à un certificat vérifiable.
            </p>
          </div>
          <Link href="/cours" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
            Voir tout le catalogue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </Reveal>

        {/* Cours réels de l'académie */}
        {courses.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <Reveal key={course.id} delay={i * 80}>
                <Link
                  href={`/cours/${course.slug}`}
                  className="card card-hover group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative flex h-36 items-center justify-center overflow-hidden bg-night">
                    <div className="grid-bg absolute inset-0" aria-hidden="true" />
                    <Layers className="h-10 w-10 text-teal/70" aria-hidden="true" />
                    <span className="absolute left-4 top-4 rounded-md border border-teal/30 bg-night-900/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-teal backdrop-blur">
                      {LEVEL_LABELS[course.level]}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold tracking-tight text-night transition-colors group-hover:text-teal">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {course.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-5 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        ~{course.estimated_hours} h
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-teal">
                        Voir la formation
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {/* Spécialisations à venir (placeholders explicites) */}
        <div className="mt-12">
          <Reveal>
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <p className="text-sm font-bold uppercase tracking-wide text-night">
                Spécialisations du programme
              </p>
              <span className="rounded-md bg-night-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-night-400">
                Feuille de route
              </span>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALIZATIONS.map((spec, i) => (
              <Reveal key={spec.title} delay={i * 70}>
                <article className="group relative h-full rounded-xl border border-dashed border-slate-300 bg-white p-6 transition-all hover:border-teal/40 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-night-400 transition-colors group-hover:border-teal/30 group-hover:text-teal">
                      <spec.icon className="h-4.5 w-4.5 h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      {spec.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-bold tracking-tight text-night">{spec.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{spec.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}