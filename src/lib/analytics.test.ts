import { describe, expect, it } from 'vitest'
import type { Session } from '../hooks/useSession'
import { challengeLinkProperties, finishProperties, startProperties } from './analytics'
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

describe('challenge analytics', () => {
  it('reports the outcome against the sender, by link id', () => {
    const challenged = { ...session, challenge: { id: 'abc', from: 'Sam', result: { flipped: 2, timeMs: 60_000 } } }
    expect(finishProperties(challenged, 115_000)).toMatchObject({ challenge_id: 'abc', challenge_outcome: 'won' })
    expect(finishProperties({ ...challenged, challenge: { id: 'abc' } }, 115_000).challenge_outcome).toBe('no_target')
  })

  it('never sends the name or moves from a link', () => {
    const props = challengeLinkProperties({ id: 'abc', from: 'Sam', settings: DEFAULT_SETTINGS, deck: session.deck })
    expect(props).toEqual({ challenge_id: 'abc', deck_size: 'full', jokers: false, has_target: false })
  })
})

describe('startProperties', () => {
  it('describes the workout setup, not the custom move names', () => {
    const props = startProperties(DEFAULT_SETTINGS, true)
    expect(props.restart).toBe(true)
    expect(JSON.stringify(props)).not.toContain(DEFAULT_SETTINGS.aceMove)
  })
})
