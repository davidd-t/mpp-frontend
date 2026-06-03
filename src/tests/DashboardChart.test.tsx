import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../api', () => ({
  api: {
    stats: vi.fn(),
  },
}))

import DashboardChart from '../components/dashboard/DashboardChart'
import { api } from '../api'

describe('DashboardChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    vi.mocked(api.stats).mockReturnValue(new Promise(() => {})) // never resolves
    render(<DashboardChart refreshKey={0} />)
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('displays language bars when stats load', async () => {
    vi.mocked(api.stats).mockResolvedValue({
      total: 5,
      by_language: { TypeScript: 3, Python: 2 },
      by_status: { indexed: 5 },
      total_files: 100,
      avg_files: 20,
      tag_stats: { total_tags: 2, by_label: { production: 1, dev: 1 } },
    })

    render(<DashboardChart refreshKey={0} />)
    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeTruthy()
    })
    expect(screen.getByText('Python')).toBeTruthy()
    expect(screen.getByText('3 repos')).toBeTruthy()
    expect(screen.getByText('2 repos')).toBeTruthy()
  })

  it('shows no data message for empty stats', async () => {
    vi.mocked(api.stats).mockResolvedValue({
      total: 0,
      by_language: {},
      by_status: {},
      total_files: 0,
      avg_files: 0,
      tag_stats: { total_tags: 0, by_label: {} },
    })

    render(<DashboardChart refreshKey={0} />)
    await waitFor(() => {
      expect(screen.getByText('No data available.')).toBeTruthy()
    })
  })

  it('refetches when refreshKey changes', async () => {
    vi.mocked(api.stats).mockResolvedValue({
      total: 1,
      by_language: { Go: 1 },
      by_status: { indexed: 1 },
      total_files: 10,
      avg_files: 10,
      tag_stats: { total_tags: 0, by_label: {} },
    })

    const { rerender } = render(<DashboardChart refreshKey={0} />)
    await waitFor(() => expect(api.stats).toHaveBeenCalledTimes(1))

    rerender(<DashboardChart refreshKey={1} />)
    await waitFor(() => expect(api.stats).toHaveBeenCalledTimes(2))
  })

  it('handles API error gracefully', async () => {
    vi.mocked(api.stats).mockRejectedValue(new Error('fail'))
    render(<DashboardChart refreshKey={0} />)
    // Should show loading (null stats means loading display)
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeTruthy()
    })
  })
})
