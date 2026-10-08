import { describe, expect, it } from 'vitest'
import { EXERCISE_GROUPS, isPresetExercise, jokerMoves, pickJokerMove, randomMoves, toMovePool, type MovePool } from './exercises'

const bodyweight = new Set(EXERCISE_GROUPS.find((g) => g.label === 'Bodyweight')!.exercises.map((e) => e.name))
const draw = (pool: MovePool) => {
  const { moves, aceMove } = randomMoves(pool)
  return [...Object.values(moves), aceMove]
}

describe('randomMoves', () => {
  it.each<MovePool>(['bodyweight', 'mix', 'gear'])('fills every suit and the ace with five different preset moves (%s)', (pool) => {
    for (let i = 0; i < 50; i++) {
      const picked = draw(pool)
      expect(picked.every(isPresetExercise)).toBe(true)
      expect(new Set(picked).size).toBe(5)
    }
  })

  it('sticks to bodyweight moves when asked', () => {
    for (let i = 0; i < 50; i++) expect(draw('bodyweight').every((name) => bodyweight.has(name))).toBe(true)
  })

  it('sticks to gear moves when asked', () => {
    for (let i = 0; i < 50; i++) expect(draw('gear').some((name) => bodyweight.has(name))).toBe(false)
  })

  it('always mixes at least two bodyweight and two gear moves', () => {
    for (let i = 0; i < 200; i++) {
      const count = draw('mix').filter((name) => bodyweight.has(name)).length
      expect(count).toBeGreaterThanOrEqual(2)
      expect(count).toBeLessThanOrEqual(3)
    }
  })
})

describe('toMovePool', () => {
  it('maps the old "Any gear" setting onto Mix and falls back to bodyweight', () => {
    expect(toMovePool('all')).toBe('mix')
    expect(toMovePool('gear')).toBe('gear')
    expect(toMovePool(undefined)).toBe('bodyweight')
  })
})

describe('jokerMoves', () => {
  const hard = new Set(EXERCISE_GROUPS.flatMap((g) => g.exercises).filter((e) => e.hard).map((e) => e.name))
  const settings = (names: string[]) => ({
    moves: { hearts: names[0], spades: names[1], clubs: names[2], diamonds: names[3] },
    aceMove: names[4],
  })

  it('stays bodyweight when no move needs gear', () => {
    const picks = jokerMoves(settings(['Push-ups', 'Sit-ups', 'Lunges', 'Crunches', 'Bear crawls']))
    expect(picks.length).toBeGreaterThan(0)
    expect(picks.every((name) => bodyweight.has(name) && hard.has(name))).toBe(true)
  })

  it('stays gear-only when every move uses gear, and only the kinds of gear in use', () => {
    const picks = jokerMoves(settings(['Thrusters', 'Goblet squats', 'Renegade rows', 'Overhead press', 'Bent-over rows']))
    expect(picks.length).toBeGreaterThan(0)
    expect(picks.some((name) => bodyweight.has(name))).toBe(false)
    expect(picks).not.toContain('Pull-ups')
  })

  it('mixes both for a mixed workout', () => {
    const picks = jokerMoves(settings(['Push-ups', 'Clean & Press', 'Burpees', 'Sit-ups', 'Lunges']))
    expect(picks.some((name) => bodyweight.has(name))).toBe(true)
    expect(picks).toContain('Thrusters')
  })

  it('picks one of them', () => {
    const s = settings(['Pull-ups', 'Dips', 'Chin-ups', 'Inverted rows', 'Pull-ups'])
    for (let i = 0; i < 20; i++) expect(['Pull-ups', 'Dips']).toContain(pickJokerMove(s))
  })
})
