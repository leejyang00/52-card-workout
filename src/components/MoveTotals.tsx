import type { MoveTotal } from '../lib/deck'

/** Reps per move. With `showTotals` off, only reps done show: no deck total, no progress bar. */
export function MoveTotals({ totals, showTotals = true }: { totals: MoveTotal[]; showTotals?: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {totals.map((t) => {
        const pct = t.total ? Math.round((t.done / t.total) * 100) : 0
        return (
          <li key={t.move}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium">{t.move}</span>
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
