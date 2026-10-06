import { BRAND } from './brand'
import type { MoveTotal } from './deck'
import { formatDuration } from './format'
import { FLAME_INNER, FLAME_OUTER, MARK_HEIGHT, MARK_WIDTH } from './logo'
import { cssColor } from './palette'

export interface ShareStats {
  cleared: boolean
  timeMs: number
  flipped: number
  deckLength: number
  reps: number
  totals: MoveTotal[]
  date: Date
  url: string
}

// Story format: Instagram/WhatsApp status.
export const SHARE_WIDTH = 1080
export const SHARE_HEIGHT = 1920

/** The active palette's colours, so the image matches what's on screen. */
function colors() {
  return {
    bg: cssColor('base-950'),
    panel: cssColor('base-900'),
    track: cssColor('base-800'),
    text: cssColor('base-100'),
    muted: cssColor('base-400'),
    red: cssColor('suit-red'),
    accent: cssColor('accent'),
    onAccent: cssColor('on-accent'),
    stripe: cssColor('cardback'),
    stripe2: cssColor('cardback-2'),
    flame: cssColor('flame'),
    flame2: cssColor('flame-2'),
    flameCore: cssColor('flame-core'),
  }
}
const FONT = 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif'
const DISPLAY_FONT = `"Archivo Variable", ${FONT}`

type Ctx = CanvasRenderingContext2D

/** The logo card at (x, y), `scale` times its 80×100 size. */
function drawMark(ctx: Ctx, x: number, y: number, scale: number, tip: string, base: string, core: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgb(0 0 0 / 0.14)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 4
  ctx.beginPath()
  ctx.roundRect(3, 3, MARK_WIDTH - 6, MARK_HEIGHT - 6, 12)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  const grad = ctx.createLinearGradient(0, 87, 0, 12)
  grad.addColorStop(0, base)
  grad.addColorStop(1, tip)
  ctx.fillStyle = grad
  ctx.fill(new Path2D(FLAME_OUTER))
  ctx.fillStyle = core
  ctx.fill(new Path2D(FLAME_INNER))
  ctx.restore()
}

function font(ctx: Ctx, weight: number, size: number, tracking = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`
}

function fitText(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t}…`
}

function panel(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

export function drawShareCard(ctx: Ctx, s: ShareStats) {
  const W = SHARE_WIDTH
  const PAD = 90
  const inner = W - PAD * 2
  const C = colors()

  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, SHARE_HEIGHT)

  // Card-back stripe band along the top.
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, W, 28)
  ctx.clip()
  for (let x = -40; x < W + 40; x += 24) {
    ctx.fillStyle = (x / 24) % 2 === 0 ? C.stripe : C.stripe2
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + 12, 0)
    ctx.lineTo(x + 40, 28)
    ctx.lineTo(x + 28, 28)
    ctx.fill()
  }
  ctx.restore()

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // Brand + date
  drawMark(ctx, PAD, 110, 1.3, C.flame, C.flame2, C.flameCore)
  ctx.font = `900 112px ${DISPLAY_FONT}`
  if ('fontStretch' in ctx) ctx.fontStretch = 'expanded'
  if ('letterSpacing' in ctx) ctx.letterSpacing = '-2px'
  ctx.fillStyle = C.text
  ctx.fillText(BRAND.name.toUpperCase(), PAD + 136, 232)
  if ('fontStretch' in ctx) ctx.fontStretch = 'normal'
  font(ctx, 500, 36)
  ctx.fillStyle = C.muted
  ctx.fillText(
    s.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    PAD,
    316,
  )

  // Headline
  font(ctx, 900, 150, -4)
  ctx.fillStyle = C.text
  ctx.fillText(s.cleared ? 'DECK' : `${s.flipped} CARDS`, PAD, 520)
  ctx.fillStyle = C.accent
  ctx.fillText(s.cleared ? 'CLEARED' : 'DOWN', PAD, 660)

  // Stat tiles
  const stats: [string, string][] = [
    ['TIME', formatDuration(s.timeMs)],
    ['CARDS', `${s.flipped}/${s.deckLength}`],
    ['REPS', String(s.reps)],
  ]
  const gap = 24
  const tileW = (inner - gap * 2) / 3
  stats.forEach(([label, value], i) => {
    const tx = PAD + i * (tileW + gap)
    panel(ctx, tx, 740, tileW, 200, 32, C.panel)
    ctx.textAlign = 'center'
    font(ctx, 700, 28, 4)
    ctx.fillStyle = C.muted
    ctx.fillText(label, tx + tileW / 2, 805)
    font(ctx, 900, 72, -2)
    ctx.fillStyle = C.text
    ctx.fillText(fitText(ctx, value, tileW - 32), tx + tileW / 2, 895)
  })
  ctx.textAlign = 'left'

  // Breakdown
  // 4 suits + ace = at most 5 distinct moves.
  const rows = s.totals.slice(0, 5)
  const rowH = 104
  const listTop = 990
  panel(ctx, PAD, listTop, inner, 100 + rows.length * rowH, 40, C.panel)
  font(ctx, 700, 28, 4)
  ctx.fillStyle = C.muted
  ctx.fillText('BREAKDOWN', PAD + 48, listTop + 76)

  rows.forEach((t, i) => {
    const y = listTop + 150 + i * rowH
    const left = PAD + 48
    const right = PAD + inner - 48
    font(ctx, 900, 52, -1)
    ctx.fillStyle = C.text
    ctx.textAlign = 'right'
    ctx.fillText(String(t.done), right, y)
    const repsW = ctx.measureText(String(t.done)).width
    ctx.textAlign = 'left'
    font(ctx, 600, 44)
    ctx.fillText(fitText(ctx, t.move, right - left - repsW - 32), left, y)

    const barW = right - left
    panel(ctx, left, y + 24, barW, 12, 6, C.track)
    const pct = t.total ? t.done / t.total : 0
    if (pct > 0) panel(ctx, left, y + 24, Math.max(12, barW * pct), 12, 6, C.accent)
  })

  // Call to action
  const ctaY = SHARE_HEIGHT - 200
  font(ctx, 800, 48, -1)
  ctx.fillStyle = C.text
  ctx.textAlign = 'center'
  ctx.fillText('Think you can beat it?', W / 2, ctaY)
  font(ctx, 700, 38)
  const label = fitText(ctx, s.url, inner - 80)
  const pillW = ctx.measureText(label).width + 80
  panel(ctx, (W - pillW) / 2, ctaY + 40, pillW, 84, 42, C.accent)
  ctx.fillStyle = C.onAccent
  ctx.fillText(label, W / 2, ctaY + 96)
  ctx.textAlign = 'left'
}

export async function renderShareCard(stats: ShareStats): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = SHARE_WIDTH
  canvas.height = SHARE_HEIGHT
  // Canvas won't wait for a webfont, so make sure the wordmark face is ready first.
  await document.fonts.load(`900 112px ${DISPLAY_FONT}`).catch(() => {})
  drawShareCard(canvas.getContext('2d')!, stats)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render image'))), 'image/png'),
  )
}
