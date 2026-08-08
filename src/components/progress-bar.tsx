import { cn } from '@/lib/utils'

export default function ProgressBar({
  percent,
  className,
  label,
}: {
  percent: number
  className?: string
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className={cn('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progression'}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-teal transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="sr-only">{clamped} %</span>
    </div>
  )
}