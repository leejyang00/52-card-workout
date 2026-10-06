import { useEffect, useState } from 'react'
import { BRAND, displayUrl, siteUrl } from '../lib/brand'
import { formatDuration } from '../lib/format'
import { renderShareCard, type ShareStats } from '../lib/shareCard'
import { Button } from './Button'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  stats: Omit<ShareStats, 'url'>
}

const FILE_NAME = 'my-workout.png'

export function ShareSheet({ open, onClose, stats }: Props) {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!open) return
    let url = ''
    let cancelled = false
    renderShareCard({ ...stats, url: displayUrl() }).then((blob) => {
      if (cancelled) return
      url = URL.createObjectURL(blob)
      setImage({ blob, url })
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      setImage(null)
      setNotice('')
    }
    // Stats are fixed once the workout has finished, so only re-render on open.
  }, [open])

  const caption = `${stats.cleared ? 'Cleared the deck' : `${stats.flipped} cards down`}: ${stats.reps} reps in ${formatDuration(stats.timeMs)} on ${BRAND.name}. Your turn 👉 ${siteUrl()}`
  const file = image && new File([image.blob], FILE_NAME, { type: 'image/png' })
  const canShareFile = !!file && !!navigator.canShare?.({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      // Some apps drop `text` when a file is attached, so the URL also lives on the image.
      await navigator.share({ files: [file], text: caption })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setNotice("Couldn't open the share menu. Try saving the image instead.")
    }
  }

  const save = () => {
    if (!image) return
    const a = document.createElement('a')
    a.href = image.url
    a.download = FILE_NAME
    a.click()
    setNotice('Image saved. Post it to your story or send it to a friend.')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption)
      setNotice('Caption and link copied.')
    } catch {
      setNotice(siteUrl())
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Share your workout"
      footer={
        <div className="flex flex-col gap-2">
          {canShareFile ? (
            <Button variant="primary" size="lg" onClick={share}>
              Share
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={save} disabled={!image}>
              Save image
            </Button>
          )}
          <div className="flex gap-2">
            {canShareFile && (
              <Button className="flex-1" onClick={save}>
                Save image
              </Button>
            )}
            <Button className="flex-1" onClick={copy}>
              Copy caption
            </Button>
          </div>
          <p role="status" className="min-h-5 text-center text-sm text-base-400">
            {notice}
          </p>
        </div>
      }
    >
      <div className="mx-auto aspect-[9/16] w-full max-w-60 overflow-hidden rounded-2xl bg-base-950 ring-1 ring-base-800">
        {image ? (
          <img src={image.url} alt="Workout summary image" className="size-full" />
        ) : (
          <div className="grid size-full place-items-center text-sm text-base-500">Dealing your card…</div>
        )}
      </div>
    </Sheet>
  )
}
