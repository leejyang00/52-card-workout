import { isRed, SUIT_SYMBOL } from '../lib/deck'
import type { Card } from '../lib/types'

const SIZE = 'aspect-[5/7] w-44 sm:w-52 rounded-2xl'

export function PlayingCard({ card }: { card: Card }) {
  if (card.kind === 'joker') {
    return (
      <div
        className={`${SIZE} flex flex-col items-center justify-center gap-2 bg-white text-stone-950 shadow-2xl shadow-black/50 motion-safe:animate-flip-in`}
      >
        <span className="text-6xl">🃏</span>
        <span className="text-lg font-black tracking-[0.3em]">JOKER</span>
      </div>
    )
  }

  const color = isRed(card.suit) ? 'text-suit-red' : 'text-stone-950'
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
      <div className="absolute inset-0 grid place-items-center text-8xl sm:text-9xl">{symbol}</div>
    </div>
  )
}

export function CardBack({ remaining }: { remaining: number }) {
  return (
    <div
      className={`${SIZE} relative grid place-items-center bg-stone-800 p-2 shadow-2xl shadow-black/50 ring-1 ring-stone-700`}
    >
      <div className="grid size-full place-items-center rounded-xl bg-[repeating-linear-gradient(45deg,var(--color-suit-red)_0_6px,#8f1220_6px_12px)]">
        <span className="rounded-lg bg-stone-950/80 px-3 py-1 text-sm font-semibold text-stone-100">
          {remaining} cards
        </span>
      </div>
    </div>
  )
}
