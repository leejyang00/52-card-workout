import { describe, expect, it } from 'vitest'
import { challengeMessage, compareResults, decodeChallenge, encodeChallenge, type Challenge } from './challenge'
import { buildDeck } from './deck'
import { DEFAULT_SETTINGS } from './settings'

function challenge(overrides: Partial<Challenge> = {}): Challenge {
  const deck = buildDeck({ deckSize: 'full', jokers: true }).map((c) =>
    c.kind === 'joker' ? { ...c, move: c.id === 'joker-1' ? 'Burpees' : 'Thrusters' } : c,
  )
  return { id: 'abc123', from: 'Sam', settings: DEFAULT_SETTINGS, deck, result: { flipped: 54, timeMs: 1_450_000 }, ...overrides }
}

/** A payload object, encoded the way links carry it. */
function raw(data: unknown): string {
  return btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** An encoded challenge's raw fields, to tamper with. */
function fields(c: Challenge) {
  return JSON.parse(atob(encodeChallenge(c).replace(/-/g, '+').replace(/_/g, '/')))
}

describe('encodeChallenge / decodeChallenge', () => {
  it('round-trips the deck in order, joker moves, rules, name and result', () => {
    const c = challenge()
    const back = decodeChallenge(encodeChallenge(c))!
    expect(back.deck).toEqual(c.deck)
    expect(back.from).toBe('Sam')
    expect(back.id).toBe('abc123')
    expect(back.result).toEqual({ flipped: 54, timeMs: 1_450_000 })
    expect(back.settings).toEqual({
      moves: DEFAULT_SETTINGS.moves,
      aceMove: DEFAULT_SETTINGS.aceMove,
      deckSize: 'full',
      jokers: true,
      capFaceCards: false,
      timerMode: 'up',
      timerMinutes: 45,
    })
  })

  it('keeps a half deck, a countdown, capped face cards and custom move names', () => {
    const c = challenge({
      from: undefined,
      result: undefined,
      deck: buildDeck({ deckSize: 'half', jokers: false }),
      settings: {
        ...DEFAULT_SETTINGS,
        moves: { ...DEFAULT_SETTINGS.moves, hearts: 'Bear crawl 🐻 (10 m)' },
        capFaceCards: true,
        timerMode: 'down',
        timerMinutes: 30,
      },
    })
    const back = decodeChallenge(encodeChallenge(c))!
    expect(back.deck).toEqual(c.deck)
    expect(back.from).toBeUndefined()
    expect(back.result).toBeUndefined()
    expect(back.settings.moves.hearts).toBe('Bear crawl 🐻 (10 m)')
    expect(back.settings).toMatchObject({ deckSize: 'half', jokers: false, capFaceCards: true, timerMode: 'down', timerMinutes: 30 })
  })

  it('stores the time to the second', () => {
    const back = decodeChallenge(encodeChallenge(challenge({ result: { flipped: 10, timeMs: 61_999 } })))!
    expect(back.result).toEqual({ flipped: 10, timeMs: 61_000 })
  })

  it('is URL-safe and short enough to paste in a chat', () => {
    const payload = encodeChallenge(challenge())
    expect(payload).toMatch(/^[\w-]+$/)
    expect(payload.length).toBeLessThan(400)
  })

  it('rejects garbage', () => {
    expect(decodeChallenge('')).toBeNull()
    expect(decodeChallenge('not a challenge!')).toBeNull()
    expect(decodeChallenge(raw({ v: 2 }))).toBeNull()
  })

  it('rejects a deck that buildDeck could never deal', () => {
    const good = fields(challenge({ deck: buildDeck({ deckSize: 'full', jokers: false }) }))
    expect(decodeChallenge(raw(good))).not.toBeNull()
    expect(decodeChallenge(raw({ ...good, k: good.k.slice(1) }))).toBeNull()
    expect(decodeChallenge(raw({ ...good, k: good.k[0] + good.k.slice(0, -1) }))).toBeNull()
    expect(decodeChallenge(raw({ ...good, k: good.k + '0' }))).toBeNull()
    // A joker without its move.
    expect(decodeChallenge(raw({ ...good, k: good.k + '01' }))).toBeNull()
  })

  it('rejects empty or overlong move names', () => {
    const good = fields(challenge({ deck: buildDeck({ deckSize: 'half', jokers: false }) }))
    expect(decodeChallenge(raw({ ...good, m: ['', 'b', 'c', 'd', 'e'] }))).toBeNull()
    expect(decodeChallenge(raw({ ...good, m: ['x'.repeat(41), 'b', 'c', 'd', 'e'] }))).toBeNull()
    expect(decodeChallenge(raw({ ...good, m: ['a', 'b', 'c', 'd'] }))).toBeNull()
  })

  it('drops a bad name or result but keeps the workout', () => {
    const good = fields(challenge({ deck: buildDeck({ deckSize: 'half', jokers: false }) }))
    const back = decodeChallenge(raw({ ...good, n: 'x'.repeat(99), r: [999, 10] }))!
    expect(back.from).toBeUndefined()
    expect(back.result).toBeUndefined()
  })
})

describe('compareResults', () => {
  it('more cards wins, whatever the time', () => {
    expect(compareResults({ flipped: 52, timeMs: 2_000_000 }, { flipped: 40, timeMs: 900_000 })).toEqual({
      kind: 'won',
      cards: 12,
      ms: 1_100_000,
    })
  })

  it('same cards: the faster time wins, in whole seconds', () => {
    expect(compareResults({ flipped: 52, timeMs: 1_500_400 }, { flipped: 52, timeMs: 1_450_900 })).toMatchObject({
      kind: 'lost',
      cards: 0,
      ms: 50_000,
    })
    expect(compareResults({ flipped: 52, timeMs: 1_450_100 }, { flipped: 52, timeMs: 1_450_900 })).toEqual({ kind: 'tied' })
  })
})

describe('challengeMessage', () => {
  const deck = challenge().deck

  it('invites without a score when sent from setup', () => {
    expect(challengeMessage({ deck })).toBe('I challenge you to a Burno workout: 54 cards, I picked the moves. You in? 💪')
  })

  it('sets the time to beat', () => {
    expect(challengeMessage({ deck, result: { flipped: 54, timeMs: 1_450_000 } })).toBe(
      'I cleared this Burno deck in 24:10. Think you can beat me? 💪',
    )
    expect(challengeMessage({ deck, result: { flipped: 30, timeMs: 1_200_000 } }, 'Sam')).toBe(
      'Rematch, Sam! I got through 30 of 54 cards in 20:00 on Burno. Think you can beat me? 💪',
    )
  })
})
