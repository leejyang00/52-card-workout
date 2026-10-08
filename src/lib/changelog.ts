export interface Release {
  /** YYYY-MM-DD */
  date: string
  title: string
  changes: string[]
}

/**
 * What's new, newest first. Add an entry at the top whenever you ship something people would
 * notice: anyone who hasn't opened the sheet since gets a dot on the What's new button.
 */
export const RELEASES: Release[] = [
  {
    date: '2026-10-08',
    title: 'Real number cards',
    changes: ['Number cards now show the right count of suits, like a real deck: the 5 of hearts has five hearts.'],
  },
  {
    date: '2026-10-08',
    title: 'Keep the surprise',
    changes: [
      "During a workout you now see the reps you've done, not how many are left.",
      'Want the full count back? Turn on Show rep totals in setup.',
    ],
  },
  {
    date: '2026-10-08',
    title: 'Jokers with a timer',
    changes: [
      'A joker now asks you to pick: a 60-second rest or 30 seconds all out, with a countdown either way.',
      'The all-out move is picked for you, matched to your workout: no-gear, gear or a mix.',
    ],
  },
  {
    date: '2026-10-08',
    title: 'Picture cards',
    changes: [
      'Jacks, queens and kings now show a court figure, so face cards stand out mid-workout.',
      'Jokers get a jester.',
      "This What's new list, so you can see what's changed.",
    ],
  },
  {
    date: '2026-10-07',
    title: 'Smoother screens',
    changes: ['Every screen now opens scrolled to the top.'],
  },
  {
    date: '2026-10-06',
    title: 'Burno is here',
    changes: [
      'Shuffle moves: a random workout in one tap, from no-gear, gear or a mix.',
      'Share card: save your workout as an image, straight to Photos on iPhone.',
      'Rate your workout and send feedback from the summary or setup screen.',
      'New name, new look: Burno, with a light theme by default.',
    ],
  },
]

/** Identifies a release for "seen" tracking. Changes if you edit its date or title. */
export function releaseId(release: Release): string {
  return `${release.date}:${release.title}`
}

export const LATEST_RELEASE_ID = RELEASES[0] ? releaseId(RELEASES[0]) : null

/** Releases newer than the last one the visitor saw. Everything if they've never looked. */
export function unseenCount(lastSeenId: string | null, releases: Release[] = RELEASES): number {
  const i = releases.findIndex((r) => releaseId(r) === lastSeenId)
  return i === -1 ? releases.length : i
}

/** "2026-10-08" → "8 Oct 2026", independent of the visitor's time zone. */
export function formatReleaseDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
