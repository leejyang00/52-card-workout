import { shuffle } from './deck'
import type { Settings } from './types'

export interface Exercise {
  name: string
  /** Short coaching cue shown under the move. */
  note?: string
  /** Tough enough for a joker's 30-second all-out burst. */
  hard?: boolean
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
      { name: 'Burpees', hard: true },
      { name: 'Sit-ups' },
      { name: 'Crunches' },
      { name: 'Air squats' },
      { name: 'Jump squats', hard: true },
      { name: 'Lunges', note: 'Split evenly between legs' },
      { name: 'Pike push-ups', hard: true },
      { name: 'Mountain climbers', note: 'Each leg counts as one', hard: true },
      { name: 'Jumping jacks' },
      { name: 'Leg raises' },
      { name: 'Glute bridges' },
    ],
  },
  {
    label: 'Bar & dips',
    exercises: [
      { name: 'Pull-ups', hard: true },
      { name: 'Chin-ups' },
      { name: 'Dips', hard: true },
      { name: 'Inverted rows' },
    ],
  },
  {
    label: 'Dumbbell / kettlebell',
    exercises: [
      { name: 'Clean & Press', note: 'Squat-to-press', hard: true },
      { name: 'Thrusters', hard: true },
      { name: 'Goblet squats' },
      { name: 'Kettlebell swings', hard: true },
      { name: 'Dumbbell snatches', note: 'Alternate arms', hard: true },
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

const GROUP_OF = new Map(EXERCISE_GROUPS.flatMap((g) => g.exercises.map((e) => [e.name, g.label])))

/**
 * Hard moves a joker can call, matched to the gear the workout already uses: bodyweight only when
 * nothing needs gear, only gear when every move does, both for a mix. Custom moves count as bodyweight.
 */
export function jokerMoves({ moves, aceMove }: Pick<Settings, 'moves' | 'aceMove'>): string[] {
  const groups = new Set([...Object.values(moves), aceMove].map((name) => GROUP_OF.get(name) ?? 'Bodyweight'))
  const gearOnly = !groups.has('Bodyweight')
  return EXERCISE_GROUPS.filter((g) => groups.has(g.label) || (g.label === 'Bodyweight' && !gearOnly))
    .flatMap((g) => g.exercises)
    .filter((e) => e.hard)
    .map((e) => e.name)
}

export function pickJokerMove(settings: Pick<Settings, 'moves' | 'aceMove'>, rng: () => number = Math.random): string {
  const options = jokerMoves(settings)
  return options[Math.floor(rng() * options.length)]
}
