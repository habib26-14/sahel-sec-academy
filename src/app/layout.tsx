import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: {
    default: 'Sahel Sec Academy — Cybersécurité gratuite pour tous',
    template: '%s · Sahel Sec Academy',
  },
  description:
    'Plateforme e-learning gratuite de cybersécurité pour l’Afrique de l’Ouest et le Sahel. Cours gratuits, avec certificat vérifiable.',
  keywords: ['cybersécurité', 'cours gratuit', 'e-learning', 'Sahel', 'Afrique de l’Ouest', 'certificat'],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser()

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}