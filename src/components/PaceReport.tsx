import { useState } from 'react'
import { cardLabel, SUIT_LABEL, SUIT_SYMBOL } from '../lib/deck'
import { formatPerRep, formatSplit } from '../lib/format'
import { paceByMove, paceBySuit, paceSummary, type CardTime, type PaceGroup } from '../lib/pace'
import type { Settings } from '../lib/types'
import { Segmented } from './Segmented'

const label = 'text-xs font-bold tracking-widest text-base-400 uppercase'

/** Pace after a workout: headline numbers, start vs. end, time per card and a per-move or per-suit breakdown. */
export function PaceReport({ times, settings }: { times: CardTime[]; settings: Settings }) {
  const summary = paceSummary(times)
  const [groupBy, setGroupBy] = useState<'move' | 'suit'>('move')
  if (!summary) return null

  const groups: (PaceGroup & { name: string; symbol?: string })[] =
    groupBy === 'move'
      ? paceByMove(times, settings).map((g) => ({ ...g, name: g.key }))
      : paceBySuit(times).map((g) => ({ ...g, name: SUIT_LABEL[g.key], symbol: SUIT_SYMBOL[g.key] }))

  return (
    <section className="mt-4 rounded-2xl bg-base-900/60 p-4 ring-1 ring-base-800">
      <h2 className={label}>Pace</h2>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        {[
          ['Per card', formatSplit(summary.perCardMs)],
          ['Per rep', formatPerRep(summary.perRepMs)],
        ].map(([name, value]) => (
          <div key={name} className="rounded-xl bg-base-950/60 px-3 py-2 ring-1 ring-base-800">
            <dt className="text-xs font-semibold text-base-400">{name}</dt>
            <dd className="tabular text-2xl font-black">{value}</dd>
          </div>
        ))}
      </dl>

      {summary.halves && <Halves {...summary.halves} />}

      <CardChart times={times} avgMs={summary.perCardMs} />

      <p className="mt-2 text-xs text-base-400">
        Quickest <b className="text-base-100">{cardLabel(summary.fastest.card)}</b> in{' '}
        <span className="tabular">{formatSplit(summary.fastest.ms)}</span> · Longest{' '}
        <b className="text-base-100">{cardLabel(summary.slowest.card)}</b> in{' '}
        <span className="tabular">{formatSplit(summary.slowest.ms)}</span>
      </p>

      <div className="mt-5 mb-3">
        <Segmented
          label="Group pace by"
          options={[
            { value: 'move', label: 'By exercise' },
            { value: 'suit', label: 'By suit' },
          ]}
          value={groupBy}
          onChange={setGroupBy}
        />
      </div>
      <GroupBars groups={groups} />
      {times.some((t) => t.card.kind === 'joker') && (
        <p className="mt-3 text-xs text-base-400">Jokers run on their own timer, so they're left out of pace.</p>
      )}
    </section>
  )
}

/** First half vs. second half, per rep. */
function Halves({ firstMs, secondMs }: { firstMs: number; secondMs: number }) {
  const change = firstMs ? Math.round(((secondMs - firstMs) / firstMs) * 100) : 0
  const verdict =
    Math.abs(change) < 5 ? 'Steady all the way' : change > 0 ? `${change}% slower by the end` : `${-change}% faster by the end`
  return (
    <div className="mt-3 rounded-xl bg-base-950/60 px-3 py-2 ring-1 ring-base-800">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-base-400">First half</p>
          <p className="tabular text-lg font-black">
            {formatPerRep(firstMs)}
            <span className="text-xs font-semibold text-base-400"> /rep</span>
          </p>
        </div>
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0 text-base-400" aria-hidden>
          <path d="M3 10a.75.75 0 0 1 .75-.75h10.64l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z" />
        </svg>
        <div className="text-right">
          <p className="text-xs font-semibold text-base-400">Second half</p>
          <p className="tabular text-lg font-black">
            {formatPerRep(secondMs)}
            <span className="text-xs font-semibold text-base-400"> /rep</span>
          </p>
        </div>
      </div>
      <p className="mt-1 text-center text-sm font-semibold text-base-300">{verdict}</p>
    </div>
  )
}

/** One bar per card in the order drawn, with the average as a reference line. Tap a bar for its details. */
function CardChart({ times, avgMs }: { times: CardTime[]; avgMs: number }) {
  const [picked, setPicked] = useState<number | null>(null)
  const max = Math.max(...times.map((t) => t.ms), 1)
  const pick = picked != null ? times[picked] : null

  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={label}>Time per card</h3>
        <p className="tabular min-h-5 truncate text-xs text-base-300" aria-live="polite">
          {pick ? (
            <>
              <b className="text-base-100">#{picked! + 1} {cardLabel(pick.card)}</b>
              {pick.move ? ` · ${pick.reps} ${pick.move}` : ' · Joker'} · {formatSplit(pick.ms)}
            </>
          ) : (
            <span className="text-base-400">Tap a bar</span>
          )}
        </p>
      </div>
      <div className="relative mt-2 flex h-32 items-end gap-[2px] border-b border-base-700" role="group" aria-label="Time per card">
        {times.map((t, i) => (
          <button
            key={t.card.id}
            type="button"
            onClick={() => setPicked(picked === i ? null : i)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setPicked(i)}
            aria-label={`Card ${i + 1}, ${cardLabel(t.card)}: ${formatSplit(t.ms)}`}
            aria-pressed={picked === i}
            className="group flex h-full min-w-0 flex-1 items-end focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span
              className={`w-full rounded-t-[3px] ${
                t.card.kind === 'joker' ? 'bg-base-700' : picked === i ? 'bg-accent-strong' : 'bg-accent group-hover:bg-accent-strong'
              } ${picked != null && picked !== i ? 'opacity-50' : ''}`}
              style={{ height: `${Math.max((t.ms / max) * 100, 2)}%` }}
            />
          </button>
        ))}
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-base-100/70"
          style={{ bottom: `${(avgMs / max) * 100}%` }}
          aria-hidden
        >
          <span className="tabular absolute right-0 bottom-0.5 rounded bg-base-900/90 px-1 text-[10px] font-bold text-base-100">
            avg {formatSplit(avgMs)}
          </span>
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold text-base-400">
        <span>Card 1</span>
        <span>Card {times.length}</span>
      </div>
      {times.some((t) => t.card.kind === 'joker') && (
        <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-base-400">
          <span className="inline-block size-2 rounded-sm bg-base-700" aria-hidden /> Joker
        </p>
      )}
    </div>
  )
}

/** Per-rep pace per group, bars scaled to the slowest. */
function GroupBars({ groups }: { groups: (PaceGroup & { name: string; symbol?: string })[] }) {
  const max = Math.max(...groups.map((g) => g.perRepMs), 1)
  return (
    <ul className="flex flex-col gap-3">
      {groups.map((g) => (
        <li key={g.key}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate font-medium">
              {g.symbol && <span aria-hidden>{g.symbol} </span>}
              {g.name}
            </span>
            <span className="tabular shrink-0 text-base-400">
              <b className="text-base-100">{formatPerRep(g.perRepMs)}</b> /rep
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-base-800" aria-hidden>
            <div className="h-full rounded-full bg-accent" style={{ width: `${(g.perRepMs / max) * 100}%` }} />
          </div>
          <p className="tabular mt-1 text-xs text-base-400">
            {formatSplit(g.perCardMs)} per card · {g.cards} {g.cards === 1 ? 'card' : 'cards'}
          </p>
        </li>
      ))}
    </ul>
  )
}
