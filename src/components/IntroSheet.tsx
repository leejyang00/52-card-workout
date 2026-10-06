import { BRAND } from '../lib/brand'
import { Button } from './Button'
import { Sheet } from './Sheet'

const STEPS = [
  ['Pick your moves', 'Each suit gets an exercise. Keep the classics or swap in your own.'],
  ['Flip a card', 'The suit is the move, the number is the reps. Aces are a 20-rep wildcard.'],
  ['Clear the deck', "Keep flipping until it's gone. No skipping. Face cards earn a breather."],
]

const WAYS = [
  ['🏃', 'Anywhere', 'Park, living room, hotel room. Bodyweight or a pair of dumbbells.'],
  ['👯', 'With friends', 'Everyone does the same card, or take turns being the dealer.'],
  ['⏱️', '15–45 min', 'Half deck for a quick hit, full deck for the whole session.'],
]

export function IntroSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`What's ${BRAND.name}?`}
      footer={
        <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
          Let's go
        </Button>
      }
    >
      <p className="text-base-300">
        A full-body workout played with a deck of cards. No cards? No problem: we shuffle and deal for you, keep the
        time and count every rep.
      </p>

      <ol className="mt-5 flex flex-col gap-3">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-black text-on-accent">
              {i + 1}
            </span>
            <span>
              <span className="block font-bold">{title}</span>
              <span className="block text-sm text-base-400">{body}</span>
            </span>
          </li>
        ))}
      </ol>

      <ul className="mt-6 divide-y divide-base-800 rounded-2xl bg-base-800/50 px-4">
        {WAYS.map(([icon, title, body]) => (
          <li key={title} className="flex items-start gap-3 py-3">
            <span className="text-xl leading-6" aria-hidden>
              {icon}
            </span>
            <span>
              <span className="block text-sm font-bold">{title}</span>
              <span className="block text-sm text-base-400">{body}</span>
            </span>
          </li>
        ))}
      </ul>

      <figure className="mt-6 rounded-2xl border-l-4 border-accent bg-base-800/30 p-4">
        <figcaption className="mb-2 flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-accent text-sm font-black text-on-accent"
          >
            {BRAND.creator[0]}
          </span>
          <span>
            <span className="block text-sm font-bold">From the creator</span>
            <span className="block text-xs text-base-400">{BRAND.creator}</span>
          </span>
        </figcaption>
        <blockquote className="flex flex-col gap-2 text-sm text-base-300">
          <p>
            My schedule kept beating my gym plans. Some days there just isn't time to get to a gym, but there's always
            a bit of floor, and usually a pull-up bar somewhere nearby.
          </p>
          <p>
            That's all this needs. Shuffle, flip, and you've started a workout wherever you are. A simple idea, but an
            intense workout. Hope it fits into your day the way it fits into mine.
          </p>
        </blockquote>
      </figure>
    </Sheet>
  )
}
