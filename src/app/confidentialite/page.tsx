import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default function PrivacyPage() {
  return (
    <div className="container-narrow py-16">
      <h1 className="text-3xl font-bold tracking-tight text-night">
        Politique de confidentialité
      </h1>
      <div className="prose-lean mt-8">
        <h2>Données collectées</h2>
        <p>
          Nous collectons les données strictement nécessaires au fonctionnement
          de la plateforme : nom, adresse email et progression dans les cours.
        </p>
        <h2>Utilisation</h2>
        <p>
          Vos données servent uniquement à personnaliser votre apprentissage,
          délivrer les certificats et améliorer les contenus. Elles ne sont
          jamais vendues ni transmises à des tiers à des fins commerciales.
        </p>
        <h2>Conservation</h2>
        <p>
          Les données sont conservées le temps de votre activité sur la
          plateforme. Vous pouvez demander leur suppression à tout moment.
        </p>
        <h2>Contact</h2>
        <p>
          Pour exercer vos droits :{' '}
          <a href="mailto:contact@sahelsec.academy">contact@sahelsec.academy</a>.
        </p>
      </div>
    </div>
  )
}