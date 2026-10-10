import { useLayoutEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useSession } from './hooks/useSession'
import { trackWorkoutFinished, trackWorkoutStarted } from './lib/analytics'
import { DEFAULT_SETTINGS } from './lib/settings'
import type { Settings } from './lib/types'
import { SetupScreen } from './screens/SetupScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('cw:settings:v1', DEFAULT_SETTINGS)
  const { session, start, flip, undo, pause, resume, finish, reset } = useSession()
  const screen = session?.finishedAt ? 'summary' : session ? 'workout' : 'setup'

  // Screens swap in place, so the window keeps the previous screen's scroll
  // position. Start each new screen at the top.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

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
