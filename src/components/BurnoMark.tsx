import { useId } from 'react'
import { FLAME_INNER, FLAME_OUTER, MARK_HEIGHT, MARK_WIDTH } from '../lib/logo'

/** The Burno card: a playing card whose suit pip is a flame. Colours come from the active palette. */
export function BurnoMark({ className = '' }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`} className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--color-flame-2)" />
          <stop offset="1" stopColor="var(--color-flame)" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="74" height="94" rx="12" fill="#fff" />
      <g className="origin-[40px_80px] motion-safe:animate-flicker">
        <path d={FLAME_OUTER} fill={`url(#${id}-flame)`} />
        <path d={FLAME_INNER} fill="var(--color-flame)" opacity="0.55" />
      </g>
    </svg>
  )
}
