import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DetailHeader from '../components/codebaseDetail/DetailHeader'

describe('DetailHeader', () => {
  it('navigates back to dashboard and deletes detail item', () => {
    const onDelete = vi.fn()

    window.location.hash = ''
    render(
      <DetailHeader
        detailItem={{ id: 'c1', name: 'api-gateway', summary: 'summary' }}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Back to dashboard' }))
    expect(window.location.hash).toBe('#/dashboard')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('c1')
  })

  it('renders fallback summary and no delete when missing detail', () => {
    render(<DetailHeader detailItem={null} onDelete={vi.fn()} />)

    expect(screen.getByText('Codebase not found')).toBeTruthy()
    expect(screen.getByText('No summary available.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  })
})
