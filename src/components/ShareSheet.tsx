import { useEffect, useState } from 'react'
import { BRAND, displayUrl, siteUrl } from '../lib/brand'
import { formatDuration } from '../lib/format'
import { renderShareCard, type ShareStats, type ShareStyle } from '../lib/shareCard'
import { Button } from './Button'
import { Segmented } from './Segmented'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  stats: Omit<ShareStats, 'url'>
}

const FILE_NAMES: Record<ShareStyle, string> = { card: 'my-workout.png', overlay: 'my-workout-overlay.png' }

const STYLES: { value: ShareStyle; label: string }[] = [
  { value: 'card', label: 'Card' },
  { value: 'overlay', label: 'Transparent' },
]

type Images = Record<ShareStyle, { blob: Blob; url: string }>

const canCopyImage = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write

// Browsers can't write to the photo library directly. On iOS a download lands in
// Files, but the share sheet offers "Save Image" which goes straight to Photos.
// Android gallery apps already index the Download folder, so a download is best there.
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function ShareSheet({ open, onClose, stats }: Props) {
  const [images, setImages] = useState<Images | null>(null)
  const [style, setStyle] = useState<ShareStyle>('card')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!open) return
    let urls: string[] = []
    let cancelled = false
    const full = { ...stats, url: displayUrl() }
    // Render both styles up front so switching between them is instant.
    Promise.all([renderShareCard(full, 'card'), renderShareCard(full, 'overlay')]).then(([card, overlay]) => {
      if (cancelled) return
      const next: Images = {
        card: { blob: card, url: URL.createObjectURL(card) },
        overlay: { blob: overlay, url: URL.createObjectURL(overlay) },
      }
      urls = [next.card.url, next.overlay.url]
      setImages(next)
    })
    return () => {
      cancelled = true
      urls.forEach((u) => URL.revokeObjectURL(u))
      setImages(null)
      setNotice('')
    }
    // Stats are fixed once the workout has finished, so only re-render on open.
  }, [open])

  const caption = `${stats.cleared ? 'Cleared the deck' : `${stats.flipped} cards down`}: ${stats.reps} reps in ${formatDuration(stats.timeMs)} on ${BRAND.name}. Your turn 👉 ${siteUrl()}`
  const image = images?.[style]
  const file = image && new File([image.blob], FILE_NAMES[style], { type: 'image/png' })
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
    a.download = FILE_NAMES[style]
    a.click()
    setNotice(
      isIOS
        ? 'Saved to Files. To add it to Photos, press and hold the image above and tap "Save to Photos".'
        : 'Image saved. Find it in your gallery or downloads, then post it or send it to a friend.',
    )
  }

  const copyImage = async () => {
    if (!image) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': image.blob })])
      setNotice('Image copied. Paste it into your story to drop it on as a sticker.')
    } catch {
      setNotice("Couldn't copy the image. Try saving it instead.")
    }
  }

  const changeStyle = (next: ShareStyle) => {
    setStyle(next)
    setNotice('')
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
            {style === 'overlay' && canCopyImage ? (
              <Button className="flex-1" onClick={copyImage} disabled={!image}>
                Copy image
              </Button>
            ) : (
              <Button className="flex-1" onClick={copy}>
                Copy caption
              </Button>
            )}
          </div>
          <p role="status" className="min-h-5 text-center text-sm text-base-400">
            {notice}
          </p>
        </div>
      }
    >
      <div className="mb-4">
        <Segmented label="Image style" options={STYLES} value={style} onChange={changeStyle} />
      </div>
      <div
        className={`mx-auto aspect-[9/16] w-full max-w-60 overflow-hidden rounded-2xl ring-1 ring-base-800 ${
          style === 'overlay' ? 'checkerboard grid place-items-center p-3' : 'bg-base-950'
        }`}
      >
        {image ? (
          <img
            src={image.url}
            alt={style === 'overlay' ? 'Workout stats on a transparent background' : 'Workout summary image'}
            className={style === 'overlay' ? 'max-h-full w-full object-contain' : 'size-full'}
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-base-500">Dealing your card…</div>
        )}
      </div>
      {style === 'overlay' && (
        <p className="mt-3 text-center text-sm text-base-400">
          No background, just your stats. Add it over your own photo in your story.
        </p>
      )}
    </Sheet>
  )
}
