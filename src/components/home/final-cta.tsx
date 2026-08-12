import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import Reveal from '@/components/reveal'

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-night py-20 text-white md:py-28">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div className="absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-teal/10 blur-[130px]" aria-hidden="true" />

      <Reveal className="container-x relative mx-auto max-w-3xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-teal/30 bg-teal/10 text-teal">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Votre carrière en cybersécurité commence ici.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-night-100/75">
          Apprenez gratuitement. Pratiquez réellement. Construisez votre expertise.
        </p>
        <div className="mt-9">
          <Link href="/inscription" className="btn !px-8 !py-4 !text-base">
            Commencer gratuitement
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-night-100/45">
          Sans carte bancaire · Certificat vérifiable · Open source
        </p>
      </Reveal>
    </section>
  )
}