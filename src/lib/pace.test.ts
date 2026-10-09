import { describe, expect, it } from 'vitest'
import { cardTimes, paceByMove, paceBySuit, paceSummary } from './pace'
import { DEFAULT_SETTINGS } from './settings'
import type { Card } from './types'

const deck: Card[] = [
  { id: '10-hearts', kind: 'standard', suit: 'hearts', rank: '10' },
  { id: '5-clubs', kind: 'standard', suit: 'clubs', rank: '5' },
  { id: 'joker-1', kind: 'joker', move: 'Burpees' },
  { id: 'A-hearts', kind: 'standard', suit: 'hearts', rank: 'A' },
  { id: '2-spades', kind: 'standard', suit: 'spades', rank: '2' },
]

describe('cardTimes', () => {
  it('times each card from its flip to the next, and the last to the end', () => {
    const times = cardTimes(deck, 4, [0, 20_000, 30_000, 90_000], 130_000, DEFAULT_SETTINGS)!
    expect(times.map((t) => t.ms)).toEqual([20_000, 10_000, 60_000, 40_000])
    expect(times.map((t) => t.reps)).toEqual([10, 5, 0, 20])
    expect(times[3].move).toBe('Lunges')
  })

  it('is null without splits, as on older saved sessions', () => {
    expect(cardTimes(deck, 2, undefined, 10_000, DEFAULT_SETTINGS)).toBeNull()
    expect(cardTimes(deck, 0, [], 0, DEFAULT_SETTINGS)).toBeNull()
  })
})

describe('pace', () => {
  const times = cardTimes(deck, 5, [0, 20_000, 30_000, 90_000, 130_000], 134_000, DEFAULT_SETTINGS)!

  it('leaves jokers out of the headline numbers', () => {
    const s = paceSummary(times)!
    expect(s.perCardMs).toBe((20_000 + 10_000 + 40_000 + 4_000) / 4)
    expect(s.perRepMs).toBe(74_000 / 37)
    expect(s.fastest.card.id).toBe('2-spades')
    expect(s.slowest.card.id).toBe('A-hearts')
    // First half: 30s over 15 reps. Second half: 44s over 22 reps.
    expect(s.halves).toEqual({ firstMs: 2_000, secondMs: 2_000 })
  })

  it('groups by exercise in setup order and by suit with aces in their suit', () => {
    expect(paceByMove(times, DEFAULT_SETTINGS).map((g) => [g.key, g.cards, g.perRepMs])).toEqual([
      ['Push-ups', 1, 2_000],
      ['Clean & Press', 1, 2_000],
      ['Burpees', 1, 2_000],
      ['Lunges', 1, 2_000],
    ])
    const hearts = paceBySuit(times).find((g) => g.key === 'hearts')!
    expect(hearts).toMatchObject({ cards: 2, perCardMs: 30_000, perRepMs: 2_000 })
  })
})
