/** Single place to rename the product once a brand/domain is chosen. */
export const BRAND = {
  name: '52-Card Workout',
  tagline: 'Shuffle · Flip one card · Do the reps · No skipping',
  creator: 'Jian',
}

/** Absolute URL of the app, correct for GitHub Pages today and a custom domain later. */
export function siteUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

/** siteUrl() without protocol or trailing slash, for printing on images. */
export function displayUrl(): string {
  return siteUrl().replace(/^https?:\/\//, '').replace(/\/$/, '')
}
