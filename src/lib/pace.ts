import { SUITS, taskFor } from './deck'
import type { Card, Settings, Suit } from './types'

export interface CardTime {
  card: Card
  ms: number
  /** Reps the card asked for; 0 for jokers, which run on their own timer. */
  reps: number
  move: string | null
}

/**
 * How long each flipped card took, from its flip to the next flip (or to the end of the workout
 * for the last one). Null when the session has no split times.
 */
export function cardTimes(
  deck: Card[],
  flipped: number,
  splits: number[] | undefined,
  totalMs: number,
  settings: Settings,
): CardTime[] | null {
  if (!splits || splits.length < flipped || flipped === 0) return null
  return deck.slice(0, flipped).map((card, i) => {
    const end = i + 1 < flipped ? splits[i + 1] : totalMs
    const task = taskFor(card, settings)
    return {
      card,
      ms: Math.max(0, end - splits[i]),
      reps: task.kind === 'move' ? task.reps : 0,
      move: task.kind === 'move' ? task.move : null,
    }
  })
}

export interface PaceGroup {
  key: string
  cards: number
  /** Average time per card. */
  perCardMs: number
  /** Time per rep across the group's cards. */
  perRepMs: number
}

function group(times: CardTime[], keyOf: (t: CardTime) => string | null, order: string[]): PaceGroup[] {
  const groups = new Map<string, { cards: number; ms: number; reps: number }>(order.map((k) => [k, { cards: 0, ms: 0, reps: 0 }]))
  for (const t of times) {
    const key = keyOf(t)
    if (key == null) continue
    const g = groups.get(key) ?? { cards: 0, ms: 0, reps: 0 }
    g.cards += 1
    g.ms += t.ms
    g.reps += t.reps
    groups.set(key, g)
  }
  return [...groups]
    .filter(([, g]) => g.cards > 0)
    .map(([key, g]) => ({ key, cards: g.cards, perCardMs: g.ms / g.cards, perRepMs: g.reps ? g.ms / g.reps : 0 }))
}

/** Pace per exercise, in setup order: suit moves, then the ace move. Jokers are left out. */
export function paceByMove(times: CardTime[], settings: Settings): PaceGroup[] {
  return group(times, (t) => t.move, [...SUITS.map((s) => settings.moves[s]), settings.aceMove])
}

/** Pace per suit, aces included with their suit. Jokers are left out. */
export function paceBySuit(times: CardTime[]): (PaceGroup & { key: Suit })[] {
  return group(times, (t) => (t.card.kind === 'standard' ? t.card.suit : null), SUITS) as (PaceGroup & { key: Suit })[]
}

export interface PaceSummary {
  /** Average time per non-joker card. */
  perCardMs: number
  perRepMs: number
  fastest: CardTime
  slowest: CardTime
  /** Average per-rep pace over the first and second half of the non-joker cards; null under 4 cards. */
  halves: { firstMs: number; secondMs: number } | null
}

const perRep = (times: CardTime[]) => {
  const reps = times.reduce((sum, t) => sum + t.reps, 0)
  return reps ? times.reduce((sum, t) => sum + t.ms, 0) / reps : 0
}

/**
 * Headline pace numbers. Halves compare time per rep rather than per card, so a run of kings
 * late in the deck doesn't read as slowing down. Null when no rep cards were timed.
 */
export function paceSummary(times: CardTime[]): PaceSummary | null {
  const moves = times.filter((t) => t.reps > 0)
  if (moves.length === 0) return null
  const half = Math.floor(moves.length / 2)
  return {
    perCardMs: moves.reduce((sum, t) => sum + t.ms, 0) / moves.length,
    perRepMs: perRep(moves),
    fastest: moves.reduce((a, b) => (b.ms < a.ms ? b : a)),
    slowest: moves.reduce((a, b) => (b.ms > a.ms ? b : a)),
    halves: moves.length >= 4 ? { firstMs: perRep(moves.slice(0, half)), secondMs: perRep(moves.slice(-half)) } : null,
  }
}
