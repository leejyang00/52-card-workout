import { isRed, SUIT_SYMBOL } from '../lib/deck'
import type { Suit } from '../lib/types'

/** Mini card face with the suit symbol. */
export function SuitBadge({ suit, label }: { suit: Suit | 'ace'; label?: string }) {
  const color = suit === 'ace' ? 'text-on-accent' : isRed(suit) ? 'text-suit-red' : 'text-card-ink'
  return (
    <span
      role="img"
      aria-label={label}
      className={`grid h-12 w-9 shrink-0 place-items-center rounded-md bg-white text-xl leading-none font-bold shadow-sm ring-1 ring-black/10 ${color} ${suit === 'ace' ? 'bg-accent' : ''}`}
    >
      {suit === 'ace' ? 'A' : SUIT_SYMBOL[suit]}
    </span>
  )
}
