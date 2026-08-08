import Image from 'next/image'
import { CalendarDays, ExternalLink, Rss } from 'lucide-react'
import { getCyberViceArticles, type CyberViceArticle } from '@/lib/medium'
import { CYBERVICE_MEDIUM_URL } from '@/lib/constants'
import { formatDateFr } from '@/lib/utils'

/**
 * Widget « Derniers articles CyberVice » — serveur.
 * Le flux RSS est mis en cache par Next.js (revalidation MEDIUM_REVALIDATE_SECONDS) :
 * Medium n'est jamais appelé à chaque visite.
 */
export default async function CyberViceFeed() {
  let articles: CyberViceArticle[] = []
  try {
    articles = await getCyberViceArticles(4)
  } catch {
    // état vide silencieux
  }

  if (articles.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">
        Les derniers articles arrivent bientôt — suivez{' '}
        <a
          href={CYBERVICE_MEDIUM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-teal hover:underline"
        >
          CyberVice sur Medium
        </a>{' '}
        en attendant.
      </div>
    )
  }

  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <li key={article.link}>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[16/9] w-full bg-navy-50">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    loading="lazy"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-navy text-white">
                    <Rss className="h-8 w-8 text-teal" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-navy group-hover:text-teal">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {article.pubDate ? formatDateFr(article.pubDate) : 'Récent'}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}