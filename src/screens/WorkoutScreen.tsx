import { useEffect, useRef } from 'react'
import { Button } from '../components/Button'
import { DrawnPile } from '../components/DrawnPile'
import { JokerTimer } from '../components/JokerTimer'
import { MoveTotals } from '../components/MoveTotals'
import { CardBack, PlayingCard } from '../components/PlayingCard'
import { TimerBar } from '../components/TimerBar'
import { isFaceCard, moveTotals, taskFor } from '../lib/deck'
import { exerciseNote } from '../lib/exercises'
import { elapsedMs, type Session } from '../hooks/useSession'
import { useNow } from '../hooks/useNow'
import { useWakeLock } from '../hooks/useWakeLock'

interface Props {
  session: Session
  onFlip: () => void
  onUndo: () => void
  onPause: () => void
  onResume: () => void
  onFinish: () => void
}

export function WorkoutScreen({ session, onFlip, onUndo, onPause, onResume, onFinish }: Props) {
  const { deck, flipped, settings, clock } = session
  const running = clock.runningSince != null
  const now = useNow(running)
  const elapsed = elapsedMs(clock, now)
  const current = flipped > 0 ? deck[flipped - 1] : null
  const task = current ? taskFor(current, settings) : null
  const remaining = deck.length - flipped
  const totals = moveTotals(deck, flipped, settings)
  const repsDone = totals.reduce((sum, t) => sum + t.done, 0)
  const done = remaining === 0
  useWakeLock(running)

  // Buzz once when a countdown runs out.
  const overtime = settings.timerMode === 'down' && elapsed >= settings.timerMinutes * 60_000
  const buzzed = useRef(overtime)
  useEffect(() => {
    if (overtime && !buzzed.current) navigator.vibrate?.([200, 100, 200])
    buzzed.current = overtime
  }, [overtime])

  const flip = () => {
    if (!running) onResume()
    onFlip()
  }

  const confirmFinish = () => {
    if (done || window.confirm(`End the workout with ${remaining} cards left?`)) onFinish()
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
      <header className="sticky top-0 z-10 border-b border-base-800 bg-base-950/90 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <TimerBar elapsed={elapsed} started={flipped > 0} running={running} settings={settings} onToggle={running ? onPause : onResume} />
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-base-800"
            role="progressbar"
            aria-label="Deck progress"
            aria-valuenow={flipped}
            aria-valuemin={0}
            aria-valuemax={deck.length}
          >
            <div
              className="h-full rounded-full bg-pop transition-[width] duration-300"
              style={{ width: `${(flipped / deck.length) * 100}%` }}
            />
          </div>
          <span className="tabular shrink-0 text-sm font-semibold text-base-300">
            {flipped} / {deck.length}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-40 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-10 lg:pt-10">
        <section aria-live="polite" className="flex flex-col items-center text-center">
          <button
            type="button"
            onClick={done ? undefined : flip}
            disabled={done}
            aria-label={done ? 'Deck finished' : 'Flip next card'}
            className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {current ? <PlayingCard key={current.id} card={current} /> : <CardBack remaining={remaining} />}
          </button>

          <div className="mt-6 min-h-28">
            {!task && (
              <>
                <p className="text-2xl font-bold">Ready when you are</p>
                <p className="mt-1 text-base-400">Tap the deck or hit flip to draw your first card.</p>
              </>
            )}
            {task?.kind === 'move' && (
              <>
                <p className="text-5xl font-black sm:text-6xl">
                  <span className="tabular">{task.reps}</span> <span className="break-words">{task.move}</span>
                </p>
                <p className="mt-2 text-base-400">
                  {[task.isAce && 'Ace wildcard', exerciseNote(task.move), current && isFaceCard(current) && 'Face card: breather after this']
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </>
            )}
            {task?.kind === 'joker' && current && (
              <JokerTimer key={current.id} move={task.move} running={running} onResume={onResume} />
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className="rounded-2xl bg-base-900/60 p-4 ring-1 ring-base-800">
            <h2 className="mb-3 text-xs font-bold tracking-widest text-base-400 uppercase">
              Reps done · <span className="tabular">{repsDone}</span>
            </h2>
            <MoveTotals totals={totals} showTotals={settings.showRepTotals ?? false} />
          </section>
          <section className="rounded-2xl bg-base-900/60 p-4 ring-1 ring-base-800">
            <h2 className="mb-3 text-xs font-bold tracking-widest text-base-400 uppercase">
              Flipped · {remaining} left
            </h2>
            <DrawnPile cards={deck.slice(0, flipped)} />
          </section>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-base-800 bg-base-950/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-2">
          <Button variant="ghost" size="lg" onClick={onUndo} disabled={flipped === 0} aria-label="Undo last flip">
            Undo
          </Button>
          {done ? (
            <Button variant="primary" size="lg" className="flex-1" onClick={onFinish}>
              Finish workout
            </Button>
          ) : (
            <Button variant="primary" size="lg" className="flex-1" onClick={flip}>
              {flipped === 0 ? 'Flip first card' : 'Next card'}
            </Button>
          )}
          {!done && (
            <Button variant="ghost" size="lg" onClick={confirmFinish}>
              End
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
