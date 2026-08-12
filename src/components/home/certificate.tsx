import Link from 'next/link'
import { ArrowRight, BadgeCheck, Fingerprint, ShieldCheck } from 'lucide-react'
import Reveal from '@/components/reveal'

/** QR Code stylisé (visuel placeholder, non scannable). */
function QrPlaceholder() {
  const cells: Array<[number, number]> = [
    [8, 8], [10, 8], [12, 8], [8, 10], [12, 10], [8, 12], [10, 12], [12, 12],
    [18, 8], [20, 8], [22, 8], [18, 12], [22, 12], [18, 20], [18, 22],
    [8, 18], [8, 20], [8, 22], [10, 22], [12, 22], [20, 18], [22, 20],
    [15, 15], [16, 16], [14, 18], [18, 14], [20, 10], [10, 18], [12, 14],
  ]
  return (
    <svg viewBox="0 0 30 30" className="h-20 w-20" aria-hidden="true">
      {cells.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="2.6" height="2.6" fill="#040A14" />
      ))}
    </svg>
  )
}

export default function CertificateSection() {
  return (
    <section id="certification" className="bg-white py-16 md:py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Certification</p>
          <h2 className="section-title mt-3">Transformez vos compétences en preuves.</h2>
          <p className="section-lead">
            Chaque formation validée débouche sur un certificat numérique
            vérifiable : identifiant unique, statut public, QR Code. Partagez-le
            avec les recruteurs, les employeurs et les institutions.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
              <p className="text-sm text-slate-600">
                <strong className="font-semibold text-night">Statut public vérifié</strong>{' '}
                — toute personne peut contrôler l’authenticité d’un certificat en ligne.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
              <p className="text-sm text-slate-600">
                <strong className="font-semibold text-night">Identifiant unique</strong>{' '}
                — chaque certificat possède un code de vérification infalsifiable.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
              <p className="text-sm text-slate-600">
                <strong className="font-semibold text-night">PDF téléchargeable</strong>{' '}
                — un document professionnel prêt à joindre à votre CV.
              </p>
            </li>
          </ul>

          <div className="mt-9">
            <Link href="/verification" className="btn !px-7 !py-3">
              Vérifier un certificat
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {/* Aperçu du certificat */}
        <Reveal delay={140}>
          <div className="relative mx-auto max-w-md">
            <div
              className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-teal/15 via-transparent to-teal/10 blur-xl"
              aria-hidden="true"
            />
            <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-night/10 sm:p-8">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-teal">
                  Sahel Sec Academy
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-teal-700">
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                  Vérifié
                </span>
              </div>

              <div className="mt-6 border-y border-slate-100 py-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Certificat de réussite
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-night">
                  {`Votre nom complet`}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  a validé la formation
                </p>
                <p className="mt-1 font-semibold text-night">
                  {`Nom de la formation`}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="space-y-2 font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  <p>Émis le · JJ/MM/AAAA</p>
                  <p className="text-night">
                    ID · <span className="text-teal-700">SSA-XXXX-0000</span>
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <QrPlaceholder />
                </div>
              </div>

              <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Aperçu illustratif - vérifié sur sahel-sec-academy.vercel.app
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}