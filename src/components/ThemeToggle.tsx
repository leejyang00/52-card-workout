import { useTheme } from '../lib/theme'

/** Sun/moon button that flips between light and dark mode. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`grid size-10 place-items-center rounded-full bg-base-800 text-base-200 transition-colors hover:bg-base-700 focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5" aria-hidden>
          <circle cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
          <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.6.6 0 0 0-.8-.7 9.5 9.5 0 1 0 12.6 12.6.6.6 0 0 0-.7-.8Z" />
        </svg>
      )}
    </button>
  )
}
