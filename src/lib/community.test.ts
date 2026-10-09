import { describe, expect, it } from 'vitest'
import { countsAsWorkout, formatCount, formatReps, parseTotals } from './community'

describe('parseTotals', () => {
  it('reads the totals from a good reply', () => {
    expect(parseTotals({ ok: true, service: 'burno-feedback', workouts: 12, reps: 3400 })).toEqual({
      workouts: 12,
      reps: 3400,
    })
  })

  it('rejects errors and odd shapes', () => {
    expect(parseTotals(null)).toBeNull()
    expect(parseTotals('nope')).toBeNull()
    expect(parseTotals({ ok: false, error: 'out of range' })).toBeNull()
    expect(parseTotals({ ok: true, service: 'burno-feedback' })).toBeNull()
    expect(parseTotals({ ok: true, workouts: '12', reps: 3400 })).toBeNull()
    expect(parseTotals({ ok: true, workouts: -1, reps: 0 })).toBeNull()
  })
})

describe('countsAsWorkout', () => {
  it('needs at least one card, not a cleared deck', () => {
    expect(countsAsWorkout(0)).toBe(false)
    expect(countsAsWorkout(1)).toBe(true)
    expect(countsAsWorkout(20)).toBe(true)
  })
})

describe('formatting', () => {
  it('adds thousands separators', () => {
    expect(formatCount(1284)).toBe('1,284')
    expect(formatCount(7)).toBe('7')
  })

  it('shortens big rep totals', () => {
    expect(formatReps(84_210)).toBe('84,210')
    expect(formatReps(3_140_000)).toBe('3.1M')
    expect(formatReps(250_000)).toBe('250K')
  })
})
