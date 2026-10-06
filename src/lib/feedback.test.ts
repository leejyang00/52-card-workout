import { describe, expect, it } from 'vitest'
import {
  buildPayload,
  canSend,
  EMPTY_DRAFT,
  INITIAL_PROMPT_STATE,
  LIMITS,
  recordFinish,
  shouldPrompt,
  snooze,
  SNOOZE_AFTER_DISMISS,
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

describe('rating prompt', () => {
  const now = 1_700_000_000_000

  it('waits for the second finished workout', () => {
    const once = recordFinish(INITIAL_PROMPT_STATE, 1)
    expect(shouldPrompt(once, now)).toBe(false)
    expect(shouldPrompt(recordFinish(once, 2), now)).toBe(true)
  })

  it('counts each workout once, even if the summary remounts', () => {
    const once = recordFinish(INITIAL_PROMPT_STATE, 1)
    expect(recordFinish(once, 1)).toBe(once)
  })

  it('stays quiet while snoozed', () => {
    const ready = recordFinish(recordFinish(INITIAL_PROMPT_STATE, 1), 2)
    const snoozed = snooze(ready, now, SNOOZE_AFTER_DISMISS)
    expect(shouldPrompt(snoozed, now + 1000)).toBe(false)
    expect(shouldPrompt(snoozed, now + SNOOZE_AFTER_DISMISS)).toBe(true)
  })
})
