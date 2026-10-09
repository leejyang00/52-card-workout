import { useCommunityTotals, useCountWorkout } from '../hooks/useCommunity'
import { BRAND } from '../lib/brand'
import { communityEnabled, countsAsWorkout, formatCount, formatReps } from '../lib/community'

/** Home screen: how many workouts people have done, as an invite to join them. */
export function CommunityInvite() {
  const totals = useCommunityTotals()
  if (!communityEnabled) return null
  return (
    // Height is held while loading so the button below doesn't jump.
    <p className="mt-4 min-h-5 text-sm text-balance text-base-400" aria-live="polite">
      {totals && (
        <span className="motion-safe:animate-fade-in">
          🔥 <strong className="tabular font-bold text-base-200">{formatCount(totals.workouts)}</strong>{' '}
          {totals.workouts === 1 ? 'workout' : 'workouts'} done by the {BRAND.name} crowd.{' '}
          <span className="whitespace-nowrap">Join them.</span>
        </span>
      )}
    </p>
  )
}

interface FinishedProps {
  finishedAt: number | null
  cards: number
  reps: number
}

/** Summary screen: this workout's number in the count, and everyone's reps together. */
export function CommunityFinished({ finishedAt, cards, reps }: FinishedProps) {
  const totals = useCountWorkout(finishedAt, cards, reps)
  if (!communityEnabled || !countsAsWorkout(cards)) return null
  return (
    <div className="mt-4 min-h-12" aria-live="polite">
      {totals && (
        <div className="motion-safe:animate-fade-in">
          <p className="font-bold text-base-100">
            You're {BRAND.name} workout <span className="tabular text-accent-strong">#{formatCount(totals.workouts)}</span> 🎉
          </p>
          <p className="mt-0.5 text-sm text-base-400">
            Together: <span className="tabular">{formatReps(totals.reps)}</span> reps and counting.
          </p>
        </div>
      )}
    </div>
  )
}
