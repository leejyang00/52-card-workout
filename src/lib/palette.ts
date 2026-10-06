/**
 * Colour palettes. The colours themselves live in src/index.css as `--color-*` variables; a palette
 * is picked by setting `data-palette` on <html>. The inline script in index.html applies it before
 * first paint: `?palette=<name>` sets it (and remembers it), `?palette=default` clears it.
 */
export const PALETTES = ['volt', 'afterburn', 'electric', 'sky', 'sunrise', 'berry', 'mint'] as const
export type Palette = (typeof PALETTES)[number]

/** Read a palette colour as the page currently resolves it, e.g. `cssColor('accent')`. */
export function cssColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim()
}

/** Match the browser chrome (iOS status bar, Android toolbar) to the page background. */
export function syncThemeColor() {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  const bg = cssColor('base-950')
  if (meta && bg) meta.content = bg
}
