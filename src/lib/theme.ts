import { useEffect, useState } from 'react'

/**
 * Light/dark mode. The inline script in index.html applies the same rules before first paint:
 * a saved choice wins, otherwise follow the system setting. Keep the two in sync.
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'burno:theme'
const BACKGROUND: Record<Theme, string> = { light: '#fff3ea', dark: '#170e0b' }
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function saved(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', BACKGROUND[theme])
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))

  useEffect(() => apply(theme), [theme])

  // Until someone picks a mode, keep following the system setting as it changes.
  useEffect(() => {
    const query = darkQuery()
    const onChange = () => {
      if (!saved()) setTheme(query.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

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
