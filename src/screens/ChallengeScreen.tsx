import { BurnoMark } from '../components/BurnoMark'
import { Button } from '../components/Button'
import { ChallengePlan } from '../components/ChallengePlan'
import { ThemeToggle } from '../components/ThemeToggle'
import { BRAND } from '../lib/brand'
import type { Challenge } from '../lib/challenge'
import { ACE_REPS } from '../lib/deck'
import { formatDuration } from '../lib/format'

interface Props {
  challenge: Challenge
  /** A started workout that accepting would replace. */
  replacesWorkout: boolean
  onAccept: () => void
  onDecline: () => void
}

/** Where a challenge link lands: who sent it, the workout, and the score to beat. */
export function ChallengeScreen({ challenge, replacesWorkout, onAccept, onDecline }: Props) {
  const { from, settings, deck, result } = challenge
  const sender = from ?? 'Your friend'
  const cleared = result != null && result.flipped === deck.length

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-8 pb-44 sm:pt-12">
      <header className="relative text-center">
        <ThemeToggle className="absolute -top-2 right-0" />
        <div className="flex items-center justify-center gap-2">
          <BurnoMark className="h-10 w-8 -rotate-6 drop-shadow" />
          <span className="font-display text-2xl font-black tracking-tight [font-stretch:125%]">{BRAND.name.toUpperCase()}</span>
        </div>
        <p className="mt-8 text-sm font-bold tracking-[0.3em] text-accent-strong uppercase">Challenge</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-balance">
          {from ? `${from} challenged you` : "You've been challenged"}
        </h1>
        <p className="mt-2 text-balance text-base-400">
          {result
            ? cleared
              ? `${sender} cleared this deck. Can you do it faster?`
              : `${sender} got ${result.flipped} cards in. Can you go further?`
            : `${sender} picked your moves. Flip the cards, do the reps.`}
        </p>
      </header>

      {result && (
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-accent/15 px-4 py-3 ring-1 ring-accent/40">
          <span className="text-sm font-bold">Score to beat</span>
          <span className="tabular text-2xl font-black">
            {!cleared && `${result.flipped} cards · `}
            {formatDuration(result.timeMs)}
          </span>
        </div>
      )}

      <section className="mt-4 rounded-2xl bg-base-900/60 p-4 ring-1 ring-base-800">
        <h2 className="mb-1 text-xs font-bold tracking-widest text-base-400 uppercase">The workout</h2>
        <ChallengePlan settings={settings} deck={deck} />
      </section>

      <section className="mt-4 rounded-2xl bg-base-900/60 p-4 ring-1 ring-base-800">
        <h2 className="mb-2 text-xs font-bold tracking-widest text-base-400 uppercase">How it works</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-base-300 marker:text-suit-red">
          <li>
            Flip a card, do that many reps of its suit's move. Jack, Queen and King are{' '}
            {settings.capFaceCards ? '10 each' : '11, 12 and 13'}.
          </li>
          <li>Any ace is {ACE_REPS} reps of the ace move.</li>
          {settings.jokers && <li>A joker is your pick: a 1-minute rest, or 30 seconds all out.</li>}
          <li>
            {result
              ? `You get the same cards in the same order ${from ?? 'they'} had.`
              : 'Everyone who gets this link flips the same cards in the same order.'}{' '}
            The clock starts on your first flip.
          </li>
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-base-950 via-base-950/95 to-transparent px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-xl flex-col gap-1">
          {replacesWorkout && (
            <p className="text-center text-sm text-base-400">This replaces the workout you have in progress.</p>
          )}
          <Button variant="primary" size="lg" className="w-full" onClick={onAccept}>
            Accept challenge
          </Button>
          <Button variant="ghost" onClick={onDecline}>
            Not now, take me to {BRAND.name}
          </Button>
        </div>
      </div>
    </div>
  )
}
