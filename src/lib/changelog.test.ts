import { describe, expect, it } from 'vitest'
import { formatReleaseDate, LATEST_RELEASE_ID, RELEASES, releaseId, unseenCount, type Release } from './changelog'

const releases: Release[] = [
  { date: '2026-10-08', title: 'C', changes: ['c'] },
  { date: '2026-10-07', title: 'B', changes: ['b'] },
  { date: '2026-10-06', title: 'A', changes: ['a'] },
]

describe('unseenCount', () => {
  it('counts releases newer than the last one seen', () => {
    expect(unseenCount(releaseId(releases[0]), releases)).toBe(0)
    expect(unseenCount(releaseId(releases[1]), releases)).toBe(1)
    expect(unseenCount(releaseId(releases[2]), releases)).toBe(2)
  })

  it('treats a never-seen or removed release as everything unseen', () => {
    expect(unseenCount(null, releases)).toBe(3)
    expect(unseenCount('2025-01-01:Gone', releases)).toBe(3)
  })
})

describe('RELEASES', () => {
  it('is newest first with unique ids', () => {
    const dates = RELEASES.map((r) => r.date)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(new Set(RELEASES.map(releaseId)).size).toBe(RELEASES.length)
    expect(LATEST_RELEASE_ID).toBe(releaseId(RELEASES[0]))
  })

  it('has a valid date and at least one change per release', () => {
    for (const r of RELEASES) {
      expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(r.changes.length).toBeGreaterThan(0)
    }
  })
})

describe('formatReleaseDate', () => {
  it('formats as day, short month, year', () => {
    expect(formatReleaseDate('2026-10-08')).toBe('8 Oct 2026')
  })
})
