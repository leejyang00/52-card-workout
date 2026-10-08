import { isRed, SUIT_SYMBOL } from '../lib/deck'
import type { Suit } from '../lib/types'

type Court = 'J' | 'Q' | 'K'

// Classic court-card palette: robes alternate red/blue with gold trim.
const GOLD = '#e8a917'
const RED = '#c8102e'
const BLUE = '#1d4e89'
const SKIN = '#fbe3c8'
const HAIR = '#6b3a1a'
const INK = '#111827'
const PAPER = '#fdf6e3'

/**
 * Double-ended court figure, like the middle panel of a real J/Q/K.
 * Drawn on a 100×200 canvas: one half-figure on top, the same half rotated below.
 */
export function CourtArt({ rank, suit }: { rank: Court; suit: Suit }) {
  return (
    <svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden="true">
      <rect width="100" height="200" fill={PAPER} />
      <HalfFigure rank={rank} suit={suit} />
      <g transform="rotate(180 50 100)">
        <HalfFigure rank={rank} suit={suit} />
      </g>
      <line x1="0" y1="100" x2="100" y2="100" stroke={INK} strokeWidth="1.2" />
    </svg>
  )
}

function HalfFigure({ rank, suit }: { rank: Court; suit: Suit }) {
  const red = isRed(suit)
  const robe = red ? RED : BLUE
  const sleeve = red ? BLUE : RED
  const pip = red ? '#e11d48' : INK

  // Figure is authored in a 100×70 box and scaled so its base sits on the centre line.
  return (
    <g transform="translate(50 100) scale(1.15) translate(-50 -70)" stroke={INK} strokeWidth="1" strokeLinejoin="round">
      {/* Shoulders and robe */}
      <path d="M10 70 L18 52 Q50 40 82 52 L90 70 Z" fill={robe} />
      <path d="M10 70 L18 52 Q24 50 28 49 L24 70 Z" fill={sleeve} />
      <path d="M90 70 L82 52 Q76 50 72 49 L76 70 Z" fill={sleeve} />
      <rect x="46" y="47" width="8" height="23" fill={GOLD} />
      <path d="M30 47 Q50 58 70 47 L66 43 Q50 52 34 43 Z" fill={GOLD} />

      {rank === 'Q' && <ellipse cx="50" cy="33" rx="14" ry="15" fill={HAIR} />}
      <rect x="45" y="37" width="10" height="8" fill={SKIN} />
      <circle cx="50" cy="30" r="11" fill={SKIN} />
      <circle cx="46" cy="29" r="1.1" fill={INK} stroke="none" />
      <circle cx="54" cy="29" r="1.1" fill={INK} stroke="none" />

      {rank === 'K' && (
        <>
          <path d="M40 31 Q41 46 50 46 Q59 46 60 31 Q56 37 50 37 Q44 37 40 31 Z" fill={HAIR} />
          <path d="M37 21 L37 9 L42 15 L46 5 L50 13 L54 5 L58 15 L63 9 L63 21 Z" fill={GOLD} />
          <rect x="37" y="18" width="26" height="4" fill={RED} />
          {/* Sword */}
          <path d="M80 8 L80 40" strokeWidth="2.4" stroke={INK} />
          <path d="M75 36 L85 36" strokeWidth="2.4" stroke={GOLD} />
        </>
      )}

      {rank === 'Q' && (
        <>
          <path d="M47 35 Q50 37 53 35" fill="none" />
          <path d="M39 21 Q41 12 45 18 Q50 6 55 18 Q59 12 61 21 Z" fill={GOLD} />
          <circle cx="50" cy="14" r="1.6" fill={RED} />
          {/* Flower */}
          <path d="M82 46 L80 22" fill="none" stroke={INK} />
          <circle cx="80" cy="20" r="4" fill={RED} />
          <circle cx="80" cy="20" r="1.6" fill={GOLD} stroke="none" />
        </>
      )}

      {rank === 'J' && (
        <>
          <path d="M47 35 Q50 37 53 35" fill="none" />
          <path d="M39 28 Q38 19 50 19 Q62 19 61 28 Z" fill={HAIR} />
          <path d="M36 23 Q50 5 64 23 Z" fill={sleeve} />
          <rect x="36" y="21" width="28" height="3.5" fill={GOLD} />
          {/* Feather */}
          <path d="M60 16 Q74 2 82 9 Q72 11 62 20 Z" fill={GOLD} />
        </>
      )}

      <text x="18" y="24" fontSize="16" textAnchor="middle" fill={pip} stroke="none">
        {SUIT_SYMBOL[suit]}
      </text>
    </g>
  )
}

/** Jester for the joker card. */
export function JokerArt() {
  return (
    <svg viewBox="0 0 100 120" className="size-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
        {/* Body */}
        <path d="M18 120 L26 88 Q50 78 74 88 L82 120 Z" fill={BLUE} />
        <path d="M50 82 L50 120 L82 120 L74 88 Q62 83 50 82 Z" fill={RED} />
        {/* Ruff collar */}
        <path d="M28 82 L34 92 L40 84 L46 94 L50 85 L54 94 L60 84 L66 92 L72 82 Q50 74 28 82 Z" fill={GOLD} />
        {/* Hat */}
        <path d="M32 46 L14 16 L44 36 Z" fill={RED} />
        <path d="M42 38 L50 6 L58 38 Z" fill={GOLD} />
        <path d="M68 46 L86 16 L56 36 Z" fill={BLUE} />
        <path d="M30 48 Q50 30 70 48 Z" fill={RED} />
        <circle cx="14" cy="16" r="4" fill={GOLD} />
        <circle cx="50" cy="6" r="4" fill={RED} />
        <circle cx="86" cy="16" r="4" fill={GOLD} />
        {/* Face */}
        <circle cx="50" cy="61" r="15" fill={SKIN} />
        <circle cx="44" cy="58" r="1.5" fill={INK} stroke="none" />
        <circle cx="56" cy="58" r="1.5" fill={INK} stroke="none" />
        <path d="M42 65 Q50 74 58 65" fill="none" strokeWidth="1.6" />
        <circle cx="40" cy="65" r="2.5" fill={RED} stroke="none" opacity="0.5" />
        <circle cx="60" cy="65" r="2.5" fill={RED} stroke="none" opacity="0.5" />
      </g>
    </svg>
  )
}
