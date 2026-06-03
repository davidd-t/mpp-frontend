import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CodebaseForm from '../CodebaseForm'

describe('CodebaseForm', () => {
  it('shows validation errors and prevents invalid submit', () => {
    const onSubmit = vi.fn()
    render(<CodebaseForm initialValues={undefined} onSubmit={onSubmit} onCancel={vi.fn()} />)

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'ab' } })
    fireEvent.change(textboxes[1], { target: { value: '' } })
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-1' } })
    fireEvent.change(textboxes[2], { target: { value: '' } })
    fireEvent.change(textboxes[3], { target: { value: '' } })
    fireEvent.change(textboxes[4], { target: { value: 'bad' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Name must have at least 3 characters')).toBeTruthy()
    expect(screen.getByText('Language is required')).toBeTruthy()
    expect(screen.getByText('Files must be an integer >= 0')).toBeTruthy()
  })

  it('submits valid data and supports cancel callback', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    render(<CodebaseForm initialValues={undefined} onSubmit={onSubmit} onCancel={onCancel} />)

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'backend-api' } })
    fireEvent.change(textboxes[1], { target: { value: 'TypeScript' } })
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'failed' } })
    fireEvent.change(textboxes[2], { target: { value: 'src/backend-api' } })
    fireEvent.change(textboxes[3], { target: { value: 'text-embedding-3-large' } })
    fireEvent.change(textboxes[4], { target: { value: 'Valid summary for create form' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
