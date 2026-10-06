import { useEffect, useState } from 'react'
import {
  browserLocale,
  buildPayload,
  canSend,
  EMPTY_DRAFT,
  LIMITS,
  RATING_LABELS,
  sendFeedback,
  type FeedbackDraft,
  type FeedbackSource,
  type WorkoutContext,
} from '../lib/feedback'
import { Button } from './Button'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  source: FeedbackSource
  /** Star tapped on the summary card, so the sheet opens already rated. */
  initialRating?: number
  workout?: WorkoutContext
  onSent?: () => void
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

const inputClass =
  'w-full rounded-xl bg-base-800/60 px-3 py-2.5 text-base text-base-100 ring-1 ring-base-700 placeholder:text-base-500 focus:ring-2 focus:ring-accent focus:outline-none'

export function Stars({ value, onChange, size = 'lg' }: { value: number; onChange: (v: number) => void; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'size-12' : 'size-10'
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {RATING_LABELS.map((label, i) => {
        const n = i + 1
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}: ${label}`}
            onClick={() => onChange(n)}
            className={`grid ${box} place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-accent active:scale-95 ${n <= value ? 'text-accent' : 'text-base-700'}`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4/5" aria-hidden>
              <path d="M10.87 2.6a.97.97 0 0 0-1.74 0L7.2 6.5l-4.3.63a.97.97 0 0 0-.54 1.65l3.11 3.03-.73 4.28a.97.97 0 0 0 1.4 1.02L10 15.09l3.85 2.02a.97.97 0 0 0 1.41-1.02l-.74-4.28 3.12-3.03a.97.97 0 0 0-.54-1.65l-4.3-.63-1.93-3.9Z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

/** 5 stars, an optional note, and optional first name / email. Anonymous by default. */
export function FeedbackSheet({ open, onClose, source, initialRating = 0, workout, onSent }: Props) {
  const [draft, setDraft] = useState<FeedbackDraft>(EMPTY_DRAFT)
  const [status, setStatus] = useState<Status>('idle')
  const sent = status === 'sent'

  // Fresh form each time it opens, keeping a star picked on the summary card.
  useEffect(() => {
    if (!open) return
    setDraft({ ...EMPTY_DRAFT, rating: initialRating })
    setStatus('idle')
  }, [open, initialRating])

  const set = <K extends keyof FeedbackDraft>(key: K, value: FeedbackDraft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const send = async () => {
    if (!canSend(draft) || status === 'sending') return
    setStatus('sending')
    try {
      await sendFeedback(buildPayload(draft, source, workout ?? null, browserLocale()))
      setStatus('sent')
      onSent?.()
    } catch {
      setStatus('error')
    }
  }

  const footer = sent ? (
    <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
      Done
    </Button>
  ) : (
    <div className="flex flex-col gap-2">
      <Button variant="primary" size="lg" className="w-full" disabled={!canSend(draft) || status === 'sending'} onClick={send}>
        {status === 'sending' ? 'Sending…' : 'Send feedback'}
      </Button>
      <p role="status" className="min-h-5 text-center text-sm text-base-400">
        {status === 'error'
          ? "Couldn't send. Check your connection and try again."
          : !canSend(draft)
            ? 'Pick a rating or write a note.'
            : ''}
      </p>
    </div>
  )

  return (
    <Sheet open={open} onClose={onClose} title={sent ? 'Thank you!' : "How's Burno treating you?"} footer={footer}>
      {sent ? (
        <p className="text-base-300">Got it. Every note gets read and helps shape what Burno does next. 🔥</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1">
            <Stars value={draft.rating} onChange={(v) => set('rating', v)} />
            <p className="h-5 text-sm font-semibold text-base-400">{draft.rating ? RATING_LABELS[draft.rating - 1] : ''}</p>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-bold">
              Anything to fix or add? <span className="font-normal text-base-400">(optional)</span>
            </span>
            <textarea
              rows={4}
              maxLength={LIMITS.comment}
              value={draft.comment}
              onChange={(e) => set('comment', e.target.value)}
              placeholder="A bug, a move you miss, what you loved…"
              className={`${inputClass} resize-none`}
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">
                First name <span className="font-normal text-base-400">(optional)</span>
              </span>
              <input
                type="text"
                autoComplete="given-name"
                maxLength={LIMITS.name}
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">
                Email <span className="font-normal text-base-400">(optional)</span>
              </span>
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={LIMITS.email}
                value={draft.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="Only if you'd like a reply"
                className={inputClass}
              />
            </label>
          </div>

          {/* Honeypot: off-screen and skipped by keyboards and screen readers, so only bots fill it in. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={draft.website}
            onChange={(e) => set('website', e.target.value)}
            className="absolute -left-[9999px] size-px opacity-0"
          />

          <p className="mt-4 text-xs text-base-400">
            Anonymous is totally fine. Along with what you write, we only send your time zone
            {workout ? ", language and this workout's stats" : ' and language'}. No tracking, no mailing list.
          </p>
        </>
      )}
    </Sheet>
  )
}
