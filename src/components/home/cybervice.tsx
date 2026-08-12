import Image from 'next/image'
import { ArrowRight, CalendarDays, ExternalLink, Rss } from 'lucide-react'
import { getCyberViceArticles, type CyberViceArticle } from '@/lib/medium'
import { CYBERVICE_MEDIUM_URL } from '@/lib/constants'
import { formatDateFr } from '@/lib/utils'
import Reveal from '@/components/reveal'

const CATEGORIES = [
  'Threat Intelligence',
  'OSINT',
  'Pentest',
  'Défense',
  'Gouvernance',
  'Actualités',
]

export default async function CyberViceSection() {
  let articles: CyberViceArticle[] = []
  try {
    articles = await getCyberViceArticles(4)
  } catch {
    articles = []
  }

  const [featured, ...rest] = articles

  return (
    <section id="cybervice" className="bg-white py-16 md:py-24">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">CyberVice - Intelligence centre</p>
            <h2 className="section-title mt-3">Comprendre. Analyser. Anticiper.</h2>
            <p className="section-lead">
              La veille et l’analyse de notre communauté : menace, OSINT,
              technique et gouvernance pour décider avec clarté.
            </p>
          </div>
          <a
            href={CYBERVICE_MEDIUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Suivre CyberVice sur Medium
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:border-teal/40 hover:text-teal"
              >
                {cat}
              </span>
            ))}
          </div>
        </Reveal>

        {featured && (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Article principal */}
            <Reveal>
              <a
                href={featured.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-hover group flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/8] w-full bg-night">
                  {featured.image ? (
                    <Image
                      src={featured.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      loading="lazy"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid-bg absolute inset-0 flex items-center justify-center">
                      <Rss className="h-10 w-10 text-teal/60" aria-hidden="true" />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-md border border-teal/40 bg-night-900/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-teal backdrop-blur">
                    À la une
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold tracking-tight text-night transition-colors group-hover:text-teal">
                    {featured.title}
                  </h3>
                  {featured.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{featured.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {featured.pubDate ? formatDateFr(featured.pubDate) : 'Récent'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-teal">
                      Lire l’analyse
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>

            {/* Articles secondaires */}
            <div className="flex flex-col gap-4">
              {rest.map((article, i) => (
                <Reveal key={article.link} delay={i * 80} className="flex-1">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card card-hover group flex h-full items-center gap-4 p-5"
                  >
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded-md bg-night">
                      {article.image ? (
                        <Image
                          src={article.image}
                          alt=""
                          width={64}
                          height={56}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Rss className="h-5 w-5 text-teal/60" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-sm font-bold tracking-tight text-night transition-colors group-hover:text-teal">
                        {article.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {article.pubDate ? formatDateFr(article.pubDate) : 'Récent'}
                      </p>
                    </div>
                  </a>
                </Reveal>
              ))}
              {rest.length === 0 && (
                <Reveal className="flex-1">
                  <div className="card flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">
                    De nouvelles analyses arrivent sur Medium - suivez CyberVice
                    pour ne rien manquer.
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        )}

        {!featured && (
          <Reveal>
            <div className="card mt-12 p-10 text-center">
              <Rss className="mx-auto h-8 w-8 text-teal" aria-hidden="true" />
              <p className="mt-3 text-sm text-slate-600">
                Les dernières analyses CyberVice arrivent bientôt. Suivez{' '}
                <a
                  href={CYBERVICE_MEDIUM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal hover:underline"
                >
                  CyberVice sur Medium
                </a>{' '}
                en attendant.
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}