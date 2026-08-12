import Reveal from '@/components/reveal'

/**
 * Indicateurs d'audience : placeholders clairement identifiés. Les chiffres
 * réels remplaceront ces valeurs dès que la plateforme aura consolidé ses
 * données (voir note sous la section).
 */
const STATS = [
  { value: '+1 200', label: 'Apprenants' },
  { value: '+20', label: 'Formations' },
  { value: '+15', label: 'Pays africains' },
  { value: '95 %', label: 'Satisfaction' },
]

export default function ImpactSection() {
  return (
    <section className="relative overflow-hidden bg-night py-14 text-white md:py-20">
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">L’impact visé</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Une génération cyber, du Sahel à l’Afrique
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div className="rounded-xl border border-white/10 bg-night-800/60 p-6 text-center backdrop-blur">
                <p className="bg-gradient-to-r from-teal via-teal-300 to-teal bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-night-100/60">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <p className="text-center font-mono text-[11px] uppercase tracking-widest text-night-100/40">
            * Indicateurs provisoires - consolidés avec les données réelles de la plateforme à venir
          </p>
        </Reveal>
      </div>
    </section>
  )
}