import { formatDuration } from '../lib/format'
import type { Settings } from '../lib/types'

interface Props {
  elapsed: number
  started: boolean
  running: boolean
  settings: Settings
  onToggle: () => void
}

export function TimerBar({ elapsed, started, running, settings, onToggle }: Props) {
  const countdown = settings.timerMode === 'down'
  const limit = settings.timerMinutes * 60_000
  const overtime = countdown && elapsed >= limit
  const display = countdown ? (overtime ? `+${formatDuration(elapsed - limit)}` : formatDuration(limit - elapsed)) : formatDuration(elapsed)
  const caption = countdown ? (overtime ? "Time's up, keep going" : `of ${settings.timerMinutes}:00`) : 'Elapsed'

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p
          role="timer"
          aria-live="off"
          className={`tabular text-4xl leading-none font-black sm:text-5xl ${overtime ? 'text-suit-red' : ''} ${running ? '' : 'opacity-60'}`}
        >
          {display}
        </p>
        <p className="mt-1 text-xs font-semibold tracking-wider text-base-400 uppercase">
          {running ? caption : started ? 'Paused' : 'Starts on first flip'}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={!started}
        aria-label={running ? 'Pause timer' : 'Resume timer'}
        className="grid size-12 shrink-0 place-items-center rounded-full bg-base-800 text-base-100 transition-colors hover:bg-base-700 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-accent"
      >
        {running ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
          </svg>
        )}
      </button>
    </div>
  )
}
