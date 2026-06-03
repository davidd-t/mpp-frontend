import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardPagination from '../components/dashboard/DashboardPagination'

describe('DashboardPagination', () => {
  it('disables prev on first page and enables next', () => {
    const onPrevPage = vi.fn()
    const onNextPage = vi.fn()

    render(<DashboardPagination safePage={1} totalPages={3} onPrevPage={onPrevPage} onNextPage={onNextPage} />)

    const prev = screen.getByRole('button', { name: 'Prev' }) as HTMLButtonElement
    const next = screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement

    expect(prev.disabled).toBe(true)
    expect(next.disabled).toBe(false)

    fireEvent.click(next)
    expect(onNextPage).toHaveBeenCalledTimes(1)
  })

  it('disables next on last page', () => {
    const onPrevPage = vi.fn()
    const onNextPage = vi.fn()

    render(<DashboardPagination safePage={3} totalPages={3} onPrevPage={onPrevPage} onNextPage={onNextPage} />)

    const prev = screen.getByRole('button', { name: 'Prev' }) as HTMLButtonElement
    const next = screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement

    expect(prev.disabled).toBe(false)
    expect(next.disabled).toBe(true)

    fireEvent.click(prev)
    expect(onPrevPage).toHaveBeenCalledTimes(1)
  })
})
