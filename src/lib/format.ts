/** 75_000 → "1:15", 3_725_000 → "1:02:05". */
export function formatDuration(ms: number): string {
  const total = Math.floor(Math.max(0, ms) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** Short span for pace stats: 8_400 → "8s", 75_000 → "1:15". */
export function formatSplit(ms: number): string {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : formatDuration(ms)
}

/** Time per rep to a tenth: 2_140 → "2.1s". */
export function formatPerRep(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}
