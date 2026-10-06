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

export type MovePool = 'bodyweight' | 'all'

/** Five different preset moves for the four suits plus the ace, for people who'd rather not choose. */
export function randomMoves(pool: MovePool, rng: () => number = Math.random): Pick<Settings, 'moves' | 'aceMove'> {
  const groups = pool === 'bodyweight' ? EXERCISE_GROUPS.filter((g) => g.label === 'Bodyweight') : EXERCISE_GROUPS
  const [hearts, spades, clubs, diamonds, aceMove] = shuffle(
    groups.flatMap((g) => g.exercises.map((e) => e.name)),
    rng,
  )
  return { moves: { hearts, spades, clubs, diamonds }, aceMove }
}
