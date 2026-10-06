/**
 * Feedback goes to a Google Apps Script web app that appends a row to a Google Sheet
 * (see feedback/apps-script.gs). The URL is public by design: it only accepts new rows.
 * With no URL configured the feedback UI stays hidden.
 */
export const FEEDBACK_URL: string = import.meta.env.VITE_FEEDBACK_URL ?? ''
export const feedbackEnabled = FEEDBACK_URL !== ''

export const RATING_LABELS = ['Not for me', 'Meh', 'Okay', 'Good', 'Love it'] as const

export const LIMITS = { comment: 2000, name: 60, email: 120 }

export type FeedbackSource = 'summary' | 'setup'

export interface FeedbackDraft {
  /** 1–5, or 0 when not rated. */
  rating: number
  comment: string
  name: string
  email: string
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export const EMPTY_DRAFT: FeedbackDraft = { rating: 0, comment: '', name: '', email: '', website: '' }

export interface WorkoutContext {
  cleared: boolean
  flipped: number
  deckLength: number
  reps: number
  timeMs: number
}

export interface FeedbackPayload {
  rating: number | null
  comment: string
  name: string
  email: string
  website: string
  source: FeedbackSource
  /** Rough location without tracking, e.g. "Europe/Berlin". */
  timeZone: string
  language: string
  workout: WorkoutContext | null
}

/** Needs at least a rating or a comment to be worth sending. */
export function canSend(draft: FeedbackDraft): boolean {
  return draft.rating > 0 || draft.comment.trim() !== ''
}

export function buildPayload(
  draft: FeedbackDraft,
  source: FeedbackSource,
  workout: WorkoutContext | null,
  locale: { timeZone: string; language: string },
): FeedbackPayload {
  return {
    rating: draft.rating >= 1 && draft.rating <= 5 ? draft.rating : null,
    comment: draft.comment.trim().slice(0, LIMITS.comment),
    name: draft.name.trim().slice(0, LIMITS.name),
    email: draft.email.trim().slice(0, LIMITS.email),
    website: draft.website,
    source,
    ...locale,
    workout,
  }
}

export function browserLocale() {
  let timeZone = ''
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  } catch {
    // Old browsers: leave it blank.
  }
  return { timeZone, language: navigator.language ?? '' }
}

/**
 * Apps Script doesn't answer CORS preflights, so this is a "simple" text/plain request in no-cors
 * mode. The response is opaque: a resolved promise means it reached Google, a rejection means
 * the network failed.
 */
export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  await fetch(FEEDBACK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
}
