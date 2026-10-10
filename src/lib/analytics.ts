import type { PostHog } from 'posthog-js'
import type { Session } from '../hooks/useSession'
import { elapsedMs } from '../hooks/useSession'
import { moveTotals } from './deck'
import type { Settings } from './types'

/**
 * Visitor and retention analytics via PostHog. The project key is public by design: it can only
 * send events. With no key configured nothing loads and every call is a no-op.
 * Visitors get an anonymous id kept in localStorage (no cookies) so returning visits can be told
 * apart from new ones. Nothing personal is sent.
 */
export const POSTHOG_KEY: string = import.meta.env.VITE_POSTHOG_KEY ?? ''
export const POSTHOG_HOST: string = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'
export const analyticsEnabled = POSTHOG_KEY !== ''

let client: Promise<PostHog | null> | null = null

/** Loads PostHog after first paint so it never slows the app down. Safe to call more than once. */
export function initAnalytics(): void {
  if (!analyticsEnabled || client) return
  client = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        defaults: '2025-05-24',
        persistence: 'localStorage',
        // Anonymous events only: unique visitors and retention still work, at no extra cost.
        person_profiles: 'identified_only',
        disable_session_recording: true,
      })
      return posthog
    })
    .catch(() => null)
}

function track(event: string, properties: Record<string, unknown>): void {
  client?.then((posthog) => posthog?.capture(event, properties))
}

export function startProperties(settings: Settings, restart: boolean) {
  return {
    restart,
    deck_size: settings.deckSize,
    jokers: settings.jokers,
    timer_mode: settings.timerMode,
  }
}

export function finishProperties(session: Session, now: number) {
  const { deck, flipped, settings, clock } = session
  return {
    cards: flipped,
    deck_length: deck.length,
    cleared: flipped === deck.length,
    reps: moveTotals(deck, flipped, settings).reduce((sum, t) => sum + t.done, 0),
    duration_s: Math.round(elapsedMs(clock, now) / 1000),
    deck_size: settings.deckSize,
  }
}

export function trackWorkoutStarted(settings: Settings, restart = false): void {
  track('workout_started', startProperties(settings, restart))
}

export function trackWorkoutFinished(session: Session): void {
  track('workout_finished', finishProperties(session, Date.now()))
}
