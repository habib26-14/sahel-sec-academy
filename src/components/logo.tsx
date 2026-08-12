import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Logo({
  className,
  dark = false,
}: {
  className?: string
  dark?: boolean
}) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-teal/30 bg-gradient-to-br from-teal/20 to-transparent text-teal">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          {/* Bouclier */}
          <path d="M12 2.5 19 5v6c0 4.8-3 8.6-7 10.5C8 19.6 5 15.8 5 11V5l7-2.5Z" />
          {/* Carte de l'Afrique stylisée dans le bouclier */}
          <path d="M9.7 9c2.2-.6 4.4.2 6 1.6-.5 1.2-1.2 2.5-2.4 3.3-1.6.9-3.5 1.1-5.2.4.6-.7 1.2-1.5 1.6-2.4" />
          <path d="M8.2 12.6c-.5 1.3 0 2.6.8 3.6" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className={cn('block text-base font-bold tracking-tight', dark ? 'text-white' : 'text-night')}>
          Sahel Sec Academy
        </span>
        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-teal">
          Cybersecurity Academy
        </span>
      </span>
    </Link>
  )
}