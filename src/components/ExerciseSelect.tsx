import { useId, useState } from 'react'
import { EXERCISE_GROUPS, isPresetExercise } from '../lib/exercises'

const CUSTOM = '__custom__'

interface Props {
  value: string
  onChange: (name: string) => void
  /** Accessible name, e.g. "Hearts exercise". */
  label: string
}

/** Native select (best on phones) with a "Custom…" escape hatch for any move. */
export function ExerciseSelect({ value, onChange, label }: Props) {
  const inputId = useId()
  const [custom, setCustom] = useState(() => !isPresetExercise(value))

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="relative">
        <select
          aria-label={label}
          value={custom ? CUSTOM : value}
          onChange={(e) => {
            if (e.target.value === CUSTOM) {
              setCustom(true)
              onChange('')
            } else {
              setCustom(false)
              onChange(e.target.value)
            }
          }}
          className="h-11 w-full appearance-none truncate rounded-xl bg-stone-800 pr-10 pl-3 text-base font-semibold text-stone-100 ring-1 ring-stone-700 focus:ring-2 focus:ring-accent focus:outline-none"
        >
          {EXERCISE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.exercises.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={CUSTOM}>Custom…</option>
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-stone-400"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
        </svg>
      </div>
      {custom && (
        <>
          <label htmlFor={inputId} className="sr-only">
            Custom {label.toLowerCase()}
          </label>
          <input
            id={inputId}
            autoFocus
            value={value}
            maxLength={40}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Box jumps"
            className="h-11 w-full rounded-xl bg-stone-900 px-3 text-base text-stone-100 ring-1 ring-stone-700 placeholder:text-stone-500 focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </>
      )}
    </div>
  )
}
