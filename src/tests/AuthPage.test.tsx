import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthPage from '../components/AuthPage'
import { logout } from '../auth'

const originalFetch = globalThis.fetch

describe('AuthPage', () => {
  beforeEach(() => {
    window.location.hash = ''
    try {
      window.localStorage.removeItem('mpp.user')
      window.localStorage.removeItem('mpp.token')
    } catch { /* ignore */ }
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('renders login state with form fields', () => {
    render(<AuthPage route="/login" />)
    expect(screen.getByText('Welcome back')).toBeTruthy()
    expect(screen.getByTestId('auth-username')).toBeTruthy()
    expect(screen.getByTestId('auth-password')).toBeTruthy()
  })

  it('shows error when submitting empty form', () => {
    render(<AuthPage route="/login" />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByTestId('auth-error').textContent).toMatch(/required/i)
  })

  it('toggles between login and register', () => {
    render(<AuthPage route="/login" />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(window.location.hash).toBe('#/register')
  })

  it('logs in successfully and stores user + token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1, username: 'admin', role: 'admin',
        permissions: ['admin.view_monitored'],
        token: 'fake-jwt-token',
      }),
    }) as any

    render(<AuthPage route="/login" />)
    fireEvent.change(screen.getByTestId('auth-username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByTestId('auth-password'), { target: { value: 'admin' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      const stored = window.localStorage.getItem('mpp.user')
      expect(stored).toBeTruthy()
      expect(stored).toContain('admin')
      const token = window.localStorage.getItem('mpp.token')
      expect(token).toBe('fake-jwt-token')
    })
  })

  it('shows error on bad credentials', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invalid credentials' }),
    }) as any

    render(<AuthPage route="/login" />)
    fireEvent.change(screen.getByTestId('auth-username'), { target: { value: 'x' } })
    fireEvent.change(screen.getByTestId('auth-password'), { target: { value: 'y' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByTestId('auth-error').textContent).toMatch(/Invalid credentials/i))
  })

  it('registers successfully and stores token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 10, username: 'newuser', role: 'user',
        permissions: ['codebase.read'],
        token: 'new-user-jwt-token',
      }),
    }) as any

    render(<AuthPage route="/register" />)
    fireEvent.change(screen.getByTestId('auth-username'), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByTestId('auth-password'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      const stored = window.localStorage.getItem('mpp.user')
      expect(stored).toBeTruthy()
      expect(stored).toContain('newuser')
      const token = window.localStorage.getItem('mpp.token')
      expect(token).toBe('new-user-jwt-token')
    })
  })

  it('shows error on duplicate registration', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Username already taken' }),
    }) as any

    render(<AuthPage route="/register" />)
    fireEvent.change(screen.getByTestId('auth-username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByTestId('auth-password'), { target: { value: 'admin' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(screen.getByTestId('auth-error').textContent).toMatch(/already taken/i))
  })

  it('clears token on logout flow', () => {
    window.localStorage.setItem('mpp.user', JSON.stringify({ id: 1, username: 'a', role: 'user', permissions: [] }))
    window.localStorage.setItem('mpp.token', 'some-token')
    logout()
    expect(window.localStorage.getItem('mpp.user')).toBeNull()
    expect(window.localStorage.getItem('mpp.token')).toBeNull()
  })
})
