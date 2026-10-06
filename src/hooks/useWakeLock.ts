import { useEffect } from 'react'

/** Keep the phone screen on mid-workout. Best effort: silently no-ops where unsupported. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release()
      } catch {
        // Denied (e.g. low battery); nothing to do.
      }
    }
    // The lock is dropped whenever the tab is hidden, so take it again on return.
    const onVisible = () => document.visibilityState === 'visible' && acquire()

    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release()
    }
  }, [active])
}
