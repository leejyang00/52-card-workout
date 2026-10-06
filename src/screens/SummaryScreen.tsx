import { useState } from 'react'
import { Button } from '../components/Button'
import { ExternalLink } from '../components/ExternalLink'
import { MoveTotals } from '../components/MoveTotals'
import { ShareSheet } from '../components/ShareSheet'
import { BRAND } from '../lib/brand'
import { moveTotals } from '../lib/deck'
import { formatDuration } from '../lib/format'
import type { Session } from '../hooks/useSession'

interface Props {
  session: Session
  onRestart: () => void
  onDone: () => void
}

export function SummaryScreen({ session, onRestart, onDone }: Props) {
  const { deck, flipped, settings, clock, finishedAt } = session
  const [shareOpen, setShareOpen] = useState(false)
  const totals = moveTotals(deck, flipped, settings)
  const reps = totals.reduce((sum, t) => sum + t.done, 0)
  const cleared = flipped === deck.length
  const countdownMs = settings.timerMinutes * 60_000
  const beatClock = settings.timerMode === 'down' && cleared && clock.accumulatedMs <= countdownMs

  const stats = [
    ['Time', formatDuration(clock.accumulatedMs)],
    ['Cards', `${flipped}/${deck.length}`],
    ['Reps', String(reps)],
  ]

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="text-center">
        <p className="text-5xl" aria-hidden>
          {cleared ? '🏆' : '💪'}
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{cleared ? 'Deck cleared!' : 'Workout ended'}</h1>
        <p className="mt-2 text-base-400">
          {beatClock
            ? `Under ${settings.timerMinutes} minutes. Nice.`
            : cleared
              ? 'Every card, no skipping.'
              : 'Good work. Finish the deck next time.'}
        </p>
      </header>

      <dl className="mt-8 grid grid-cols-3 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-base-900/60 p-4 text-center ring-1 ring-base-800">
            <dt className="text-xs font-bold tracking-widest text-base-400 uppercase">{label}</dt>
            <dd className="tabular mt-1 text-2xl font-black">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-4 rounded-2xl bg-base-900/60 p-4 ring-1 ring-base-800">
        <h2 className="mb-3 text-xs font-bold tracking-widest text-base-400 uppercase">Breakdown</h2>
        <MoveTotals totals={totals} />
      </section>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button variant="primary" size="lg" onClick={() => setShareOpen(true)}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path d="M13 4.5a2.5 2.5 0 1 1 .7 1.74l-6.8 3.4a2.5 2.5 0 0 1 0 .72l6.8 3.4a2.5 2.5 0 1 1-.67 1.34l-6.8-3.4a2.5 2.5 0 1 1 0-3.4l6.8-3.4A2.5 2.5 0 0 1 13 4.5Z" />
          </svg>
          Share workout
        </Button>
        <Button size="lg" onClick={onRestart}>
          Same moves, new shuffle
        </Button>
        <Button variant="ghost" size="lg" onClick={onDone}>
          Change setup
        </Button>
        <p className="mt-2 text-center text-sm text-base-400">
          Enjoying {BRAND.name}? <ExternalLink href={BRAND.tipUrl}>Buy me a coffee ☕</ExternalLink>
        </p>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        stats={{
          cleared,
          timeMs: clock.accumulatedMs,
          flipped,
          deckLength: deck.length,
          reps,
          totals,
          date: new Date(finishedAt ?? Date.now()),
        }}
      />
    </div>
  )
}
