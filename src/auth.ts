// Auth helper — JWT token-based authentication with session management.
// Supports 3 roles: admin, moderator, user.
// Stores user info + tokens in localStorage. Sends Bearer token on API requests.

import { clearLocalData } from './api'

const USER_KEY = 'mpp.user'
const TOKEN_KEY = 'mpp.token'
const REFRESH_TOKEN_KEY = 'mpp.refreshToken'
const SESSION_ID_KEY = 'mpp.sessionId'

export interface AuthUser {
  id: number
  username: string
  role: 'admin' | 'moderator' | 'user'
  permissions: string[]
}

interface AuthResponse extends AuthUser {
  token: string
  refresh_token?: string
  session_id?: string
}

let cached: AuthUser | null = readUser()

function readUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(SESSION_ID_KEY)
}

export function getCurrentUser(): AuthUser | null {
  return cached
}

export function setCurrentUser(user: AuthUser | null, token?: string, refreshToken?: string, sessionId?: string) {
  cached = user
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    if (sessionId) window.localStorage.setItem(SESSION_ID_KEY, sessionId)
  } else {
    window.localStorage.removeItem(USER_KEY)
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    window.localStorage.removeItem(SESSION_ID_KEY)
  }
}

export function hasPermission(code: string): boolean {
  return cached?.permissions.includes(code) ?? false
}

export function isAdmin(): boolean {
  return cached?.role === 'admin'
}

export function isModerator(): boolean {
  return cached?.role === 'moderator' || cached?.role === 'admin'
}

function getBaseUrl(): string {
  return 'https://mpp-backend-production-d1dc.up.railway.app'
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${getBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }))
    throw new Error(err.detail ?? 'Login failed')
  }
  const data = (await res.json()) as AuthResponse
  const { token, refresh_token, session_id, ...user } = data
  setCurrentUser(user, token, refresh_token ?? undefined, session_id ?? undefined)
  return user
}

export async function register(username: string, password: string, email?: string): Promise<AuthUser> {
  const res = await fetch(`${getBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }))
    throw new Error(err.detail ?? 'Registration failed')
  }
  const data = (await res.json()) as AuthResponse
  const { token, refresh_token, session_id, ...user } = data
  setCurrentUser(user, token, refresh_token ?? undefined, session_id ?? undefined)
  return user
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${getBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as AuthResponse
    const { token, refresh_token: newRefresh, session_id, ...user } = data
    setCurrentUser(user, token, newRefresh ?? undefined, session_id ?? undefined)
    return true
  } catch {
    return false
  }
}

export function logout() {
  // Call backend to revoke session (fire & forget)
  const token = getToken()
  if (token) {
    fetch(`${getBaseUrl()}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {})
  }
  setCurrentUser(null)
  clearLocalData()
}


// ── Inactivity auto-logout ──────────────────────────────────────

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
let _inactivityTimer: any = null
let _onLogoutCallback: any = null

function _resetInactivityTimer() {
  if (!cached) return // not logged in
  clearTimeout(_inactivityTimer)
  _inactivityTimer = setTimeout(() => {
    logout()
    if (_onLogoutCallback)
      _onLogoutCallback()
  }, INACTIVITY_TIMEOUT_MS)
}

const _ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart']

export function startInactivityWatch(onLogout: () => void) {
  _onLogoutCallback = onLogout
  _ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, _resetInactivityTimer))
  _resetInactivityTimer()
}

export function stopInactivityWatch() {
  clearTimeout(_inactivityTimer)
  _inactivityTimer = null
  _ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, _resetInactivityTimer))
  _onLogoutCallback = null
}
