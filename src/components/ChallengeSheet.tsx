import { useEffect, useState } from 'react'
import { dealDeck } from '../hooks/useSession'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { trackChallengeCreated, trackChallengeShared } from '../lib/analytics'
import {
  challengeMessage,
  challengeUrl,
  MAX_NAME,
  newChallengeId,
  type Challenge,
  type ChallengeResult,
  type ChallengeSettings,
} from '../lib/challenge'
import { formatDuration } from '../lib/format'
import type { Card } from '../lib/types'
import { Button } from './Button'
import { ChallengePlan } from './ChallengePlan'
import { inputClass } from './FeedbackSheet'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  source: 'setup' | 'summary'
  settings: ChallengeSettings
  /** The deck to send. Without one, a fresh deck is dealt each time the sheet opens. */
  deck?: Card[]
  /** Your score, for your friend to beat. */
  result?: ChallengeResult
  /** Whoever challenged you, when sending one back. */
  rival?: string
}

export function ChallengeSheet({ open, onClose, source, settings, deck, result, rival }: Props) {
  const [name, setName] = useLocalStorage('cw:challenge-name:v1', '')
  // One link per opening: the same deck and id however the name is edited.
  const [base, setBase] = useState<Omit<Challenge, 'from'> | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!open) return
    const created = { id: newChallengeId(), settings, deck: deck ?? dealDeck(settings), result }
    setBase(created)
    trackChallengeCreated(created, source, rival != null)
    return () => {
      setBase(null)
      setNotice('')
    }
    // The workout is fixed while the sheet is open, so only build a new link on open.
  }, [open])

  const challenge = base && { ...base, from: name.trim() || undefined }
  const url = challenge ? challengeUrl(challenge) : ''
  const message = challenge ? challengeMessage(challenge, rival) : ''
  const canShare = typeof navigator.share === 'function'

  const share = async () => {
    if (!challenge) return
    try {
      await navigator.share({ text: message, url })
      trackChallengeShared(challenge, 'share')
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setNotice("Couldn't open the share menu. Copy the link instead.")
    }
  }

  const copy = async () => {
    if (!challenge) return
    try {
      await navigator.clipboard.writeText(`${message} ${url}`)
      setNotice('Challenge copied. Paste it to a friend.')
      trackChallengeShared(challenge, 'copy')
    } catch {
      setNotice(url)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={rival ? `Challenge ${rival} back` : 'Challenge a friend'}
      footer={
        <div className="flex flex-col gap-2">
          {canShare ? (
            <Button variant="primary" size="lg" onClick={share} disabled={!challenge}>
              Send challenge
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={copy} disabled={!challenge}>
              Copy challenge link
            </Button>
          )}
          {canShare && (
            <Button onClick={copy} disabled={!challenge}>
              Copy link
            </Button>
          )}
          <p role="status" className="min-h-5 text-center text-sm break-all text-base-400">
            {notice}
          </p>
        </div>
      }
    >
      <p className="text-base-300">
        {result
          ? `${rival ?? 'Your friend'} gets this exact deck, card for card, and your score to beat.`
          : 'Your friend gets your moves and a shuffled deck. Everyone who opens this link flips the same cards in the same order.'}
      </p>

      {result && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-accent/15 px-4 py-3 ring-1 ring-accent/40">
          <span className="text-sm font-bold">To beat</span>
          <span className="tabular text-xl font-black">
            {challenge && result.flipped < challenge.deck.length && `${result.flipped} cards · `}
            {formatDuration(result.timeMs)}
          </span>
        </div>
      )}

      {challenge && (
        <div className="mt-4 rounded-2xl bg-base-800/40 px-4 py-2 ring-1 ring-base-800">
          <ChallengePlan settings={challenge.settings} deck={challenge.deck} />
        </div>
      )}

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-bold">
          Your name <span className="font-normal text-base-400">(optional, so they know it's you)</span>
        </span>
        <input
          type="text"
          autoComplete="given-name"
          maxLength={MAX_NAME}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </label>
    </Sheet>
  )
}

/** Paper plane: sending a challenge. */
export function ChallengeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden>
      <path d="M3.1 2.29a.75.75 0 0 0-.98.95L4.28 9.25H11a.75.75 0 0 1 0 1.5H4.28l-2.16 6.01a.75.75 0 0 0 .98.95l15-7a.75.75 0 0 0 0-1.36l-15-7.06Z" />
    </svg>
  )
}
