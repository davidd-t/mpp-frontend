import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OfflineBanner from '../components/dashboard/OfflineBanner'

describe('OfflineBanner', () => {
  it('renders nothing when online and no sync status', () => {
    const { container } = render(<OfflineBanner online={true} syncStatus={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows offline warning when not online', () => {
    render(<OfflineBanner online={false} syncStatus={null} />)
    expect(screen.getByText(/you are offline/i)).toBeTruthy()
    expect(screen.getByText(/changes are saved locally/i)).toBeTruthy()
  })

  it('shows sync status message', () => {
    render(<OfflineBanner online={true} syncStatus="Synced 3 items" />)
    expect(screen.getByText('Synced 3 items')).toBeTruthy()
  })

  it('shows both offline and sync status', () => {
    render(<OfflineBanner online={false} syncStatus="Syncing..." />)
    expect(screen.getByText(/you are offline/i)).toBeTruthy()
    expect(screen.getByText('Syncing...')).toBeTruthy()
  })
})
