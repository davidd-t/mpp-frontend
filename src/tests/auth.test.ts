import { describe, expect, it, beforeEach } from 'vitest'
import {
  getCurrentUser,
  setCurrentUser,
  getToken,
  getRefreshToken,
  getSessionId,
  hasPermission,
  isAdmin,
  isModerator,
  logout,
} from '../auth'
import type { AuthUser } from '../auth'

describe('auth module', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setCurrentUser(null)
  })

  describe('setCurrentUser / getCurrentUser', () => {
    it('returns null when no user set', () => {
      expect(getCurrentUser()).toBeNull()
    })

    it('stores and retrieves user', () => {
      const user: AuthUser = { id: 1, username: 'admin', role: 'admin', permissions: ['codebase.read'] }
      setCurrentUser(user, 'tok', 'ref', 'sess')
      expect(getCurrentUser()).toEqual(user)
    })

    it('stores token in localStorage', () => {
      const user: AuthUser = { id: 1, username: 'admin', role: 'admin', permissions: [] }
      setCurrentUser(user, 'my-token', 'my-refresh', 'my-session')
      expect(getToken()).toBe('my-token')
      expect(getRefreshToken()).toBe('my-refresh')
      expect(getSessionId()).toBe('my-session')
    })

    it('clears storage when user set to null', () => {
      const user: AuthUser = { id: 1, username: 'admin', role: 'admin', permissions: [] }
      setCurrentUser(user, 'tok', 'ref', 'sess')
      setCurrentUser(null)
      expect(getCurrentUser()).toBeNull()
      expect(getToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
      expect(getSessionId()).toBeNull()
    })
  })

  describe('hasPermission', () => {
    it('returns true for granted permission', () => {
      setCurrentUser({ id: 1, username: 'u', role: 'user', permissions: ['codebase.read', 'codebase.write'] })
      expect(hasPermission('codebase.read')).toBe(true)
    })

    it('returns false for missing permission', () => {
      setCurrentUser({ id: 1, username: 'u', role: 'user', permissions: ['codebase.read'] })
      expect(hasPermission('admin.view_logs')).toBe(false)
    })

    it('returns false when no user', () => {
      expect(hasPermission('anything')).toBe(false)
    })
  })

  describe('role checks', () => {
    it('isAdmin returns true for admin', () => {
      setCurrentUser({ id: 1, username: 'a', role: 'admin', permissions: [] })
      expect(isAdmin()).toBe(true)
      expect(isModerator()).toBe(true) // admin is also moderator-level
    })

    it('isModerator returns true for moderator', () => {
      setCurrentUser({ id: 2, username: 'm', role: 'moderator', permissions: [] })
      expect(isModerator()).toBe(true)
      expect(isAdmin()).toBe(false)
    })

    it('regular user is neither admin nor moderator', () => {
      setCurrentUser({ id: 3, username: 'u', role: 'user', permissions: [] })
      expect(isAdmin()).toBe(false)
      expect(isModerator()).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears user state', async () => {
      setCurrentUser({ id: 1, username: 'a', role: 'admin', permissions: [] }, 'tok')
      // logout makes a fetch call - mock it
      globalThis.fetch = (() => Promise.resolve({ ok: true })) as any
      await logout()
      expect(getCurrentUser()).toBeNull()
      expect(getToken()).toBeNull()
    })
  })
})
