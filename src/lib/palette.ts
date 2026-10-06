/** Read a palette colour from src/index.css as the page resolves it, e.g. `cssColor('accent')`. */
export function cssColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim()
}
