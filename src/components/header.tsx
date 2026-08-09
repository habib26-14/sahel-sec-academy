import Link from 'next/link'
import Logo from '@/components/logo'
import type { SessionUser } from '@/lib/types'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/lib/actions/auth'

export default function Header({ user }: { user: SessionUser | null }) {

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50 hover:text-navy"
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLink('/cours', 'Catalogue')}
          {user && navLink('/tableau-de-bord', 'Mon tableau de bord')}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <span
                className="hidden max-w-[160px] truncate text-sm font-medium text-navy sm:block"
                title={user.fullName ?? undefined}
              >
                {user.fullName ?? user.email}
              </span>
              {/* Déconnexion en POST uniquement : le GET /logout a été supprimé (anti-CSRF). */}
              <form action={signOutAction}>
                <button type="submit" className="btn-outline">
                  Déconnexion
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/connexion" className={cn('btn-outline')}>
                Connexion
              </Link>
              <Link href="/inscription" className="btn">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>

      <nav className="container-x flex items-center gap-1 border-t border-slate-100 py-2 md:hidden">
        {mobileLink('/cours', 'Catalogue')}
        {user && mobileLink('/tableau-de-bord', 'Mes cours')}
      </nav>
    </header>
  )

  function mobileLink(href: string, label: string) {
    return (
      <Link
        href={href}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
      >
        {label}
      </Link>
    )
  }
}