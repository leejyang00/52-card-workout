import { useLocalStorage } from './hooks/useLocalStorage'
import { useSession } from './hooks/useSession'
import { DEFAULT_SETTINGS } from './lib/settings'
import type { Settings } from './lib/types'
import { SetupScreen } from './screens/SetupScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('cw:settings:v1', DEFAULT_SETTINGS)
  const { session, start, flip, undo, pause, resume, finish, reset } = useSession()

  if (session?.finishedAt) {
    return <SummaryScreen session={session} onRestart={() => start(session.settings)} onDone={reset} />
  }

  if (session) {
    return (
      <WorkoutScreen
        session={session}
        onFlip={flip}
        onUndo={undo}
        onPause={pause}
        onResume={resume}
        onFinish={finish}
      />
    )
  }

  return <SetupScreen settings={settings} onChange={setSettings} onStart={() => start(settings)} />
}
