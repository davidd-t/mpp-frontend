import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock the api and auth modules
vi.mock('../api', () => ({
  adminApi: {
    monitoredUsers: vi.fn(),
    logs: vi.fn(),
    clearMonitored: vi.fn(),
  },
}))

vi.mock('../auth', () => ({
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn(),
}))

import AdminMonitoringPage from '../components/AdminMonitoringPage'
import { adminApi } from '../api'
import { getCurrentUser, isAdmin } from '../auth'

describe('AdminMonitoringPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows sign-in message when no user', () => {
    vi.mocked(getCurrentUser).mockReturnValue(null)
    vi.mocked(isAdmin).mockReturnValue(false)
    render(<AdminMonitoringPage />)
    expect(screen.getByText(/sign in/i)).toBeTruthy()
  })

  it('shows access denied for non-admin users', () => {
    vi.mocked(getCurrentUser).mockReturnValue({ id: 2, username: 'alice', role: 'user', permissions: [] })
    vi.mocked(isAdmin).mockReturnValue(false)
    render(<AdminMonitoringPage />)
    expect(screen.getByTestId('admin-forbidden')).toBeTruthy()
    expect(screen.getByText(/access denied/i)).toBeTruthy()
  })

  it('loads and displays monitored users for admin', async () => {
    vi.mocked(getCurrentUser).mockReturnValue({ id: 1, username: 'admin', role: 'admin', permissions: [] })
    vi.mocked(isAdmin).mockReturnValue(true)
    vi.mocked(adminApi.monitoredUsers).mockResolvedValue([
      { user_id: 3, username: 'bob', role_name: 'user', reason: 'rate>30/60s', action_count: 50, first_flagged_at: '2026-01-01T00:00:00', last_flagged_at: '2026-01-01T00:01:00' }
    ])
    vi.mocked(adminApi.logs).mockResolvedValue([])

    render(<AdminMonitoringPage />)
    await waitFor(() => {
      expect(screen.getByText('bob')).toBeTruthy()
    })
    expect(screen.getByText(/rate>30/)).toBeTruthy()
  })

  it('shows error when API fails', async () => {
    vi.mocked(getCurrentUser).mockReturnValue({ id: 1, username: 'admin', role: 'admin', permissions: [] })
    vi.mocked(isAdmin).mockReturnValue(true)
    vi.mocked(adminApi.monitoredUsers).mockRejectedValue(new Error('Network error'))
    vi.mocked(adminApi.logs).mockRejectedValue(new Error('Network error'))

    render(<AdminMonitoringPage />)
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeTruthy()
    })
  })

  it('refresh button triggers data reload', async () => {
    vi.mocked(getCurrentUser).mockReturnValue({ id: 1, username: 'admin', role: 'admin', permissions: [] })
    vi.mocked(isAdmin).mockReturnValue(true)
    vi.mocked(adminApi.monitoredUsers).mockResolvedValue([])
    vi.mocked(adminApi.logs).mockResolvedValue([])

    render(<AdminMonitoringPage />)
    await waitFor(() => {
      expect(adminApi.monitoredUsers).toHaveBeenCalledTimes(1)
    })

    fireEvent.click(screen.getByTestId('admin-refresh'))
    await waitFor(() => {
      expect(adminApi.monitoredUsers).toHaveBeenCalledTimes(2)
    })
  })
})
