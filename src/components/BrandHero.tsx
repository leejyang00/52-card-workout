import { useState } from 'react'
import { BRAND } from '../lib/brand'
import { BurnoMark } from './BurnoMark'

const CARD = 'absolute bottom-1 left-1/2 -ml-[2.4rem] h-24 w-[4.8rem] origin-bottom'

/** Logo lockup: the flame card with a coloured card flipping out behind it. Tap it to flip again. */
export function BrandHero() {
  const [flips, setFlips] = useState(0)
  const name = BRAND.name.toUpperCase()
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => setFlips((n) => n + 1)}
        aria-label={`${BRAND.name} logo. Tap to flip`}
        className="group relative h-28 w-40 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <span
          key={`b${flips}`}
          aria-hidden
          className={`${CARD} translate-x-2 rotate-[14deg] rounded-[0.65rem] bg-gradient-to-t from-flame-2 to-flame shadow-lg shadow-black/20 transition-[rotate] duration-300 group-hover:rotate-[20deg] motion-safe:animate-deal`}
        />
        <span key={`f${flips}`} className={`${CARD} -translate-x-2 -rotate-6 drop-shadow-xl motion-safe:animate-flip-in`}>
          <BurnoMark className="size-full" />
        </span>
      </button>
      <h1 className="mt-4 font-display text-6xl leading-none font-black tracking-tight [font-stretch:125%] sm:text-7xl">
        {name.slice(0, -1)}
        <span className="bg-gradient-to-t from-flame-2 to-flame bg-clip-text text-transparent">{name.slice(-1)}</span>
      </h1>
      <p className="mt-3 text-sm font-bold tracking-[0.3em] text-accent-strong uppercase">{BRAND.tagline}</p>
    </div>
  )
}
