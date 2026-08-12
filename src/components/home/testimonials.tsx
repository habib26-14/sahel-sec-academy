import { Quote, UserRound } from 'lucide-react'
import Reveal from '@/components/reveal'

/**
 * Témoignages : placeholders d'apprenants types de la région, clairement
 * marqués « Témoignage à venir ». Ils seront remplacés par de vrais
 * retours d'apprenants dès que la communauté les partagera.
 */
const TESTIMONIALS = [
  {
    name: 'Apprenant·e — profil type',
    role: 'Étudiant·e en informatique',
    country: 'Sahel',
    course: 'Formation en préparation',
    text: 'Votre témoignage prendra place ici. Nous publierons les retours d’expérience réels de la communauté dès leur arrivée.',
  },
  {
    name: 'Apprenant·e — profil type',
    role: 'Technicien·ne réseau',
    country: 'Afrique de l’Ouest',
    course: 'Formation en préparation',
    text: 'Une place est réservée ici pour les parcours qui commencent par des bases et mènent à une vraie spécialisation.',
  },
  {
    name: 'Apprenant·e — profil type',
    role: 'Étudiant·e en sécurité',
    country: 'Afrique centrale',
    course: 'Formation en préparation',
    text: 'Ce retrait d’expérience illustrera comment les labs et la pratique transforment la théorie en compétences employables.',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">La communauté</p>
          <h2 className="section-title mt-3">Ils se forment. Leurs histoires arrivent.</h2>
          <p className="section-lead">
            Les premiers témoignages de nos apprenants seront publiés ici.
            Cette section est prête à les accueillir.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 90}>
              <figure className="card card-hover relative h-full p-6">
                <Quote className="h-6 w-6 text-teal/30" aria-hidden="true" />
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-teal/30 bg-teal/10 text-teal">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-night">{t.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.role} · {t.country}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-teal-700">
                      {t.course}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}