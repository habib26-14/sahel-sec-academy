import { LEVEL_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { CourseLevel } from '@/lib/types'

const LEVEL_COLORS: Record<CourseLevel, string> = {
  DECOUVERTE: 'bg-teal-50 text-teal-700',
  FONDAMENTAUX: 'bg-navy-50 text-navy',
  SPECIALISATION: 'bg-amber-50 text-amber-700',
}

export default function LevelBadge({
  level,
  className,
}: {
  level: CourseLevel
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        LEVEL_COLORS[level],
        className,
      )}
    >
      {LEVEL_LABELS[level]}
    </span>
  )
}