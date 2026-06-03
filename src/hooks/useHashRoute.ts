import { useEffect, useState } from 'react'
import { readHash } from '../model'

export default function useHashRoute() {
  const [route, setRoute] = useState('/')

  useEffect(() => {
    const updateRoute = () => setRoute(readHash())
    updateRoute()
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  return route
}
