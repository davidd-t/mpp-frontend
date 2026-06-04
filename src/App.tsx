import { useEffect } from 'react'
import AppHeader from './components/AppHeader'
import AppContent from './components/AppContent'
import ParticlesBackground from './components/ParticlesBackground'
import useAppState from './hooks/useAppState'
import useHashRoute from './hooks/useHashRoute'
import { getCurrentUser, startInactivityWatch, stopInactivityWatch } from './auth'
import { go } from './model'

function AppInner({ route }: { route: string }) {
  const app = useAppState(route)
  return <AppContent route={route} app={app} />
}

function App() {
  const route = useHashRoute()
  const user = getCurrentUser()

  // Start/stop inactivity timer when user logs in/out
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      startInactivityWatch(() => go('/login'))
      return () => stopInactivityWatch()
    }
  }, [route])

  return (
    <div className="min-h-screen text-slate-200 pb-16 relative overflow-x-hidden">
      <ParticlesBackground />
      <div className="relative z-10">
        <AppHeader route={route} />
        <AppInner key={user?.id ?? 'anon'} route={route} />
      </div>
    </div>
  )
}

export default App
