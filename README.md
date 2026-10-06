# 52-Card Workout

Shuffle a deck, flip one card at a time, do the reps, no skipping. No cards or gym needed: the site deals a virtual deck, keeps time, and tracks every rep. Built for a quick 30–60 minute session with bodyweight or free weights, anywhere.

**🔗 Live:** https://leejyang00.github.io/52-card-workout/

## How it works

**Suit = the move · Number = the reps**

- **2–10** face value · **J** 11 · **Q** 12 · **K** 13 (optionally capped at 10)
- **Any Ace** = 20 reps of the wildcard move (default: lunges)
- **Jokers** (optional) = 1-minute rest, or 30 sec of your hardest move

Classic moves: ♥ Push-ups · ♠ Clean & Press · ♣ Burpees · ♦ Sit-ups. Every suit and the Ace can be swapped from a list of bodyweight, bar and dumbbell/kettlebell moves, or set to any custom move.

## Features

- **Virtual deck:** shuffled 52 (or half-deck 26) with optional jokers, flip and undo, cards-left counter, and the flipped pile
- **Timer:** count up, or count down from 30/45/60 min. Starts on the first flip; pause/resume; vibrates when the countdown ends
- **Rep tracking:** done vs. total for each move, plus a summary at the end
- **Survives reloads:** settings and the workout in progress are saved in the browser (localStorage). No backend, no accounts
- **Keeps the screen awake** while the timer runs (where supported)
- **How it works** sheet that opens on a first visit and can be reopened from the setup screen
- **Share card:** a 1080×1920 story image of the workout (time, cards, reps, breakdown, site link). Uses the native share menu on phones, with Save image / Copy caption as fallbacks

The product name and tagline live in `src/lib/brand.ts`, so a rebrand is a one-file change.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/52-card-workout/
npm test         # deck/reps logic (Vitest)
npm run build    # type-check + production build to dist/
```

Stack: Vite, React, TypeScript, Tailwind CSS v4.

```
src/
  lib/         pure logic: deck, reps, exercise catalog, defaults
  hooks/       session state, localStorage, clock, wake lock
  components/  reusable UI (card, timer, selects, toggles…)
  screens/     Setup → Workout → Summary
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages. In repo **Settings → Pages**, the source must be **GitHub Actions**.

`public/52-card-workout.pdf` is the original printable one-page sheet.
