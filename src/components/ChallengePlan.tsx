import type { ChallengeSettings } from '../lib/challenge'
import { isRed, moveTotals, SUIT_LABEL, SUIT_SYMBOL, type SuitSlot } from '../lib/deck'
import type { Card } from '../lib/types'

function SlotChip({ slot, compact }: { slot: SuitSlot; compact: boolean }) {
  const color = slot === 'ace' ? 'bg-accent text-on-accent' : `bg-white ${isRed(slot) ? 'text-suit-red' : 'text-card-ink'}`
  return (
    <span
      role="img"
      aria-label={slot === 'ace' ? 'Aces' : SUIT_LABEL[slot]}
      className={`grid place-items-center rounded leading-none font-bold shadow-sm ring-1 ring-black/10 ${compact ? 'h-6 w-[1.125rem] text-xs' : 'h-8 w-6 text-sm'} ${color}`}
    >
      {slot === 'ace' ? 'A' : SUIT_SYMBOL[slot]}
    </span>
  )
}

interface Props {
  settings: ChallengeSettings
  deck: Card[]
  /** Tighter rows, for a sheet on a small screen. */
  compact?: boolean
}

/** A challenge's workout at a glance: each move with its reps in this deck, then the rules. */
export function ChallengePlan({ settings, deck, compact = false }: Props) {
  const totals = moveTotals(deck, 0, settings)
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
          <li key={t.move} className={`flex items-center gap-3 ${compact ? 'py-1.5 text-sm' : 'py-2'}`}>
            <span className="flex shrink-0 gap-1">
              {t.slots.map((slot) => (
                <SlotChip key={slot} slot={slot} compact={compact} />
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
