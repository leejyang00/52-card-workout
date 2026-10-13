import { SUIT_LABEL, type MoveTotal, type SuitSlot } from '../lib/deck'
import { SuitBadge } from './SuitBadge'

interface Props {
  totals: MoveTotal[]
  showTotals?: boolean
  /** Slot of the card in play; its row is highlighted. */
  active?: SuitSlot | null
}

/**
 * Reps per move, each with the suits that call it, so it doubles as a reminder of the plan.
 * With `showTotals` off, only reps done show: no deck total, no progress bar.
 */
export function MoveTotals({ totals, showTotals = true, active = null }: Props) {
  return (
    <ul className="-my-1.5 flex flex-col">
      {totals.map((t) => {
        const pct = t.total ? Math.round((t.done / t.total) * 100) : 0
        const isActive = active != null && t.slots.includes(active)
        return (
          <li
            key={t.move}
            aria-current={isActive || undefined}
            className={`-mx-2 rounded-lg px-2 py-1.5 transition-colors ${isActive ? 'bg-accent/10 ring-1 ring-accent/40' : ''}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                {t.slots.length > 0 && (
                  <span className="flex shrink-0 gap-0.5">
                    {t.slots.map((slot) => (
                      <SuitBadge key={slot} suit={slot} size="sm" label={slot === 'ace' ? 'Aces' : SUIT_LABEL[slot]} />
                    ))}
                  </span>
                )}
                <span className="truncate font-medium">{t.move}</span>
              </span>
              <span className="tabular shrink-0 text-base-400">
                <b className="text-base-100">{t.done}</b>
                {showTotals && ` / ${t.total}`}
              </span>
            </div>
            {showTotals && (
              <div
                className="h-1.5 overflow-hidden rounded-full bg-base-800"
                role="progressbar"
                aria-label={`${t.move} progress`}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
