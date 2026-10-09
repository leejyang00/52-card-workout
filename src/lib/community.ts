import { FEEDBACK_URL } from './feedback'

/**
 * Community totals: every finished workout adds one to a shared counter, kept by the same Apps
 * Script web app as feedback (see feedback/apps-script.gs). Only the card and rep counts are sent.
 * With no URL configured, or if a request fails, the counter lines stay hidden.
 */
export const communityEnabled = FEEDBACK_URL !== ''

export interface CommunityTotals {
  workouts: number
  reps: number
}

/** Pulls the totals out of a script reply, or null if it isn't a usable answer. */
export function parseTotals(body: unknown): CommunityTotals | null {
  if (typeof body !== 'object' || body == null) return null
  const { ok, workouts, reps } = body as Record<string, unknown>
  if (ok !== true || typeof workouts !== 'number' || typeof reps !== 'number') return null
  if (!Number.isFinite(workouts) || !Number.isFinite(reps) || workouts < 0 || reps < 0) return null
  return { workouts, reps }
}

/** A workout counts once at least one card was flipped; clearing the deck isn't needed. */
export function countsAsWorkout(flipped: number): boolean {
  return flipped >= 1
}

/** 1284 → "1,284". */
export function formatCount(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** Big rep totals read better short: 84,210 → "84,210", 3,140,000 → "3.1M". */
export function formatReps(n: number): string {
  if (n < 100_000) return formatCount(n)
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

async function readTotals(res: Response): Promise<CommunityTotals | null> {
  if (!res.ok) return null
  try {
    return parseTotals(await res.json())
  } catch {
    return null
  }
}

/** Current totals, for the home screen. */
export async function fetchTotals(): Promise<CommunityTotals | null> {
  try {
    return await readTotals(await fetch(FEEDBACK_URL, { cache: 'no-store' }))
  } catch {
    return null
  }
}

/**
 * Counts a finished workout and returns the totals including it. A text/plain POST skips the CORS
 * preflight Apps Script can't answer; its reply comes back readable after Google's redirect.
 */
export async function countWorkout(workout: { cards: number; reps: number }): Promise<CommunityTotals | null> {
  try {
    const res = await fetch(FEEDBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type: 'finish', ...workout }),
    })
    return await readTotals(res)
  } catch {
    return null
  }
}
