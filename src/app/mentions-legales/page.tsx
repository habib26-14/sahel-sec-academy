import type { Metadata } from 'next'
import { COMPANY_NAME, SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = { title: 'Mentions légales' }

export default function LegalPage() {
  return (
    <div className="container-narrow py-16">
      <h1 className="text-3xl font-bold tracking-tight text-night">Mentions légales</h1>
      <div className="prose-lean mt-8">
        <h2>Éditeur de la plateforme</h2>
        <p>
          {SITE_NAME} est une initiative de {COMPANY_NAME}. La plateforme de
          formation est éditée et maintenue par l’équipe {COMPANY_NAME}.
        </p>
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé sur des serveurs sécurisés. Les données de
          production sont stockées sur une infrastructure Supabase régionale.
        </p>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les contenus pédagogiques publiés sur la plateforme sont la propriété
          de {SITE_NAME}, sauf mention contraire. Toute reproduction
          nécessite une autorisation écrite.
        </p>
        <h2>Contact</h2>
        <p>
          Pour toute question relative aux mentions légales :{' '}
          <a href="mailto:contact@sahelsec.academy">contact@sahelsec.academy</a>.
        </p>
      </div>
    </div>
  )
}