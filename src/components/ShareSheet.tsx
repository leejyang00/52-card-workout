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

// Browsers can't write to the photo library directly. On iOS a download lands in
// Files, but the share sheet offers "Save Image" which goes straight to Photos.
// Android gallery apps already index the Download folder, so a download is best there.
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

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

  const saveLabel = isIOS && canShareFile ? 'Save to Photos' : 'Save image'

  const share = async () => {
    if (!file) return
    try {
      // Some apps drop `text` when a file is attached, so the URL also lives on the image.
      await navigator.share({ files: [file], text: caption })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setNotice("Couldn't open the share menu. Try saving the image instead.")
    }
  }

  const save = async () => {
    if (!image) return
    if (isIOS && canShareFile && file) {
      try {
        // Image only, no caption: with text attached iOS can hide "Save Image".
        await navigator.share({ files: [file] })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        // Fall through to a plain download.
      }
    }
    const a = document.createElement('a')
    a.href = image.url
    a.download = FILE_NAME
    a.click()
    setNotice(
      isIOS
        ? 'Saved to Files. To add it to Photos, press and hold the image above and tap "Save to Photos".'
        : 'Image saved. Find it in your gallery or downloads, then post it or send it to a friend.',
    )
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
              {saveLabel}
            </Button>
          )}
          <div className="flex gap-2">
            {canShareFile && (
              <Button className="flex-1" onClick={save}>
                {saveLabel}
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
