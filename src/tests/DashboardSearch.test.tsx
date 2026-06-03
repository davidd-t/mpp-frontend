import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardSearch from '../components/dashboard/DashboardSearch'

describe('DashboardSearch', () => {
  it('forwards input changes', () => {
    const onSearchChange = vi.fn()

    render(<DashboardSearch search="" onSearchChange={onSearchChange} />)

    fireEvent.change(screen.getByPlaceholderText('Search codebases...'), {
      target: { value: 'api' }
    })

    expect(onSearchChange).toHaveBeenCalledWith('api')
  })
})
