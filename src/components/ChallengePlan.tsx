import type { ChallengeSettings } from '../lib/challenge'
import { isRed, moveTotals, SUIT_LABEL, SUIT_SYMBOL, SUITS } from '../lib/deck'
import type { Card, Suit } from '../lib/types'

/** A suit, or every ace. */
type SuitSlot = Suit | 'ace'

function SlotChip({ slot }: { slot: SuitSlot }) {
  const color = slot === 'ace' ? 'bg-accent text-on-accent' : `bg-white ${isRed(slot) ? 'text-suit-red' : 'text-card-ink'}`
  return (
    <span
      role="img"
      aria-label={slot === 'ace' ? 'Aces' : SUIT_LABEL[slot]}
      className={`grid h-8 w-6 place-items-center rounded text-sm leading-none font-bold shadow-sm ring-1 ring-black/10 ${color}`}
    >
      {slot === 'ace' ? 'A' : SUIT_SYMBOL[slot]}
    </span>
  )
}

/** A challenge's workout at a glance: each move with its reps in this deck, then the rules. */
export function ChallengePlan({ settings, deck }: { settings: ChallengeSettings; deck: Card[] }) {
  const totals = moveTotals(deck, 0, settings)
  // Which suits call each move, so a move picked twice shows both.
  const slots = (move: string): SuitSlot[] => [
    ...SUITS.filter((suit) => settings.moves[suit] === move),
    ...(settings.aceMove === move ? ['ace' as const] : []),
  ]
  const reps = totals.reduce((sum, t) => sum + t.total, 0)
  const cards = deck.filter((c) => c.kind === 'standard').length
  const jokers = deck.length - cards
  const rules = [
    `${cards} cards`,
    jokers > 0 && `${jokers} ${jokers === 1 ? 'joker' : 'jokers'}`,
    `${reps} reps`,
    settings.capFaceCards && 'face cards capped at 10',
    settings.timerMode === 'down' && `${settings.timerMinutes}-minute countdown`,
  ]

  return (
    <div>
      <ul className="divide-y divide-base-800">
        {totals.map((t) => (
          <li key={t.move} className="flex items-center gap-3 py-2">
            <span className="flex shrink-0 gap-1">
              {slots(t.move).map((slot) => (
                <SlotChip key={slot} slot={slot} />
              ))}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold">{t.move}</span>
            <span className="tabular shrink-0 text-sm text-base-400">
              <b className="text-base-100">{t.total}</b> reps
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-base-400">{rules.filter(Boolean).join(' · ')}</p>
    </div>
  )
}
