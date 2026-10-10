import { describe, expect, it } from 'vitest'
import { formatSplit } from './format'

describe('formatSplit', () => {
  it('uses seconds under a minute', () => {
    expect(formatSplit(0)).toBe('0s')
    expect(formatSplit(8_400)).toBe('8s')
  })

  it('uses minutes and seconds from a minute up', () => {
    expect(formatSplit(59_600)).toBe('1m')
    expect(formatSplit(75_000)).toBe('1m 15s')
    expect(formatSplit(90_000)).toBe('1m 30s')
    expect(formatSplit(120_000)).toBe('2m')
  })
})
