import { useState } from 'react'
import { Button } from '../components/Button'
import { CommunityFinished } from '../components/CommunityCount'
import { ExternalLink } from '../components/ExternalLink'
import { FeedbackSheet, Stars } from '../components/FeedbackSheet'
import { MoveTotals } from '../components/MoveTotals'
import { PaceReport } from '../components/PaceReport'
import { ShareSheet } from '../components/ShareSheet'
import { BRAND } from '../lib/brand'
import { moveTotals } from '../lib/deck'
import { feedbackEnabled } from '../lib/feedback'
import { formatDuration } from '../lib/format'
import { cardTimes } from '../lib/pace'
import type { Session } from '../hooks/useSession'

interface Props {
  session: Session
  onRestart: () => void
  onDone: () => void
}

export function SummaryScreen({ session, onRestart, onDone }: Props) {
  const { deck, flipped, splits, settings, clock, finishedAt } = session
  const [shareOpen, setShareOpen] = useState(false)
  const totals = moveTotals(deck, flipped, settings)
  const reps = totals.reduce((sum, t) => sum + t.done, 0)
  const cleared = flipped === deck.length
  const times = cardTimes(deck, flipped, splits, clock.accumulatedMs, settings)
  const countdownMs = settings.timerMinutes * 60_000
  const beatClock = settings.timerMode === 'down' && cleared && clock.accumulatedMs <= countdownMs

  // Asked after every workout, finished or not; closing the card only hides it for this summary.
  const [cardState, setCardState] = useState<'ask' | 'dismissed' | 'thanked'>('ask')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const openFeedback = (rating: number) => {
    setFeedbackRating(rating)
    setFeedbackOpen(true)
  }
  const dismissCard = () => setCardState('dismissed')
  const onFeedbackSent = () => setCardState('thanked')

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
        <CommunityFinished finishedAt={finishedAt} cards={flipped} reps={reps} />
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

      {times && <PaceReport times={times} settings={settings} />}

      {feedbackEnabled && cardState !== 'dismissed' && (
        <section className="relative mt-4 flex flex-col items-center rounded-2xl bg-base-900/60 p-4 text-center ring-1 ring-base-800">
          {cardState === 'thanked' ? (
            <p className="py-2 text-sm font-semibold text-base-300">Thanks for the feedback! 🙏</p>
          ) : (
            <>
              <button
                type="button"
                onClick={dismissCard}
                aria-label="No thanks"
                className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-base-400 hover:bg-base-800 hover:text-base-100 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
              <h2 className="text-sm font-bold">How was that burn?</h2>
              <p className="mb-2 text-xs text-base-400">Tap a star. Takes ten seconds.</p>
              <Stars value={feedbackRating} onChange={openFeedback} size="md" />
            </>
          )}
        </section>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button variant="primary" size="lg" onClick={() => setShareOpen(true)}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path d="M13 4.5a2.5 2.5 0 1 1 .7 1.74l-6.8 3.4a2.5 2.5 0 0 1 0 .72l6.8 3.4a2.5 2.5 0 1 1-.67 1.34l-6.8-3.4a2.5 2.5 0 1 1 0-3.4l6.8-3.4A2.5 2.5 0 0 1 13 4.5Z" />
          </svg>
          Share workout
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button className="whitespace-nowrap" onClick={onRestart} aria-label="Same moves, new shuffle">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden>
              <path d="M15.31 3.72a.75.75 0 0 1 1.06 0l2 2a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l.72-.72H14.5a2.75 2.75 0 0 0-2.2 1.1l-4.1 5.47A4.25 4.25 0 0 1 4.8 15.25H2.75a.75.75 0 0 1 0-1.5H4.8a2.75 2.75 0 0 0 2.2-1.1l4.1-5.47a4.25 4.25 0 0 1 3.4-1.7h1.53l-.72-.72a.75.75 0 0 1 0-1.04ZM2 5.5a.75.75 0 0 1 .75-.75H4.8c1.24 0 2.4.54 3.2 1.46a.75.75 0 1 1-1.13.98A2.75 2.75 0 0 0 4.8 6.25H2.75A.75.75 0 0 1 2 5.5Zm10.13 7.33a.75.75 0 0 1 1.06.07 2.75 2.75 0 0 0 1.31.85h1.53l-.72-.72a.75.75 0 1 1 1.06-1.06l2 2a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l.72-.72H14.5a4.25 4.25 0 0 1-2.44-.77.75.75 0 0 1 .07-1.65Z" />
            </svg>
            New shuffle
          </Button>
          <Button className="whitespace-nowrap" onClick={onDone}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden>
              <path d="M9.29 2.29a1 1 0 0 1 1.42 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.7-1.71l7-7Z" />
            </svg>
            Home
          </Button>
        </div>
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

      {feedbackEnabled && (
        <FeedbackSheet
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          source="summary"
          initialRating={feedbackRating}
          workout={{ cleared, flipped, deckLength: deck.length, reps, timeMs: clock.accumulatedMs }}
          onSent={onFeedbackSent}
        />
      )}
    </div>
  )
}
