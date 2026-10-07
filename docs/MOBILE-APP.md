# Idea: Burno as a mobile app

_Written 2026-10-07. Status: **an idea to think about, not committed to.** Come back to it once people are coming back to work out each week (see [MARKETING.md](MARKETING.md))._

## The short version

Burno doesn't need a rebuild. It's a Vite + React web app, which is the standard setup for [Capacitor](https://capacitorjs.com). Capacitor wraps the existing code in a real iOS and Android app, and the same code keeps running burno.app.

## Options

| Option | What it is | Effort | Verdict |
|---|---|---|---|
| Installable web app (PWA) | "Add to Home Screen" from the browser | Hours | Do first (already on the marketing list) |
| **Capacitor wrap** | Current app inside a native shell, listed on the App Store and Google Play | A weekend to get running, a few more to get through review | **Recommended** |
| React Native or a native rewrite | Rebuild from scratch | Weeks to months | Not worth it |

## Costs

- Apple Developer Program: $99 a year
- Google Play: $25 one-time
- A Mac with Xcode for iOS (already have)
- A privacy policy URL and privacy disclosures in both stores. These must also cover any analytics.

## Trap 1: Apple rejects apps that are "just a website" (guideline 4.2)

Add things that make it feel native:

- Haptics when you flip a card
- Works fully offline
- Local notifications for streak reminders ("You haven't burned this week 🔥")
- Save workouts to Apple Health or Google Health Connect. This is the strongest reason for it to be an app rather than a website.
- Screen stays on during a workout (`useWakeLock` already covers this on the web; check that it works in the wrapper)

## Trap 2: the Buy Me a Coffee link

Apple generally requires tips to a developer to go through its own in-app purchase system, and Google has a similar rule. The rules have loosened recently, especially in the US, but they still differ by country and change often. **Check the current rules before submitting.**

Safe options:

- Hide the coffee link in the store builds and keep it on burno.app
- Or replace it with an in-app purchase "tip jar". Apple and Google take about 15% at small-developer volume.

## Why it might be worth it

- The App Store and Google Play are another place people search, for example for "deck of cards workout" (app store optimization)
- A store listing named "Burno" helps the Google ranking for the brand name (see [SEO.md](SEO.md))
- Home-screen icon plus notifications bring people back more often

## Why it might not be (yet)

- Store review costs real time, and so does every update
- If people aren't coming back each week on the web, an app won't fix that

## Rough plan if I go for it

- [ ] Ship the PWA and analytics first. Check that people come back each week.
- [ ] Add Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`) and run the existing build inside it
- [ ] Add native extras: haptics, local notifications, offline
- [ ] Decide how to handle the coffee link in store builds
- [ ] Write a privacy policy page on burno.app
- [ ] **Android first:** cheaper, and review is easier. Publish on Google Play.
- [ ] Then iOS: Apple Developer account, App Store listing, review
- [ ] Later: Apple Health and Health Connect integration
