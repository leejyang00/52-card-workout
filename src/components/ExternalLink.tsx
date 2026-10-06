import type { AnchorHTMLAttributes } from 'react'

/** Opens in a new tab, so following a link never throws away the current screen. */
export function ExternalLink({ className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded font-semibold underline decoration-base-600 underline-offset-4 transition-colors hover:text-base-100 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
      {...props}
    />
  )
}
