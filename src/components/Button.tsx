import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-stone-950 hover:bg-accent-strong active:bg-accent-strong',
  secondary: 'bg-stone-800 text-stone-100 hover:bg-stone-700 active:bg-stone-700',
  ghost: 'text-stone-300 hover:bg-stone-800/70 hover:text-stone-100',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'md' | 'lg'
}

export function Button({ variant = 'secondary', size = 'md', className = '', ...props }: Props) {
  const sizing = size === 'lg' ? 'h-14 px-6 text-lg' : 'h-11 px-4 text-sm'
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 ${sizing} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}
