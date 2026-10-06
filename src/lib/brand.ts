/** Single place to rename the product once a brand/domain is chosen. */
export const BRAND = {
  name: 'Burno',
  tagline: 'Flip. Burn. Repeat.',
  creator: 'Jian',
  domain: 'burno.app',
}

/** Absolute URL of the app, correct for GitHub Pages today and a custom domain later. */
export function siteUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

/**
 * The short, memorable address printed on images. Always the brand domain, even before it's live,
 * since a share image outlives whichever host served it.
 */
export function displayUrl(): string {
  return BRAND.domain
}
