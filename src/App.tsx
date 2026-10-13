import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useSession } from './hooks/useSession'
import { trackChallengeAccepted, trackChallengeOpened, trackWorkoutFinished, trackWorkoutStarted } from './lib/analytics'
import { siteUrl } from './lib/brand'
import { CHALLENGE_PARAM, challengeFromUrl } from './lib/challenge'
import { DEFAULT_SETTINGS } from './lib/settings'
import type { Settings } from './lib/types'
import { ChallengeScreen } from './screens/ChallengeScreen'
import { SetupScreen } from './screens/SetupScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('cw:settings:v1', DEFAULT_SETTINGS)
  const { session, start, flip, undo, pause, resume, finish, reset } = useSession()
  // A challenge link stays on its landing screen, even through reloads, until it's accepted or turned down.
  const [incoming, setIncoming] = useState(() => challengeFromUrl(window.location.href))
  const screen = incoming ? 'challenge' : session?.finishedAt ? 'summary' : session ? 'workout' : 'setup'

  useEffect(() => {
    if (incoming) trackChallengeOpened(incoming)
    // A damaged link just opens the app.
    else if (new URL(window.location.href).searchParams.has(CHALLENGE_PARAM)) leaveChallengeUrl()
  }, [])

  // Screens swap in place, so the window keeps the previous screen's scroll
  // position. Start each new screen at the top.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  if (incoming) {
    const close = () => {
      leaveChallengeUrl()
      setIncoming(null)
    }
    return (
      <ChallengeScreen
        challenge={incoming}
        replacesWorkout={session != null && !session.finishedAt && session.flipped > 0}
        onAccept={() => {
          // The challenge's rules, with this person's own display preferences. Their saved setup is untouched.
          const challengeSettings = { ...incoming.settings, showRepTotals: settings.showRepTotals }
          trackChallengeAccepted(incoming)
          trackWorkoutStarted(challengeSettings)
          start(challengeSettings, { deck: incoming.deck, ref: { id: incoming.id, from: incoming.from, result: incoming.result } })
          close()
        }}
        onDecline={close}
      />
    )
  }

  if (session?.finishedAt) {
    return (
      <SummaryScreen
        session={session}
        onRestart={() => {
          trackWorkoutStarted(session.settings, true)
          start(session.settings)
        }}
        onDone={reset}
      />
    )
  }

  if (session) {
    return (
      <WorkoutScreen
        session={session}
        onFlip={flip}
        onUndo={undo}
        onPause={pause}
        onResume={resume}
        onFinish={() => {
          trackWorkoutFinished(session)
          finish()
        }}
      />
    )
  }

  return (
    <SetupScreen
      settings={settings}
      onChange={setSettings}
      onStart={() => {
        trackWorkoutStarted(settings)
        start(settings)
      }}
    />
  )
}

/** Back to the plain app address, so a reload doesn't bring the challenge back. */
function leaveChallengeUrl() {
  window.history.replaceState(null, '', siteUrl())
}
