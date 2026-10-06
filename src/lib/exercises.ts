import { shuffle } from './deck'
import type { Settings } from './types'

export interface Exercise {
  name: string
  /** Short coaching cue shown under the move. */
  note?: string
}

export interface ExerciseGroup {
  label: string
  exercises: Exercise[]
}

export const EXERCISE_GROUPS: ExerciseGroup[] = [
  {
    label: 'Bodyweight',
    exercises: [
      { name: 'Push-ups' },
      { name: 'Burpees' },
      { name: 'Sit-ups' },
      { name: 'Crunches' },
      { name: 'Air squats' },
      { name: 'Jump squats' },
      { name: 'Lunges', note: 'Split evenly between legs' },
      { name: 'Pike push-ups' },
      { name: 'Mountain climbers', note: 'Each leg counts as one' },
      { name: 'Jumping jacks' },
      { name: 'Leg raises' },
      { name: 'Glute bridges' },
    ],
  },
  {
    label: 'Bar & dips',
    exercises: [
      { name: 'Pull-ups' },
      { name: 'Chin-ups' },
      { name: 'Dips' },
      { name: 'Inverted rows' },
    ],
  },
  {
    label: 'Dumbbell / kettlebell',
    exercises: [
      { name: 'Clean & Press', note: 'Squat-to-press' },
      { name: 'Thrusters' },
      { name: 'Goblet squats' },
      { name: 'Kettlebell swings' },
      { name: 'Dumbbell snatches', note: 'Alternate arms' },
      { name: 'Renegade rows' },
      { name: 'Bent-over rows' },
      { name: 'Romanian deadlifts' },
      { name: 'Overhead press' },
    ],
  },
]

const BY_NAME = new Map(EXERCISE_GROUPS.flatMap((g) => g.exercises).map((e) => [e.name, e]))

export function isPresetExercise(name: string): boolean {
  return BY_NAME.has(name)
}

export function exerciseNote(name: string): string | undefined {
  return BY_NAME.get(name)?.note
}

export type MovePool = 'bodyweight' | 'mix' | 'gear'

const names = (groups: ExerciseGroup[]) => groups.flatMap((g) => g.exercises.map((e) => e.name))
const BODYWEIGHT = names(EXERCISE_GROUPS.filter((g) => g.label === 'Bodyweight'))
const GEAR = names(EXERCISE_GROUPS.filter((g) => g.label !== 'Bodyweight'))

/** Five different preset moves for the four suits plus the ace, for people who'd rather not choose. */
export function randomMoves(pool: MovePool, rng: () => number = Math.random): Pick<Settings, 'moves' | 'aceMove'> {
  let picks: string[]
  if (pool === 'mix') {
    // At least two of each kind, so a mix never comes out all-bodyweight or all-gear.
    const [bodyweight, gear] = [shuffle(BODYWEIGHT, rng), shuffle(GEAR, rng)]
    const fifth = shuffle([...bodyweight.slice(2), ...gear.slice(2)], rng)[0]
    picks = shuffle([...bodyweight.slice(0, 2), ...gear.slice(0, 2), fifth], rng)
  } else {
    picks = shuffle(pool === 'gear' ? GEAR : BODYWEIGHT, rng)
  }
  const [hearts, spades, clubs, diamonds, aceMove] = picks
  return { moves: { hearts, spades, clubs, diamonds }, aceMove }
}

/** Reads a stored pool, mapping the old two-way "Any gear" ('all') onto Mix. */
export function toMovePool(value: unknown): MovePool {
  return value === 'mix' || value === 'gear' || value === 'bodyweight' ? value : value === 'all' ? 'mix' : 'bodyweight'
}
