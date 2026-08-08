import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-teal">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-bold text-navy">Sahel Sec Academy</span>
        <span className="block text-[11px] font-medium uppercase tracking-wide text-teal">
          Cybersécurité pour tous
        </span>
      </span>
    </Link>
  )
}