import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ChatPanel from '../components/codebaseDetail/ChatPanel'

describe('ChatPanel', () => {
  it('renders user and assistant messages and sends input updates', () => {
    const onChatInputChange = vi.fn()
    const onSendMessage = vi.fn()

    render(
      <ChatPanel
        messages={[
          { role: 'assistant', text: 'assistant text' },
          { role: 'user', text: 'user text' }
        ]}
        chatInput=""
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
      />
    )

    expect(screen.getByText('assistant text')).toBeTruthy()
    expect(screen.getByText('user text')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Ask something...'), { target: { value: 'hi' } })
    expect(onChatInputChange).toHaveBeenCalledWith('hi')

    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSendMessage).toHaveBeenCalledTimes(1)
  })
})
