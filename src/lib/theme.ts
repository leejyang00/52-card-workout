import { useEffect, useState } from 'react'

/**
 * Light/dark mode. Everyone starts in light; switching to dark is remembered per device. The inline
 * script in index.html applies the saved mode before first paint. Keep the two in sync.
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'burno:theme'
const BACKGROUND: Record<Theme, string> = { light: '#fff3ea', dark: '#170e0b' }

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', BACKGROUND[theme])
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))

  useEffect(() => apply(theme), [theme])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private mode: the switch still works for this visit.
    }
    setTheme(next)
  }

  return { theme, toggle }
}
