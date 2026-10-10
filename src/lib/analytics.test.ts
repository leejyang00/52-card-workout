import { describe, expect, it } from 'vitest'
import type { Session } from '../hooks/useSession'
import { finishProperties, startProperties } from './analytics'
import { DEFAULT_SETTINGS } from './settings'

const session: Session = {
  settings: DEFAULT_SETTINGS,
  deck: [
    { id: '10-hearts', kind: 'standard', suit: 'hearts', rank: '10' },
    { id: '5-clubs', kind: 'standard', suit: 'clubs', rank: '5' },
    { id: 'joker-1', kind: 'joker', move: 'Burpees' },
  ],
  flipped: 2,
  splits: [0, 20_000],
  clock: { accumulatedMs: 30_000, runningSince: 100_000 },
  finishedAt: null,
}

describe('finishProperties', () => {
  it('sends only counts and time, including the clock still running', () => {
    expect(finishProperties(session, 115_000)).toEqual({
      cards: 2,
      deck_length: 3,
      cleared: false,
      reps: 15,
      duration_s: 45,
      deck_size: DEFAULT_SETTINGS.deckSize,
    })
  })

  it('marks a cleared deck', () => {
    expect(finishProperties({ ...session, flipped: 3 }, 100_000).cleared).toBe(true)
  })
})

describe('startProperties', () => {
  it('describes the workout setup, not the custom move names', () => {
    const props = startProperties(DEFAULT_SETTINGS, true)
    expect(props.restart).toBe(true)
    expect(JSON.stringify(props)).not.toContain(DEFAULT_SETTINGS.aceMove)
  })
})
