# Burno

*Flip. Burn. Repeat.* Shuffle a deck, flip one card at a time, do the reps, no skipping. No cards or gym needed: the site deals a virtual deck, keeps time, and tracks every rep. Built for a quick 30–60 minute session with bodyweight or free weights, anywhere.

**🔗 Live:** https://burno.app

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
- **What's new:** gift button top-left on the setup screen opens a dated changelog. A red dot shows returning visitors there's a release they haven't seen; first-time visitors start caught up
- **Community counter:** a running count of everyone's workouts and reps, on the home and summary screens (see below)
- **Share card:** a 1080×1920 story image of the workout (time, cards, reps, breakdown, site link). Uses the native share menu on phones, with Save image / Copy caption as fallbacks

The product name and tagline live in `src/lib/brand.ts`, so a rebrand is a one-file change.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/
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

## What's new

When you ship something people would notice, add an entry to the **top** of `RELEASES` in `src/lib/changelog.ts` (date, short title, one-line changes). Everyone who hasn't opened the sheet since sees a red dot on the button. A release is tracked by its date + title, so editing either brings the dot back.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages. In repo **Settings → Pages**, the source must be **GitHub Actions**.

`public/52-card-workout.pdf` is the original printable one-page sheet.

## Feedback → Google Sheet

People can rate Burno (1–5 stars) with an optional note, first name and email. Anonymous is the default. Feedback can be sent from two places:

- **After a workout:** a small card on the summary screen, shown from the second finished workout on. It snoozes for 30 days if dismissed and 90 days after sending.
- **Any time:** "Send feedback" at the bottom of the setup screen.

Nothing appears during a workout. Each row also gets the person's time zone and language (a rough location, no IP), plus the workout's stats when sent from the summary. With no endpoint configured, the feedback UI is hidden.

**One-time setup:**

1. In Google Sheets, create a blank spreadsheet (e.g. "Burno feedback").
2. **Extensions → Apps Script**, replace the code with [`feedback/apps-script.gs`](feedback/apps-script.gs), and save.
3. **Deploy → New deployment →** type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and approve access when asked.
4. Copy the web app URL (`https://script.google.com/macros/s/…/exec`). Opening it in a browser should show `{"ok":true,…}`.
5. Save it as a repo variable, then redeploy (push to `main` or re-run the workflow):

   ```sh
   gh variable set FEEDBACK_URL --body "https://script.google.com/macros/s/…/exec"
   ```

The first submission creates a **Feedback** tab with headers. For local testing, put `VITE_FEEDBACK_URL=…` in `.env.local`. After editing the script, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Community counter

The same Apps Script keeps a running count of finished workouts and reps for everyone:

- **Home screen:** "🔥 1,284 workouts done by the Burno crowd. Join them." (read with a GET to the web app URL).
- **Summary screen:** "You're Burno workout #1,285 🎉" and "Together: 3.1M reps and counting."

Any workout with at least one card flipped counts, once, even if the summary is reloaded. The app sends only `{ type: 'finish', cards, reps }`, and the script rejects anything over 54 cards or 1,000 reps. Totals live in the script's **Project Settings → Script properties** (`workouts`, `reps`), so you can view, reset or seed them there. If the URL isn't set or a request fails, the lines just don't show.

## Analytics → PostHog

[PostHog](https://posthog.com) shows visitors, where they came from and whether they come back. Its free tier covers 1M events a month. PostHog loads after the app has rendered, using an anonymous id kept in localStorage (no cookies, no session recording). It records:

- **`$pageview`**: every visit, with referrer and any `utm_*` tags on the link.
- **`workout_started`**: deck size, jokers, timer mode, and whether it was a "go again".
- **`workout_finished`**: cards flipped, deck length, cleared, reps, duration in seconds.

Custom move names and feedback text are never sent. With no key configured, PostHog isn't loaded.

**One-time setup:**

1. Sign up at [posthog.com](https://posthog.com) and create a project (US or EU cloud).
2. Copy the **Project API key** (`phc_…`) from **Settings → Project**.
3. Save it as a repo variable, then redeploy:

   ```sh
   gh variable set POSTHOG_KEY --body "phc_…"
   # EU cloud only:
   gh variable set POSTHOG_HOST --body "https://eu.i.posthog.com"
   ```

Tag the links you share so each channel shows up separately, e.g. `https://burno.app/?utm_source=reddit`. For local testing, put `VITE_POSTHOG_KEY=…` in `.env.local`.
