import type { Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  moves: {
    hearts: 'Push-ups',
    spades: 'Clean & Press',
    clubs: 'Burpees',
    diamonds: 'Sit-ups',
  },
  aceMove: 'Lunges',
  deckSize: 'full',
  jokers: false,
  capFaceCards: false,
  showRepTotals: false,
  timerMode: 'up',
  timerMinutes: 45,
}

export const TIMER_PRESETS = [30, 45, 60]
