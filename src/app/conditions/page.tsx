import type { Metadata } from 'next'

export const metadata: Metadata = { title: "Conditions d'utilisation" }

export default function TermsPage() {
  return (
    <div className="container-narrow py-16">
      <h1 className="text-3xl font-bold tracking-tight text-night">
        Conditions d’utilisation
      </h1>
      <div className="prose-lean mt-8">
        <h2>Accès à la plateforme</h2>
        <p>
          L’accès aux formations est gratuit et ouvert à tous. Un compte
          utilisateur est requis pour suivre les cours et obtenir des
          certificats.
        </p>
        <h2>Usage responsable</h2>
        <p>
          Les compétences présentées doivent être pratiquées uniquement dans un
          cadre légal et autorisé (laboratoires, périmètres de test, missions
          contractuelles). Toute utilisation illégale est interdite.
        </p>
        <h2>Certificats</h2>
        <p>
          Les certificats attestent la validation des évaluations associées à
          une formation. Ils sont vérifiables en ligne par identifiant unique.
        </p>
        <h2>Comptes</h2>
        <p>
          Vous êtes responsable de la confidentialité de vos identifiants et de
          toute activité réalisée depuis votre compte.
        </p>
      </div>
    </div>
  )
}