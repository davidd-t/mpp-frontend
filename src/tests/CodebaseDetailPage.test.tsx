import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CodebaseDetailPage from '../components/CodebaseDetailPage'

describe('CodebaseDetailPage', () => {
  it('renders fallback state when detail is missing', () => {
    render(
      <CodebaseDetailPage
        detailItem={null}
        messages={[]}
        chatInput=""
        onChatInputChange={vi.fn()}
        onSendMessage={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Codebase not found')).toBeTruthy()
    expect(screen.queryByText('RAG Chat Interface')).toBeNull()
  })

  it('renders full detail view and dispatches actions', () => {
    const onDelete = vi.fn()
    const onChatInputChange = vi.fn()
    const onSendMessage = vi.fn()

    render(
      <CodebaseDetailPage
        detailItem={{
          id: 'c1',
          name: 'api-gateway',
          summary: 'Gateway summary',
          language: 'TypeScript',
          filesCount: 247
        }}
        messages={[{ role: 'assistant', text: 'Hello from assistant' }]}
        chatInput="question"
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('api-gateway')).toBeTruthy()
    expect(screen.getByText('Files')).toBeTruthy()
    expect(screen.getByText('Code view')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('c1')

    fireEvent.change(screen.getByPlaceholderText('Ask something...'), { target: { value: 'new question' } })
    expect(onChatInputChange).toHaveBeenCalledWith('new question')

    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSendMessage).toHaveBeenCalledTimes(1)
  })
})
