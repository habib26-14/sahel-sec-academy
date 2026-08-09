import Link from 'next/link'
import { BookOpen, FileJson2, LayoutDashboard, PlusCircle } from 'lucide-react'
import { requireStaff } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff()

  const navClass =
    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold'

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Espace de gestion</h1>
          <p className="text-sm text-slate-600">
            Créez et publiez les cours de l’Academy.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          <Link href="/admin" className={`${navClass} text-navy hover:bg-navy-50`}>
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Mes cours
          </Link>
          <Link href="/admin/importer" className={`${navClass} text-navy hover:bg-navy-50`}>
            <FileJson2 className="h-4 w-4" aria-hidden="true" />
            Importer
          </Link>
          <Link href="/admin/nouveau" className="btn">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Nouveau cours
          </Link>
        </nav>
      </div>
      {children}
      <p className="mt-8 text-xs text-slate-400">
        Voir l’interface apprenant :{' '}
        <Link href="/cours" className="inline-flex items-center gap-1 text-teal hover:underline">
          <BookOpen className="h-3 w-3" aria-hidden="true" /> Catalogue
        </Link>
      </p>
    </div>
  )
}