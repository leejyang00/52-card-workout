export type Suit = 'hearts' | 'spades' | 'clubs' | 'diamonds'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export type Card =
  | { id: string; kind: 'standard'; suit: Suit; rank: Rank }
  | { id: string; kind: 'joker' }

export type DeckSize = 'full' | 'half'
export type TimerMode = 'up' | 'down'

export interface Settings {
  /** Exercise name assigned to each suit. */
  moves: Record<Suit, string>
  /** Exercise every Ace maps to, regardless of suit. */
  aceMove: string
  deckSize: DeckSize
  jokers: boolean
  capFaceCards: boolean
  timerMode: TimerMode
  /** Countdown length; ignored when counting up. */
  timerMinutes: number
}

/** What a flipped card asks you to do. */
export type Task =
  | { kind: 'move'; move: string; reps: number; isAce: boolean }
  | { kind: 'rest'; seconds: number }
