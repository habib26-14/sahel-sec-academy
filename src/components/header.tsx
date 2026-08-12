'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/logo'
import type { SessionUser } from '@/lib/types'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { href: '/', label: 'Accueil' },
  { href: '/cours', label: 'Formations' },
  { href: '/#parcours', label: 'Parcours' },
  { href: '/#laboratoires', label: 'Laboratoires' },
  { href: '/verification', label: 'Certifications' },
  { href: '/#cybervice', label: 'Ressources' },
  { href: '/#apropos', label: 'À propos' },
]

export default function Header({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false)
  const isStaff = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className="rounded-md px-3 py-2 text-sm font-medium text-night-100/80 transition-colors hover:bg-white/5 hover:text-white"
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night/85 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Logo dark />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-night-100/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isStaff && (
                <Link href="/admin" className="btn-outline-dark !border-white/10 !bg-white/5">
                  Gestion
                </Link>
              )}
              <Link href="/tableau-de-bord" className="text-sm font-medium text-night-100/80 hover:text-white">
                Mon tableau de bord
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="btn-outline-dark">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/connexion" className="btn-outline-dark">
                Connexion
              </Link>
              <Link href="/inscription" className="btn">
                Commencer gratuitement
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="border-t border-white/10 bg-night lg:hidden" aria-label="Navigation mobile">
          <div className="container-x flex flex-col py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-night-100/85 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-4">
              {user ? (
                <>
                  <Link
                    href="/tableau-de-bord"
                    onClick={() => setOpen(false)}
                    className="btn-outline-dark w-full"
                  >
                    Mon tableau de bord
                  </Link>
                  {isStaff && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="btn-outline-dark w-full">
                      Espace de gestion
                    </Link>
                  )}
                  <form action={signOutAction} className="w-full">
                    <button type="submit" className="btn-outline-dark w-full">
                      Déconnexion
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    onClick={() => setOpen(false)}
                    className={cn('btn-outline-dark w-full')}
                  >
                    Connexion
                  </Link>
                  <Link href="/inscription" onClick={() => setOpen(false)} className="btn w-full">
                    Commencer gratuitement
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}