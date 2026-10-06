import { Button } from '../components/Button'
import { MoveTotals } from '../components/MoveTotals'
import { moveTotals } from '../lib/deck'
import { formatDuration } from '../lib/format'
import type { Session } from '../hooks/useSession'

interface Props {
  session: Session
  onRestart: () => void
  onDone: () => void
}

export function SummaryScreen({ session, onRestart, onDone }: Props) {
  const { deck, flipped, settings, clock } = session
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
        <p className="mt-2 text-stone-400">
          {beatClock
            ? `Under ${settings.timerMinutes} minutes. Nice.`
            : cleared
              ? 'Every card, no skipping.'
              : 'Good work. Finish the deck next time.'}
        </p>
      </header>

      <dl className="mt-8 grid grid-cols-3 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-stone-900/60 p-4 text-center ring-1 ring-stone-800">
            <dt className="text-xs font-bold tracking-widest text-stone-400 uppercase">{label}</dt>
            <dd className="tabular mt-1 text-2xl font-black">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-4 rounded-2xl bg-stone-900/60 p-4 ring-1 ring-stone-800">
        <h2 className="mb-3 text-xs font-bold tracking-widest text-stone-400 uppercase">Breakdown</h2>
        <MoveTotals totals={totals} />
      </section>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button variant="primary" size="lg" onClick={onRestart}>
          Same moves, new shuffle
        </Button>
        <Button variant="ghost" size="lg" onClick={onDone}>
          Change setup
        </Button>
      </div>
    </div>
  )
}
