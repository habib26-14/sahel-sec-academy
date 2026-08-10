import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Music2,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import CourseCard from '@/components/course-card'
import LevelBadge from '@/components/level-badge'
import CyberViceFeed from '@/components/cybervice-feed'
import { COURSE_LEVEL_DESCRIPTIONS, CYBERVICE_MEDIUM_URL, CYBERVICE_TIKTOK_URL } from '@/lib/constants'
import type { CourseRow } from '@/lib/types'

export default async function HomePage() {
  const user = await getCurrentUser()
  const supabase = createClient()
  let featured: CourseRow[] | null = null
  try {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(3)
      .returns<CourseRow[]>()
    featured = data
  } catch {
    featured = null
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="container-x grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-navy-700 px-3 py-1 text-xs font-semibold text-teal">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              100% gratuit
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              Le piratage ne prévient pas. Vous, si.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-navy-100">
              Des cours de cybersécurité gratuits, avec certificat
              vérifiable. Apprenez à votre rythme, protégez vos données et
              bâtissez votre futur numérique.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {!user && (
                <Link href="/inscription" className="btn !px-6 !py-3">
                  Commencer gratuitement
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/cours"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy-100/40 px-6 py-3 font-semibold text-white hover:bg-navy-700"
              >
                Découvrir mon premier cours
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-100">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
                Protégez vos données personnelles
              </li>
              <li className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal" aria-hidden="true" />
                Construisez un CV qui attire les recruteurs
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal" aria-hidden="true" />
                Protégez votre entreprise au quotidien
              </li>
            </ul>
          </div>

          <div className="relative hidden aspect-square overflow-hidden rounded-2xl border border-navy-700 md:block">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-navy-800">
              <ShieldCheck className="h-24 w-24 text-teal" aria-hidden="true" />
              <p className="text-center text-sm text-navy-100">
                Une initiative de la famille
                <br />
                <span className="font-bold text-white">Sahel Sec · CyberVice</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Parcours / niveaux */}
      <section className="bg-slate-50">
        <div className="container-x py-14">
          <h2 className="text-2xl font-bold text-navy">Un parcours progressif</h2>
          <p className="mt-2 text-slate-600">
            Trois niveaux pour apprendre du premier clic jusqu’à la spécialisation.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(['DECOUVERTE', 'FONDAMENTAUX', 'SPECIALISATION'] as const).map((level, i) => (
              <div key={level} className="card p-6">
                <div className="flex items-center justify-between">
                  <LevelBadge level={level} />
                  <span className="text-3xl font-black text-navy-100">{i + 1}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {COURSE_LEVEL_DESCRIPTIONS[level]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cours à la une */}
      <section className="container-x py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">Cours à la une</h2>
          <Link href="/cours" className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline">
            Tout le catalogue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {featured && featured.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center text-slate-500">
            Nos premiers cours sont en cours de préparation - revenez très vite !
          </div>
        )}
      </section>

      {/* CyberVice */}
      <section className="bg-navy py-14 text-white">
        <div className="container-x">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal">DERNIERS ARTICLES</p>
              <h2 className="mt-1 text-2xl font-bold">CyberVice - la veille & l’analyse</h2>
              <p className="mt-2 max-w-xl text-sm text-navy-100">
                Tous les points de vue, les alertes et les tutos écrits par notre
                communauté. Le savoir débarque aussi sur Medium et TikTok.
              </p>
            </div>
            <a
              href={CYBERVICE_MEDIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              Suivre CyberVice sur Medium
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <CyberViceFeed />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-navy-600 bg-navy-800 p-6">
            <div className="flex items-center gap-3">
              <Music2 className="h-8 w-8 text-teal" aria-hidden="true" />
              <p className="text-sm">
                <strong>Des vidéos courtes et claires ?</strong>{' '}
                <span className="text-navy-100">C’est sur TikTok.</span>
              </p>
            </div>
            <a
              href={CYBERVICE_TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !border-teal !text-teal"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              @cybervice26 sur TikTok
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}