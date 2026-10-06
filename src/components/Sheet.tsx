import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Sticky action row pinned to the bottom of the sheet. */
  footer?: ReactNode
}

/**
 * Native <dialog>: bottom sheet on phones, centred modal from `sm` up. Esc and backdrop tap close it.
 * The dialog itself is the only scroll container, with a sticky header and footer. Older iOS Safari
 * collapses a nested flex scroll area to nothing, so don't reintroduce one.
 */
export function Sheet({ open, onClose, title, children, footer }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Focus the sheet itself rather than ringing the first button on open.
      dialog.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Stop the page behind from scrolling (and stealing touch scrolls) while the sheet is up.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      tabIndex={-1}
      onClose={onClose}
      // A click whose target is the <dialog> itself landed on the backdrop.
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-auto mt-auto mb-0 max-h-[92vh] supports-[height:100dvh]:max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-3xl bg-base-900 p-0 text-base-100 ring-1 ring-base-800 outline-none backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:my-auto sm:max-w-lg sm:rounded-3xl motion-safe:open:animate-sheet-in"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-base-900 px-5 pt-5 pb-2">
        <h2 id={titleId} className="text-xl font-black">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-full text-base-400 hover:bg-base-800 hover:text-base-100 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </header>
      <div className="px-5 pb-5">{children}</div>
      {footer && (
        <div className="sticky bottom-0 z-10 border-t border-base-800 bg-base-900 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </dialog>
  )
}
