import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getCurrentUser } from '@/lib/auth'

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Sahel Sec Academy - L’académie africaine de cybersécurité',
    template: '%s · Sahel Sec Academy',
  },
  description:
    'L’académie africaine de cybersécurité. Formations gratuites, labs pratiques et certificats vérifiables pour bâtir une Afrique numérique plus sûre.',
  keywords: [
    'cybersécurité',
    'académie',
    'formation gratuite',
    'Sahel',
    'Afrique de l’Ouest',
    'certificat',
    'pentest',
    'SOC',
    'OSINT',
  ],
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
      <body className={`${geist.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}