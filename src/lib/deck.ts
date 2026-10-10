import type { Card, Rank, Settings, Suit, Task } from './types'

export const SUITS: Suit[] = ['hearts', 'spades', 'clubs', 'diamonds']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: '♥',
  spades: '♠',
  clubs: '♣',
  diamonds: '♦',
}

export const SUIT_LABEL: Record<Suit, string> = {
  hearts: 'Hearts',
  spades: 'Spades',
  clubs: 'Clubs',
  diamonds: 'Diamonds',
}

export const ACE_REPS = 20
export const JOKER_REST_SECONDS = 60
export const JOKER_MOVE_SECONDS = 30

export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds'
}

/** Fisher–Yates; returns a new array. */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function buildDeck(
  { deckSize, jokers }: Pick<Settings, 'deckSize' | 'jokers'>,
  rng: () => number = Math.random,
): Card[] {
  const standard: Card[] = SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({ id: `${rank}-${suit}`, kind: 'standard' as const, suit, rank })),
  )
  let cards = shuffle(standard, rng)
  if (deckSize === 'half') cards = cards.slice(0, 26)
  if (jokers) {
    const count = deckSize === 'half' ? 1 : 2
    for (let i = 1; i <= count; i++) cards.push({ id: `joker-${i}`, kind: 'joker' })
  }
  return shuffle(cards, rng)
}

export function rankReps(rank: Rank, capFaceCards: boolean): number {
  switch (rank) {
    case 'A':
      return ACE_REPS
    case 'J':
      return capFaceCards ? 10 : 11
    case 'Q':
      return capFaceCards ? 10 : 12
    case 'K':
      return capFaceCards ? 10 : 13
    default:
      return Number(rank)
  }
}

export function taskFor(card: Card, settings: Settings): Task {
  if (card.kind === 'joker') return { kind: 'joker', move: card.move ?? 'Burpees' }
  const isAce = card.rank === 'A'
  return {
    kind: 'move',
    move: isAce ? settings.aceMove : settings.moves[card.suit],
    reps: rankReps(card.rank, settings.capFaceCards),
    isAce,
  }
}

export function isFaceCard(card: Card): boolean {
  return card.kind === 'standard' && (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K')
}

export interface MoveTotal {
  move: string
  done: number
  total: number
}

/**
 * Reps per move: done so far vs. everything in the deck, in suit order then the ace move.
 * Moves sharing a name are merged.
 */
export function moveTotals(deck: Card[], flipped: number, settings: Settings): MoveTotal[] {
  const totals = new Map<string, MoveTotal>()
  for (const move of [...SUITS.map((s) => settings.moves[s]), settings.aceMove]) {
    if (!totals.has(move)) totals.set(move, { move, done: 0, total: 0 })
  }
  deck.forEach((card, i) => {
    const task = taskFor(card, settings)
    if (task.kind !== 'move') return
    const entry = totals.get(task.move) ?? { move: task.move, done: 0, total: 0 }
    entry.total += task.reps
    if (i < flipped) entry.done += task.reps
    totals.set(task.move, entry)
  })
  return [...totals.values()].filter((t) => t.total > 0)
}

export function cardLabel(card: Card): string {
  return card.kind === 'joker' ? 'JKR' : `${card.rank}${SUIT_SYMBOL[card.suit]}`
}

const RANK_NAME: Partial<Record<Rank, string>> = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' }

/** The card spelled out, e.g. "King of Spades". */
export function cardName(card: Card): string {
  return card.kind === 'joker' ? 'Joker' : `${RANK_NAME[card.rank] ?? card.rank} of ${SUIT_LABEL[card.suit]}`
}
