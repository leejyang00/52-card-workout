interface Option<T extends string | number> {
  value: T
  label: string
}

interface Props<T extends string | number> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** A row of mutually exclusive pills (radio group semantics). */
export function Segmented<T extends string | number>({ label, options, value, onChange }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-base-900 p-1 ring-1 ring-base-800">
      {options.map((o) => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={`h-10 flex-1 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              selected ? 'bg-select text-on-select' : 'text-base-400 hover:text-base-100'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
