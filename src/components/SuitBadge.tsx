import { isRed, SUIT_SYMBOL, type SuitSlot } from '../lib/deck'

const SIZE = {
  md: 'h-12 w-9 rounded-md text-xl',
  sm: 'h-6 w-[1.125rem] rounded-[0.25rem] text-xs',
}

/** Mini card face with the suit symbol. */
export function SuitBadge({ suit, label, size = 'md' }: { suit: SuitSlot; label?: string; size?: keyof typeof SIZE }) {
  const color = suit === 'ace' ? 'text-on-accent' : isRed(suit) ? 'text-suit-red' : 'text-card-ink'
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`grid shrink-0 place-items-center leading-none font-bold shadow-sm ring-1 ring-black/10 ${SIZE[size]} ${color} ${suit === 'ace' ? 'bg-accent' : 'bg-white'}`}
    >
      {suit === 'ace' ? 'A' : SUIT_SYMBOL[suit]}
    </span>
  )
}
