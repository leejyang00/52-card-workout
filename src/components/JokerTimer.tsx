import { useEffect, useRef, useState } from 'react'
import { JOKER_MOVE_SECONDS, JOKER_REST_SECONDS } from '../lib/deck'
import { formatDuration } from '../lib/format'
import { elapsedMs, type Clock } from '../hooks/useSession'
import { useNow } from '../hooks/useNow'
import { Button } from './Button'

type Choice = 'rest' | 'move'

interface Props {
  /** The hard move this joker calls. */
  move: string
  /** Whether the workout clock is running; the countdown pauses with it. */
  running: boolean
  onResume: () => void
}

/** Lets a joker be spent as a timed rest or a timed burst of a hard move, with a visible countdown. */
export function JokerTimer({ move, running, onResume }: Props) {
  const [pick, setPick] = useState<{ choice: Choice; clock: Clock } | null>(null)
  const audio = useRef<AudioContext | null>(null)
  useEffect(() => () => void audio.current?.close(), [])

  // Pause and resume with the workout clock.
  useEffect(() => {
    setPick((p) => {
      if (!p) return p
      const { clock } = p
      if (running && clock.runningSince == null) return { ...p, clock: { ...clock, runningSince: Date.now() } }
      if (!running && clock.runningSince != null) return { ...p, clock: { accumulatedMs: elapsedMs(clock, Date.now()), runningSince: null } }
      return p
    })
  }, [running])

  const ticking = pick?.clock.runningSince != null
  const now = useNow(ticking, 100)
  const total = (pick?.choice === 'move' ? JOKER_MOVE_SECONDS : JOKER_REST_SECONDS) * 1000
  const left = pick ? Math.max(0, total - elapsedMs(pick.clock, now)) : total
  const finished = pick != null && left === 0

  useEffect(() => {
    if (!finished) return
    navigator.vibrate?.([200, 100, 200])
    beep(audio.current)
  }, [finished])

  const start = (choice: Choice) => {
    // Created on the tap so iOS lets it play the end beep later.
    audio.current ??= typeof AudioContext === 'undefined' ? null : new AudioContext()
    onResume()
    setPick({ choice, clock: { accumulatedMs: 0, runningSince: Date.now() } })
  }

  if (!pick) {
    return (
      <>
        <p className="text-4xl font-black sm:text-5xl">Joker: your call</p>
        <div className="mx-auto mt-4 grid max-w-md grid-cols-2 gap-2">
          <Button size="lg" className="h-auto flex-col py-3" onClick={() => start('rest')}>
            <span>Rest</span>
            <span className="tabular text-sm font-medium text-base-400">{JOKER_REST_SECONDS} sec</span>
          </Button>
          <Button variant="primary" size="lg" className="h-auto flex-col py-3" onClick={() => start('move')}>
            <span className="break-words">{move}</span>
            <span className="tabular text-sm font-medium opacity-80">{JOKER_MOVE_SECONDS} sec all out</span>
          </Button>
        </div>
      </>
    )
  }

  const label = pick.choice === 'rest' ? 'Rest' : move
  return (
    <>
      <p className="text-2xl font-bold">{finished ? `${label}: done` : label}</p>
      <p role="timer" aria-live="off" className={`tabular mt-1 text-6xl font-black sm:text-7xl ${ticking ? '' : 'opacity-60'}`}>
        {formatDuration(Math.ceil(left / 1000) * 1000)}
      </p>
      <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-base-800">
        <div className="h-full rounded-full bg-pop" style={{ width: `${(left / total) * 100}%` }} />
      </div>
      <p className="mt-3 text-base-400">
        {finished
          ? 'Flip the next card when you’re ready.'
          : !ticking
            ? 'Paused'
            : pick.choice === 'move'
              ? 'As many as you can. Keep moving.'
              : 'Breathe. Next card when the clock hits zero.'}
      </p>
      {!finished && (
        <button
          type="button"
          onClick={() => setPick(null)}
          className="mt-2 text-sm font-semibold text-base-400 underline-offset-4 hover:text-base-100 hover:underline"
        >
          Change pick
        </button>
      )}
    </>
  )
}

function beep(ctx: AudioContext | null) {
  if (!ctx) return
  void ctx.resume()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.6)
}
