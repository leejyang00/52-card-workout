import { Button } from '../components/Button'
import { ExerciseSelect } from '../components/ExerciseSelect'
import { Segmented } from '../components/Segmented'
import { SuitBadge } from '../components/SuitBadge'
import { Toggle } from '../components/Toggle'
import { ACE_REPS, SUIT_LABEL, SUITS } from '../lib/deck'
import { DEFAULT_SETTINGS, TIMER_PRESETS } from '../lib/settings'
import type { Settings } from '../lib/types'

interface Props {
  settings: Settings
  onChange: (settings: Settings) => void
  onStart: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-stone-900/60 p-4 ring-1 ring-stone-800 sm:p-5">
      <h2 className="mb-3 text-xs font-bold tracking-widest text-stone-400 uppercase">{title}</h2>
      {children}
    </section>
  )
}

export function SetupScreen({ settings, onChange, onStart }: Props) {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value })
  const allNamed = SUITS.every((s) => settings.moves[s].trim()) && settings.aceMove.trim()
  const faceMax = settings.capFaceCards ? 10 : 13
  const perSuit = 54 + (settings.capFaceCards ? 30 : 36)
  const customised =
    settings.aceMove !== DEFAULT_SETTINGS.aceMove || SUITS.some((s) => settings.moves[s] !== DEFAULT_SETTINGS.moves[s])

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-8 pb-32 sm:pt-12">
      <header className="mb-6 text-center">
        <p className="mb-2 text-3xl tracking-widest" aria-hidden>
          <span className="text-suit-red">♥</span> ♠ <span className="text-suit-red">♦</span> ♣
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">52-Card Workout</h1>
        <p className="mt-2 text-stone-400">Shuffle · Flip one card · Do the reps · No skipping</p>
      </header>

      <div className="flex flex-col gap-4">
        <Section title="Suit = the move">
          <ul className="flex flex-col gap-3">
            {SUITS.map((suit) => (
              <li key={suit} className="flex items-start gap-3">
                <SuitBadge suit={suit} label={SUIT_LABEL[suit]} />
                <ExerciseSelect
                  label={`${SUIT_LABEL[suit]} exercise`}
                  value={settings.moves[suit]}
                  onChange={(name) => set('moves', { ...settings.moves, [suit]: name })}
                />
              </li>
            ))}
            <li className="flex items-start gap-3 border-t border-stone-800 pt-3">
              <SuitBadge suit="ace" label="Any ace" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <ExerciseSelect
                  label="Ace exercise"
                  value={settings.aceMove}
                  onChange={(name) => set('aceMove', name)}
                />
                <p className="text-sm text-stone-400">
                  Any Ace = <b className="text-accent">{ACE_REPS} reps</b> · wildcard, overrides the suit
                </p>
              </div>
            </li>
          </ul>
          {customised && (
            <button
              type="button"
              onClick={() => onChange({ ...settings, moves: DEFAULT_SETTINGS.moves, aceMove: DEFAULT_SETTINGS.aceMove })}
              className="mt-3 text-sm text-stone-400 underline-offset-4 hover:text-stone-100 hover:underline"
            >
              Reset to classic moves
            </button>
          )}
        </Section>

        <Section title="Number = the reps">
          <dl className="grid grid-cols-4 gap-2 text-center">
            {[
              ['2–10', 'face value'],
              ['J', settings.capFaceCards ? '10' : '11'],
              ['Q', settings.capFaceCards ? '10' : '12'],
              ['K', String(faceMax)],
            ].map(([term, def]) => (
              <div key={term} className="rounded-xl bg-stone-800/70 px-1 py-3">
                <dt className="text-xl font-black">{term}</dt>
                <dd className="text-xs text-stone-400">{def}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-stone-400">
            Full deck ≈ <b className="text-stone-100">{perSuit}</b> reps per suit +{' '}
            <b className="text-stone-100">{ACE_REPS * 4}</b> on aces.
          </p>
        </Section>

        <Section title="Timer">
          <Segmented
            label="Timer mode"
            value={settings.timerMode}
            onChange={(v) => set('timerMode', v)}
            options={[
              { value: 'up', label: 'Count up' },
              { value: 'down', label: 'Count down' },
            ]}
          />
          {settings.timerMode === 'down' && (
            <div className="mt-3">
              <Segmented
                label="Countdown length"
                value={settings.timerMinutes}
                onChange={(v) => set('timerMinutes', v)}
                options={TIMER_PRESETS.map((m) => ({ value: m, label: `${m} min` }))}
              />
            </div>
          )}
          <p className="mt-3 text-sm text-stone-400">
            {settings.timerMode === 'up'
              ? 'A stopwatch runs from your first flip. Beat your best time.'
              : `Starts on your first flip. Try to clear the deck in ${settings.timerMinutes} minutes.`}
          </p>
        </Section>

        <Section title="Deck">
          <Segmented
            label="Deck size"
            value={settings.deckSize}
            onChange={(v) => set('deckSize', v)}
            options={[
              { value: 'full', label: 'Full · 52' },
              { value: 'half', label: 'Half · 26' },
            ]}
          />
          <div className="mt-1 divide-y divide-stone-800">
            <Toggle
              label="Add jokers"
              description="1-minute rest, or 30 sec of your hardest move"
              checked={settings.jokers}
              onChange={(v) => set('jokers', v)}
            />
            <Toggle
              label="Cap face cards at 10"
              description="Easier on J, Q and K"
              checked={settings.capFaceCards}
              onChange={(v) => set('capFaceCards', v)}
            />
          </div>
        </Section>

        <details className="group rounded-2xl bg-stone-900/60 p-4 ring-1 ring-stone-800 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold tracking-widest text-stone-400 uppercase">
            House rules
            <span aria-hidden className="text-lg transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-stone-300 marker:text-suit-red">
            <li>
              <b>No stopping</b> until you flip a face card. That's your earned breather.
            </li>
            <li>
              <b>Too tough?</b> Run a half deck, or cap face cards at 10.
            </li>
            <li>
              <b>Too easy?</b> Run it twice, or swap in harder moves.
            </li>
          </ul>
        </details>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-xl">
          <Button variant="primary" size="lg" className="w-full" disabled={!allNamed} onClick={onStart}>
            Shuffle &amp; start
          </Button>
        </div>
      </div>
    </div>
  )
}
