# Burno marketing plan

_Written 2026-10-07. Goal: get Burno (burno.app) in front of as many people as possible worldwide. Feedback and Buy Me a Coffee are the payoff._

Burno already has a big advantage. The summary screen makes a 1080×1920 story-sized share card with the URL on it (`src/lib/shareCard.ts`), so the sharing loop is half built.

---

## 1. Fix the basics before sending traffic (about a week)

Sending traffic before these are in place wastes your one shot with each audience.

- [ ] **Link-preview image.** `index.html` has `og:title` but no `og:image`, and `twitter:card` is `summary`. Pasted links in WhatsApp, iMessage, Discord and X show a plain text box.
  - [ ] Design a 1200×630 preview image (a fanned deck plus "Flip. Burn. Repeat.")
  - [ ] Add `og:image`, `og:url`, and a canonical link to `https://burno.app`
  - [ ] Change `twitter:card` to `summary_large_image`
- [ ] **Analytics.** Use Plausible, Umami or Cloudflare Web Analytics (free or cheap, no cookie banner needed).
  - [ ] Track three events: workout started, workout finished, share tapped
- [ ] **Make it installable.** Add a PWA manifest and icons so people can add it to their home screen.

## 2. Make sharing pull new people in

- [ ] **Challenge links.** For example, `burno.app/?c=18m42s` opens with "Can you beat 18:42?". This turns the share card from showing off into a dare.
- [ ] **Group link.** "Join my deck" gives everyone the same shuffle (a shared seed). One person brings three or four friends.
- [ ] **Streaks.** Show "3 workouts this week" on the summary screen. Returning users are the ones who buy you a coffee.

## 3. Where to find people, in rough order

1. **Short videos on TikTok, Reels and Shorts.** This is the best route to a worldwide audience.
   - The deck-of-cards workout is already a well-known PT and military drill, so people get it in about 3 seconds.
   - Post 10–15 second clips of you flipping a card and doing the reps, ending on the share card.
   - Aim for 3–5 a week. Consistency matters more than polish.
2. **Reddit.** Post as the maker and read each sub's rules first.
   - r/InternetIsBeautiful: a free website with no sign-up is exactly what this sub is for
   - r/bodyweightfitness, r/homegym, r/xxfitness, r/loseit
   - r/SideProject, r/webdev: talk about how you built it
3. **Groups that already do this workout.** Send each a short, personal DM or email. One coach who uses it brings a whole class or club.
   - PE teachers (it works on a classroom projector)
   - Run clubs, CrossFit and bootcamp coaches
   - Scouts, ROTC and military prep groups
4. **Search.** People actually search for "deck of cards workout".
   - [ ] Add a simple page that explains the workout and links to the printable PDF (`public/52-card-workout.pdf`)
5. **Launch days: Show HN and Product Hunt.** These give one-day spikes and lasting backlinks. Do them after sections 1–2 so the spike turns into people who stay.
6. **Small fitness creators** (under 50k followers). Just send them the link. A free, no-sign-up tool is easy for them to mention.

## 4. What to expect

- Only a very small share of users ever donate through Buy Me a Coffee.
- Treat the first few thousand users as feedback and proof that people come back, not as income.
- If retention is good, later options include custom decks or group sessions, or a "Pro" tier.

## Suggested order

| When | Focus |
|---|---|
| Week 1 | Section 1: preview image, analytics, PWA |
| Week 2 | Friends and family, then Reddit (r/InternetIsBeautiful first) |
| Week 3+ | Short videos, 3–5 a week; contact coaches and teachers |
| After challenge links ship | Show HN and Product Hunt |
