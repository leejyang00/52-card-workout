import { BRAND, siteUrl } from './brand'
import { RANKS, SUITS } from './deck'
import { formatDuration } from './format'
import type { Card, Settings } from './types'

/**
 * Challenges: a link that hands a friend your exact workout (moves, rules and the shuffled deck
 * itself, in order) and optionally your result to beat. Everything lives in the link, so there's
 * no server: burno.app/challenge?c=<payload>. The deck is sent card by card rather than as a
 * shuffle seed, so old links keep dealing the same cards even if the shuffle code changes.
 */

/** The rules a challenge fixes. Display preferences such as rep totals stay the friend's own. */
export type ChallengeSettings = Pick<
  Settings,
  'moves' | 'aceMove' | 'deckSize' | 'jokers' | 'capFaceCards' | 'timerMode' | 'timerMinutes'
>

export interface ChallengeResult {
  flipped: number
  /** Whole seconds, as shown on screen. */
  timeMs: number
}

export interface Challenge {
  /** Random, ties a link's opens and finishes together in analytics. */
  id: string
  /** Sender's name, if they gave one. */
  from?: string
  settings: ChallengeSettings
  deck: Card[]
  /** The sender's score, when sent from their summary. */
  result?: ChallengeResult
}

/** What a session started from a challenge remembers, for the summary's head-to-head. */
export type ChallengeRef = Pick<Challenge, 'id' | 'from' | 'result'>

export const MAX_NAME = 24
const MAX_MOVE = 40
const MAX_MINUTES = 180
const MAX_SECONDS = 24 * 3600

// One character per card: index = suit * 13 + rank, then the two jokers.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const JOKER_BASE = SUITS.length * RANKS.length

function cardChar(card: Card): string {
  if (card.kind === 'joker') return ALPHABET[JOKER_BASE + Number(card.id.split('-')[1]) - 1]
  return ALPHABET[SUITS.indexOf(card.suit) * RANKS.length + RANKS.indexOf(card.rank)]
}

function charCard(char: string): Card | null {
  const i = ALPHABET.indexOf(char)
  if (i < 0 || i >= JOKER_BASE + 2) return null
  if (i >= JOKER_BASE) return { id: `joker-${i - JOKER_BASE + 1}`, kind: 'joker' }
  const suit = SUITS[Math.floor(i / RANKS.length)]
  const rank = RANKS[i % RANKS.length]
  return { id: `${rank}-${suit}`, kind: 'standard', suit, rank }
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): string {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

/** Trimmed text up to `max` characters, or null if empty or not text. */
function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.replace(/\s+/g, ' ').trim()
  return text && text.length <= max ? text : null
}

export function newChallengeId(): string {
  let id = ''
  for (let i = 0; i < 8; i++) id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return id
}

export function encodeChallenge({ id, from, settings, deck, result }: Challenge): string {
  const { moves, aceMove, capFaceCards, timerMode, timerMinutes } = settings
  return toBase64Url(
    JSON.stringify({
      v: 1,
      i: id,
      n: from || undefined,
      m: [moves.hearts, moves.spades, moves.clubs, moves.diamonds, aceMove],
      k: deck.map(cardChar).join(''),
      j: deck.flatMap((c) => (c.kind === 'joker' ? [c.move ?? 'Burpees'] : [])),
      f: capFaceCards ? 1 : 0,
      t: timerMode === 'down' ? timerMinutes : 0,
      r: result ? [result.flipped, Math.floor(result.timeMs / 1000)] : undefined,
    }),
  )
}

/** The challenge in a link's payload, or null if it's damaged or doesn't make a real deck. */
export function decodeChallenge(payload: string): Challenge | null {
  let data: Record<string, unknown>
  try {
    data = JSON.parse(fromBase64Url(payload))
  } catch {
    return null
  }
  if (typeof data !== 'object' || data == null || data.v !== 1) return null

  if (!Array.isArray(data.m) || data.m.length !== 5) return null
  const names = data.m.map((m) => cleanText(m, MAX_MOVE))
  if (names.some((n) => n == null)) return null
  const [hearts, spades, clubs, diamonds, aceMove] = names as string[]

  if (typeof data.k !== 'string') return null
  const deck: Card[] = []
  const seen = new Set<string>()
  for (const char of data.k) {
    const card = charCard(char)
    if (!card || seen.has(card.id)) return null
    seen.add(card.id)
    deck.push(card)
  }
  const standard = deck.filter((c) => c.kind === 'standard').length
  const jokers = deck.length - standard
  // Same shapes buildDeck deals: a full or half deck, with no jokers or all of them (2 or 1).
  const maxJokers = standard === 52 ? 2 : standard === 26 ? 1 : -1
  if (maxJokers < 0 || (jokers !== 0 && jokers !== maxJokers) || (jokers === 1 && !seen.has('joker-1'))) return null

  const jokerMoves = Array.isArray(data.j) ? data.j.map((m) => cleanText(m, MAX_MOVE)) : []
  if (jokerMoves.length !== jokers || jokerMoves.some((m) => m == null)) return null
  let j = 0
  const dealt = deck.map((c) => (c.kind === 'joker' ? { ...c, move: jokerMoves[j++]! } : c))

  const minutes = data.t
  if (typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 0 || minutes > MAX_MINUTES) return null

  let result: ChallengeResult | undefined
  if (Array.isArray(data.r)) {
    const [flipped, seconds] = data.r
    if (
      Number.isInteger(flipped) &&
      Number.isInteger(seconds) &&
      flipped >= 1 &&
      flipped <= deck.length &&
      seconds >= 0 &&
      seconds <= MAX_SECONDS
    ) {
      result = { flipped, timeMs: seconds * 1000 }
    }
  }

  return {
    id: typeof data.i === 'string' && /^[\w-]{1,16}$/.test(data.i) ? data.i : '',
    from: cleanText(data.n, MAX_NAME) ?? undefined,
    settings: {
      moves: { hearts, spades, clubs, diamonds },
      aceMove,
      deckSize: standard === 52 ? 'full' : 'half',
      jokers: jokers > 0,
      capFaceCards: data.f === 1,
      timerMode: minutes > 0 ? 'down' : 'up',
      timerMinutes: minutes > 0 ? minutes : 45,
    },
    deck: dealt,
    result,
  }
}

export const CHALLENGE_PARAM = 'c'

export function challengeUrl(challenge: Challenge): string {
  const url = new URL('challenge', siteUrl())
  url.searchParams.set(CHALLENGE_PARAM, encodeChallenge(challenge))
  return url.href
}

/** The challenge in a page address, whatever its path. */
export function challengeFromUrl(href: string): Challenge | null {
  const payload = new URL(href).searchParams.get(CHALLENGE_PARAM)
  return payload ? decodeChallenge(payload) : null
}

export type Outcome = { kind: 'won' | 'lost'; cards: number; ms: number } | { kind: 'tied' }

/**
 * You against the sender: more cards wins, then the faster time. Times count in whole seconds,
 * as shown on screen. `cards` and `ms` are the winning margins.
 */
export function compareResults(you: ChallengeResult, rival: ChallengeResult): Outcome {
  const yourSeconds = Math.floor(you.timeMs / 1000)
  const rivalSeconds = Math.floor(rival.timeMs / 1000)
  if (you.flipped === rival.flipped && yourSeconds === rivalSeconds) return { kind: 'tied' }
  const won = you.flipped !== rival.flipped ? you.flipped > rival.flipped : yourSeconds < rivalSeconds
  return {
    kind: won ? 'won' : 'lost',
    cards: Math.abs(you.flipped - rival.flipped),
    ms: Math.abs(yourSeconds - rivalSeconds) * 1000,
  }
}

/** The text that goes with a challenge link when it's shared. */
export function challengeMessage({ deck, result }: Pick<Challenge, 'deck' | 'result'>, rival?: string): string {
  const opener = rival ? `Rematch, ${rival}! ` : ''
  if (!result) return `${opener}I challenge you to a ${BRAND.name} workout: ${deck.length} cards, I picked the moves. You in? 💪`
  const time = formatDuration(result.timeMs)
  const score =
    result.flipped === deck.length
      ? `I cleared this ${BRAND.name} deck in ${time}.`
      : `I got through ${result.flipped} of ${deck.length} cards in ${time} on ${BRAND.name}.`
  return `${opener}${score} Think you can beat me? 💪`
}
