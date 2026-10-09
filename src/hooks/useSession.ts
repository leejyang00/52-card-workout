import { useCallback } from 'react'
import { buildDeck } from '../lib/deck'
import { pickJokerMove } from '../lib/exercises'
import type { Card, Settings } from '../lib/types'
import { useLocalStorage } from './useLocalStorage'

export interface Clock {
  /** Time banked from previous running stretches. */
  accumulatedMs: number
  /** Epoch ms when the clock last started, or null while paused. */
  runningSince: number | null
}

export interface Session {
  settings: Settings
  deck: Card[]
  /** Number of cards flipped so far; the current card is deck[flipped - 1]. */
  flipped: number
  /**
   * Workout-clock time (ms) when each flipped card was drawn: splits[i] is card i. Missing on
   * sessions saved before pace tracking.
   */
  splits?: number[]
  clock: Clock
  finishedAt: number | null
}

export function elapsedMs(clock: Clock, now: number): number {
  return clock.accumulatedMs + (clock.runningSince == null ? 0 : now - clock.runningSince)
}

function pauseClock(clock: Clock): Clock {
  if (clock.runningSince == null) return clock
  return { accumulatedMs: elapsedMs(clock, Date.now()), runningSince: null }
}

export function useSession() {
  const [session, setSession] = useLocalStorage<Session | null>('cw:session:v1', null)

  const update = useCallback(
    (fn: (s: Session) => Session) => setSession((s) => (s ? fn(s) : s)),
    [setSession],
  )

  return {
    session,
    start: useCallback(
      (settings: Settings) =>
        setSession({
          settings,
          deck: buildDeck(settings).map((c) => (c.kind === 'joker' ? { ...c, move: pickJokerMove(settings) } : c)),
          flipped: 0,
          splits: [],
          // The clock starts on the first flip, giving time to get set.
          clock: { accumulatedMs: 0, runningSince: null },
          finishedAt: null,
        }),
      [setSession],
    ),
    flip: useCallback(
      () =>
        update((s) =>
          s.flipped >= s.deck.length
            ? s
            : {
                ...s,
                flipped: s.flipped + 1,
                splits: s.splits && [...s.splits.slice(0, s.flipped), elapsedMs(s.clock, Date.now())],
              },
        ),
      [update],
    ),
    undo: useCallback(
      () =>
        update((s) => {
          const flipped = Math.max(s.flipped - 1, 0)
          return { ...s, flipped, splits: s.splits?.slice(0, flipped) }
        }),
      [update],
    ),
    pause: useCallback(() => update((s) => ({ ...s, clock: pauseClock(s.clock) })), [update]),
    resume: useCallback(
      () =>
        update((s) =>
          s.clock.runningSince == null ? { ...s, clock: { ...s.clock, runningSince: Date.now() } } : s,
        ),
      [update],
    ),
    finish: useCallback(
      () => update((s) => ({ ...s, clock: pauseClock(s.clock), finishedAt: Date.now() })),
      [update],
    ),
    reset: useCallback(() => setSession(null), [setSession]),
  }
}
