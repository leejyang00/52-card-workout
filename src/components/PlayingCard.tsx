import { isFaceCard, isRed, SUIT_SYMBOL } from '../lib/deck'
import { CourtArt, JokerArt } from './CourtArt'
import type { Card } from '../lib/types'

const SIZE = 'aspect-[5/7] w-44 sm:w-52 rounded-2xl'

export function PlayingCard({ card }: { card: Card }) {
  if (card.kind === 'joker') {
    return (
      <div
        role="img"
        aria-label="Joker"
        className={`${SIZE} flex flex-col items-center justify-center gap-2 bg-white px-6 py-5 text-card-ink shadow-2xl shadow-black/50 motion-safe:animate-flip-in`}
      >
        <div className="min-h-0 w-full flex-1">
          <JokerArt />
        </div>
        <span className="text-lg font-black tracking-[0.3em]">JOKER</span>
      </div>
    )
  }

  const color = isRed(card.suit) ? 'text-suit-red' : 'text-card-ink'
  const symbol = SUIT_SYMBOL[card.suit]
  const corner = (
    <span className="flex flex-col items-center leading-none">
      <span className="text-2xl font-bold">{card.rank}</span>
      <span className="text-xl">{symbol}</span>
    </span>
  )

  return (
    <div
      role="img"
      aria-label={`${card.rank} of ${card.suit}`}
      className={`${SIZE} relative bg-white shadow-2xl shadow-black/50 motion-safe:animate-flip-in ${color}`}
    >
      <div className="absolute top-3 left-3">{corner}</div>
      <div className="absolute right-3 bottom-3 rotate-180">{corner}</div>
      {isFaceCard(card) ? (
        <div className="absolute inset-x-10 inset-y-5 overflow-hidden rounded-md border-2 border-current">
          <CourtArt rank={card.rank as 'J' | 'Q' | 'K'} suit={card.suit} />
        </div>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-8xl sm:text-9xl">{symbol}</div>
      )}
    </div>
  )
}

export function CardBack({ remaining }: { remaining: number }) {
  return (
    <div
      className={`${SIZE} relative grid place-items-center bg-base-800 p-2 shadow-2xl shadow-black/50 ring-1 ring-base-700`}
    >
      <div className="grid size-full place-items-center rounded-xl bg-[repeating-linear-gradient(45deg,var(--color-cardback)_0_6px,var(--color-cardback-2)_6px_12px)]">
        <span className="rounded-lg bg-base-950/80 px-3 py-1 text-sm font-semibold text-base-100">
          {remaining} cards
        </span>
      </div>
    </div>
  )
}
