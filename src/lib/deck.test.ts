import { describe, expect, it } from 'vitest'
import { buildDeck, moveTotals, rankReps, shuffle, taskFor } from './deck'
import { DEFAULT_SETTINGS } from './settings'

describe('buildDeck', () => {
  it('builds 52 unique cards', () => {
    const deck = buildDeck({ deckSize: 'full', jokers: false })
    expect(deck).toHaveLength(52)
    expect(new Set(deck.map((c) => c.id)).size).toBe(52)
  })

  it('adds two jokers to a full deck and one to a half deck', () => {
    expect(buildDeck({ deckSize: 'full', jokers: true }).filter((c) => c.kind === 'joker')).toHaveLength(2)
    const half = buildDeck({ deckSize: 'half', jokers: true })
    expect(half).toHaveLength(27)
    expect(half.filter((c) => c.kind === 'joker')).toHaveLength(1)
  })
})

describe('shuffle', () => {
  it('keeps every item and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
    expect([...out].sort()).toEqual(input)
  })
})

describe('reps', () => {
  it('maps ranks to reps, with optional face-card cap', () => {
    expect(rankReps('7', false)).toBe(7)
    expect(rankReps('K', false)).toBe(13)
    expect(rankReps('K', true)).toBe(10)
    expect(rankReps('A', true)).toBe(20)
  })

  it('sends aces to the wildcard move and jokers to rest', () => {
    expect(taskFor({ id: 'A-hearts', kind: 'standard', suit: 'hearts', rank: 'A' }, DEFAULT_SETTINGS)).toEqual({
      kind: 'move',
      move: 'Lunges',
      reps: 20,
      isAce: true,
    })
    expect(taskFor({ id: 'joker-1', kind: 'joker' }, DEFAULT_SETTINGS).kind).toBe('rest')
  })

  it('totals a full deck at 90 reps per suit and 80 for aces', () => {
    const deck = buildDeck({ deckSize: 'full', jokers: true })
    const totals = moveTotals(deck, 10, DEFAULT_SETTINGS)
    const byMove = Object.fromEntries(totals.map((t) => [t.move, t.total]))
    expect(totals.map((t) => t.move)).toEqual(['Push-ups', 'Clean & Press', 'Burpees', 'Sit-ups', 'Lunges'])
    expect(byMove).toEqual({ 'Push-ups': 90, 'Clean & Press': 90, Burpees: 90, 'Sit-ups': 90, Lunges: 80 })
  })
})
