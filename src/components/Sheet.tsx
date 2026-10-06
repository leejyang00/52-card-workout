import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Sticky action row pinned to the bottom of the sheet. */
  footer?: ReactNode
}

/** Native <dialog>: bottom sheet on phones, centred modal from `sm` up. Esc and backdrop tap close it. */
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

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      tabIndex={-1}
      onClose={onClose}
      // A click whose target is the <dialog> itself landed on the backdrop.
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-stone-900 p-0 text-stone-100 ring-1 ring-stone-800 outline-none backdrop:bg-black/70 backdrop:backdrop-blur-sm open:flex open:flex-col sm:my-auto sm:max-w-lg sm:rounded-3xl motion-safe:open:animate-sheet-in"
    >
      <header className="flex items-center justify-between gap-4 px-5 pt-5 pb-2">
        <h2 id={titleId} className="text-xl font-black">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-full text-stone-400 hover:bg-stone-800 hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      {footer && (
        <div className="border-t border-stone-800 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>
      )}
    </dialog>
  )
}
