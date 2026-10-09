import { useEffect } from 'react'
import { communityEnabled, countsAsWorkout, countWorkout, fetchTotals, type CommunityTotals } from '../lib/community'
import { useLocalStorage } from './useLocalStorage'

/**
 * Community totals for the home screen. Shows the last known numbers straight away, then refreshes.
 * Null until there's something worth showing.
 */
export function useCommunityTotals(): CommunityTotals | null {
  const [totals, setTotals] = useLocalStorage<CommunityTotals | null>('cw:community:v1', null)

  useEffect(() => {
    if (!communityEnabled) return
    let live = true
    fetchTotals().then((t) => {
      if (live && t) setTotals(t)
    })
    return () => {
      live = false
    }
  }, [setTotals])

  return communityEnabled && totals && totals.workouts > 0 ? totals : null
}

interface Counted extends CommunityTotals {
  /** The session's finishedAt, so a reload of the same summary isn't counted twice. */
  finishedAt: number
}

// One request per finished workout, even when React mounts the summary twice.
const pending = new Map<number, Promise<CommunityTotals | null>>()

/**
 * Counts this workout once and returns the totals including it, so the summary can say
 * "You're Burno workout #N". Null while counting, or if it failed.
 */
export function useCountWorkout(finishedAt: number | null, cards: number, reps: number): CommunityTotals | null {
  const [counted, setCounted] = useLocalStorage<Counted | null>('cw:counted:v1', null)
  const done = counted != null && counted.finishedAt === finishedAt

  useEffect(() => {
    if (!communityEnabled || finishedAt == null || done || !countsAsWorkout(cards)) return
    let live = true
    let request = pending.get(finishedAt)
    if (!request) {
      request = countWorkout({ cards, reps })
      pending.set(finishedAt, request)
    }
    request.then((t) => {
      if (live && t) setCounted({ ...t, finishedAt })
    })
    return () => {
      live = false
    }
  }, [finishedAt, done, cards, reps, setCounted])

  return done ? counted : null
}
