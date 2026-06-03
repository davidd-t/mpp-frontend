import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import DashboardHeader from '../components/dashboard/DashboardHeader'

describe('DashboardHeader', () => {
  const defaultProps = {
    onToggleCreate: vi.fn(),
    onToggleAutoPopulate: vi.fn(),
    isAutoPopulateOn: false,
    online: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading', () => {
    render(<DashboardHeader {...defaultProps} />)
    expect(screen.getByText('Codebases')).toBeTruthy()
  })

  it('calls onToggleCreate when add button clicked', () => {
    render(<DashboardHeader {...defaultProps} />)
    fireEvent.click(screen.getByText('+ Add codebase'))
    expect(defaultProps.onToggleCreate).toHaveBeenCalled()
  })

  it('shows Start Generator when not generating', () => {
    render(<DashboardHeader {...defaultProps} isAutoPopulateOn={false} />)
    expect(screen.getByText(/start generator/i)).toBeTruthy()
  })

  it('shows Stop Generator when generating', () => {
    render(<DashboardHeader {...defaultProps} isAutoPopulateOn={true} />)
    expect(screen.getByText(/stop generator/i)).toBeTruthy()
  })

  it('calls onToggleAutoPopulate when generator button clicked', () => {
    render(<DashboardHeader {...defaultProps} />)
    fireEvent.click(screen.getByText(/start generator/i))
    expect(defaultProps.onToggleAutoPopulate).toHaveBeenCalled()
  })

  it('disables generator button when offline', () => {
    render(<DashboardHeader {...defaultProps} online={false} />)
    const btn = screen.getByText(/start generator/i)
    expect(btn.closest('button')?.disabled).toBe(true)
  })
})
