import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { formatReleaseDate, LATEST_RELEASE_ID, RELEASES, releaseId, unseenCount } from '../lib/changelog'
import { Button } from './Button'
import { Sheet } from './Sheet'

interface Props {
  /** First-time visitors start caught up, so the dot only means "changed since you were here". */
  firstVisit: boolean
  className?: string
}

/** Gift button that opens the changelog, with a dot while there's a release the visitor hasn't seen. */
export function WhatsNew({ firstVisit, className = '' }: Props) {
  const [lastSeen, setLastSeen] = useLocalStorage<string | null>(
    'cw:whats-new-seen:v1',
    firstVisit ? LATEST_RELEASE_ID : null,
  )
  const [open, setOpen] = useState(false)
  // Snapshot on open so the "New" tags stay put while the sheet is up.
  const [newCount, setNewCount] = useState(0)
  const unseen = unseenCount(lastSeen)

  const show = () => {
    setNewCount(unseen)
    setLastSeen(LATEST_RELEASE_ID)
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={unseen > 0 ? "What's new (updates you haven't seen)" : "What's new"}
        title="What's new"
        className={`grid size-10 place-items-center rounded-full bg-base-800 text-base-200 transition-colors hover:bg-base-700 focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
          <rect x="3.5" y="8" width="17" height="4" rx="1" />
          <path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12M12 8v12.5M12 8c-1.5-3.5-5.5-4-5.5-1.5S10 8 12 8Zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 8 12 8Z" />
        </svg>
        {unseen > 0 && (
          <span aria-hidden className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-suit-red ring-2 ring-base-950 motion-safe:animate-pulse" />
        )}
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="What's new"
        footer={
          <Button variant="primary" size="lg" className="w-full" onClick={() => setOpen(false)}>
            Got it
          </Button>
        }
      >
        <ol className="flex flex-col gap-5 text-left">
          {RELEASES.map((release, i) => (
            <li key={releaseId(release)} className="border-l-2 border-base-800 pl-4 first:border-accent">
              <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-base-400 uppercase">
                <time dateTime={release.date}>{formatReleaseDate(release.date)}</time>
                {i < newCount && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-on-accent">New</span>
                )}
              </p>
              <h3 className="mt-1 font-bold">{release.title}</h3>
              <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-base-300 marker:text-accent">
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Sheet>
    </>
  )
}
