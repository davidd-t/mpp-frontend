import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardFormPanel from '../components/dashboard/DashboardFormPanel'

describe('DashboardFormPanel', () => {
  it('renders nothing when both create and edit are off', () => {
    const { container } = render(
      <DashboardFormPanel
        showCreate={false}
        editingItem={null}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onCancelForm={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('submits create mode through onAdd', () => {
    const onAdd = vi.fn()

    render(
      <DashboardFormPanel
        showCreate
        editingItem={null}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onCancelForm={vi.fn()}
      />
    )

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'new-item' } })
    fireEvent.change(textboxes[1], { target: { value: 'TypeScript' } })
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } })
    fireEvent.change(textboxes[2], { target: { value: 'src/new-item' } })
    fireEvent.change(textboxes[3], { target: { value: 'text-embedding-3-small' } })
    fireEvent.change(textboxes[4], { target: { value: 'Valid summary text' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('submits edit mode through onUpdate', () => {
    const onUpdate = vi.fn()

    render(
      <DashboardFormPanel
        showCreate={false}
        editingItem={{
          id: 'c1',
          name: 'api-gateway',
          language: 'TypeScript',
          filesCount: 1,
          status: 'indexed',
          path: 'src/api-gateway',
          embeddingModel: 'text-embedding-3-small',
          summary: 'old summary'
        }}
        onAdd={vi.fn()}
        onUpdate={onUpdate}
        onCancelForm={vi.fn()}
      />
    )

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '22' } })
    fireEvent.change(screen.getAllByRole('textbox')[4], { target: { value: 'new summary text' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate.mock.calls[0][0]).toBe('c1')
  })
})
