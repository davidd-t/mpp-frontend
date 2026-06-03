import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useHashRoute from '../hooks/useHashRoute'

describe('useHashRoute', () => {
  it('reads current hash and updates on hashchange', () => {
    window.location.hash = '#/login'

    const { result } = renderHook(() => useHashRoute())
    expect(result.current).toBe('/login')

    act(() => {
      window.location.hash = '#/dashboard'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(result.current).toBe('/dashboard')
  })
})
