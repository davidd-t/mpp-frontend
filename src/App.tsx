import { useEffect } from 'react'
import AppHeader from './components/AppHeader'
import AppContent from './components/AppContent'
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
    <div className="min-h-screen bg-[#090b10] text-zinc-100 pb-16">
      <AppHeader route={route} />
      <AppInner key={user?.id ?? 'anon'} route={route} />
    </div>
  )
}

export default App
