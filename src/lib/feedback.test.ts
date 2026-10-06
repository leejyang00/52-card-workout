import { describe, expect, it } from 'vitest'
import {
  buildPayload,
  canSend,
  EMPTY_DRAFT,
  LIMITS,
} from './feedback'

const locale = { timeZone: 'Europe/Berlin', language: 'de-DE' }

describe('canSend', () => {
  it('needs a rating or a comment', () => {
    expect(canSend(EMPTY_DRAFT)).toBe(false)
    expect(canSend({ ...EMPTY_DRAFT, comment: '   ' })).toBe(false)
    expect(canSend({ ...EMPTY_DRAFT, name: 'Sam', email: 'sam@example.com' })).toBe(false)
    expect(canSend({ ...EMPTY_DRAFT, rating: 4 })).toBe(true)
    expect(canSend({ ...EMPTY_DRAFT, comment: 'Add box jumps' })).toBe(true)
  })
})

describe('buildPayload', () => {
  it('stays anonymous when name and email are left blank', () => {
    const p = buildPayload({ ...EMPTY_DRAFT, rating: 5 }, 'setup', null, locale)
    expect(p).toMatchObject({ rating: 5, name: '', email: '', source: 'setup', timeZone: 'Europe/Berlin', workout: null })
  })

  it('trims, caps lengths and drops an out-of-range rating', () => {
    const p = buildPayload(
      { ...EMPTY_DRAFT, rating: 0, comment: `  ${'x'.repeat(5000)}  `, name: '  Sam  ' },
      'summary',
      null,
      locale,
    )
    expect(p.rating).toBeNull()
    expect(p.comment).toHaveLength(LIMITS.comment)
    expect(p.name).toBe('Sam')
  })
})
