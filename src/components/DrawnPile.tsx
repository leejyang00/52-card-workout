import { cardLabel, isRed } from '../lib/deck'
import type { Card } from '../lib/types'

/** Cards flipped so far, most recent first. */
export function DrawnPile({ cards }: { cards: Card[] }) {
  if (!cards.length) return <p className="text-sm text-stone-500">No cards flipped yet.</p>
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Flipped cards, most recent first">
      {[...cards].reverse().map((card) => (
        <li
          key={card.id}
          className={`tabular grid h-9 min-w-8 place-items-center rounded-md bg-white px-1.5 text-sm font-bold ${
            card.kind === 'standard' && isRed(card.suit) ? 'text-suit-red' : 'text-stone-950'
          }`}
        >
          {cardLabel(card)}
        </li>
      ))}
    </ol>
  )
}
