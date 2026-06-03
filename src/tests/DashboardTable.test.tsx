import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardTable from '../components/dashboard/DashboardTable'

const rows = [
  {
    id: 'c1',
    name: 'api-gateway',
    language: 'TypeScript',
    status: 'indexed',
    filesCount: 247,
    indexedAt: '2026-03-08'
  }
]

describe('DashboardTable', () => {
  it('opens detail and triggers update/delete callbacks', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    window.location.hash = ''
    render(<DashboardTable rows={rows} onEdit={onEdit} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'api-gateway' }))
    expect(window.location.hash).toBe('#/codebases/c1')

    fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(onEdit).toHaveBeenCalledWith('c1')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('c1')
  })
})
