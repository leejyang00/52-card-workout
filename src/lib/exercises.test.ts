import { describe, expect, it } from 'vitest'
import { EXERCISE_GROUPS, isPresetExercise, randomMoves } from './exercises'

describe('randomMoves', () => {
  it('fills every suit and the ace with five different preset moves', () => {
    for (let i = 0; i < 50; i++) {
      const { moves, aceMove } = randomMoves('all')
      const picked = [...Object.values(moves), aceMove]
      expect(picked.every(isPresetExercise)).toBe(true)
      expect(new Set(picked).size).toBe(5)
    }
  })

  it('sticks to bodyweight moves when asked', () => {
    const bodyweight = new Set(EXERCISE_GROUPS.find((g) => g.label === 'Bodyweight')!.exercises.map((e) => e.name))
    for (let i = 0; i < 50; i++) {
      const { moves, aceMove } = randomMoves('bodyweight')
      expect([...Object.values(moves), aceMove].every((name) => bodyweight.has(name))).toBe(true)
    }
  })
})
