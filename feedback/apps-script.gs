/**
 * Burno feedback → Google Sheet, plus the community workout counter.
 *
 * Paste into Extensions → Apps Script of the feedback spreadsheet, then
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * The app POSTs JSON as text/plain (see src/lib/feedback.ts and src/lib/community.ts).
 * Setup steps are in the README.
 */

const SHEET_NAME = 'Feedback'
const HEADERS = [
  'Received (UTC)', 'Rating', 'Comment', 'First name', 'Email', 'From',
  'Time zone', 'Language', 'Cleared deck', 'Cards', 'Reps', 'Minutes',
]
const MAX = { comment: 2000, name: 60, email: 120, short: 60 }
// Most a single finished workout can add: a full deck with jokers is 54 cards and well under 1,000 reps.
const FINISH_MAX = { cards: 54, reps: 1000 }

function doPost(e) {
  let data
  try {
    data = JSON.parse(e.postData.contents)
  } catch (err) {
    return reply({ ok: false, error: 'bad json' })
  }

  if (data.type === 'finish') return countFinish(data)

  // Honeypot: people never see this field, bots fill it in. Pretend it worked.
  if (data.website) return reply({ ok: true })

  const rating = Number(data.rating)
  const validRating = rating >= 1 && rating <= 5 ? Math.round(rating) : ''
  const comment = text(data.comment, MAX.comment)
  if (!validRating && !comment) return reply({ ok: false, error: 'empty' })

  const w = data.workout || {}
  const hasWorkout = typeof w.flipped === 'number'

  const row = [
    new Date().toISOString().replace('T', ' ').slice(0, 19),
    validRating,
    comment,
    text(data.name, MAX.name),
    text(data.email, MAX.email),
    data.source === 'summary' ? 'After workout' : data.source === 'setup' ? 'Setup screen' : '',
    text(data.timeZone, MAX.short),
    text(data.language, MAX.short),
    hasWorkout ? (w.cleared ? 'Yes' : 'No') : '',
    hasWorkout ? `${num(w.flipped)}/${num(w.deckLength)}` : '',
    hasWorkout ? num(w.reps) : '',
    hasWorkout ? Math.round(num(w.timeMs) / 600) / 100 : '',
  ]

  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    sheet().appendRow(row)
  } finally {
    lock.releaseLock()
  }
  return reply({ ok: true })
}

/**
 * A finished workout: adds one to the community totals and replies with the new totals, so the
 * app can say "You're Burno workout #N". No personal data is sent or kept.
 */
function countFinish(data) {
  const cards = Math.round(num(data.cards))
  const reps = Math.round(num(data.reps))
  if (cards < 1 || cards > FINISH_MAX.cards || reps < 0 || reps > FINISH_MAX.reps) {
    return reply({ ok: false, error: 'out of range' })
  }

  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const t = totals()
    const next = { workouts: t.workouts + 1, reps: t.reps + reps }
    PropertiesService.getScriptProperties().setProperties({
      workouts: String(next.workouts),
      reps: String(next.reps),
    })
    return reply({ ok: true, ...next })
  } finally {
    lock.releaseLock()
  }
}

function totals() {
  const p = PropertiesService.getScriptProperties()
  return { workouts: num(p.getProperty('workouts')), reps: num(p.getProperty('reps')) }
}

/** The community totals for the home screen. Also lets you open the URL in a browser to check it's live. */
function doGet() {
  return reply({ ok: true, service: 'burno-feedback', ...totals() })
}

function sheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet()
  let s = book.getSheetByName(SHEET_NAME)
  if (!s) {
    s = book.insertSheet(SHEET_NAME)
    s.appendRow(HEADERS)
    s.setFrozenRows(1)
    s.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
  }
  return s
}

/** Trim, cap length, and stop text like "=IMPORTXML(…)" being run as a formula. */
function text(value, max) {
  const s = String(value == null ? '' : value).trim().slice(0, max)
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
}

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON)
}
