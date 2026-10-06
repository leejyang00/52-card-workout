import { useState } from 'react'
import { BRAND } from '../lib/brand'
import { BurnoMark } from './BurnoMark'

const CARD = 'absolute bottom-0 left-1/2 -ml-[2.4rem] h-24 w-[4.8rem] origin-bottom'
const BACK = `${CARD} rounded-[0.65rem] border-[3px] border-white bg-[repeating-linear-gradient(45deg,var(--color-cardback)_0_5px,var(--color-cardback-2)_5px_10px)] shadow-lg shadow-black/30 transition-[rotate,translate] duration-300`

/** Logo lockup: a fanned hand with the flame card on top. Tap it to re-deal. */
export function BrandHero() {
  const [deals, setDeals] = useState(0)
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => setDeals((n) => n + 1)}
        aria-label={`${BRAND.name} logo. Tap to deal again`}
        className="group relative h-28 w-44 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <span key={`l${deals}`} aria-hidden className={`${BACK} -translate-x-3 -rotate-[18deg] group-hover:-rotate-[26deg] motion-safe:animate-deal`} />
        <span key={`r${deals}`} aria-hidden className={`${BACK} translate-x-3 rotate-[18deg] group-hover:rotate-[26deg] motion-safe:animate-deal`} />
        <span key={`f${deals}`} className={`${CARD} drop-shadow-xl motion-safe:animate-flip-in`}>
          <BurnoMark className="size-full" />
        </span>
      </button>
      <h1 className="mt-4 font-display text-6xl leading-none font-black tracking-tight uppercase [font-stretch:125%] sm:text-7xl">
        {BRAND.name}
      </h1>
      <p className="mt-3 text-sm font-bold tracking-[0.3em] text-accent uppercase">{BRAND.tagline}</p>
    </div>
  )
}
