import type { MoveTotal } from '../lib/deck'

export function MoveTotals({ totals }: { totals: MoveTotal[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {totals.map((t) => {
        const pct = t.total ? Math.round((t.done / t.total) * 100) : 0
        return (
          <li key={t.move}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium">{t.move}</span>
              <span className="tabular shrink-0 text-stone-400">
                <b className="text-stone-100">{t.done}</b> / {t.total}
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-stone-800"
              role="progressbar"
              aria-label={`${t.move} progress`}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
