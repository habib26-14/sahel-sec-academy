import { CardSkeleton } from '@/components/skeleton'

export default function Loading() {
  return (
    <div className="container-x py-10">
      <div className="skeleton mb-8 h-9 w-64 rounded-md" />
      <div className="skeleton mb-6 h-8 w-72 rounded-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}