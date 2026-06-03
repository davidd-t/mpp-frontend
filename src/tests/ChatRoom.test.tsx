import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = []
  url: string
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  readyState = 1
  send = vi.fn()
  close = vi.fn()

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
    setTimeout(() => this.onopen?.(), 0)
  }
}

vi.stubGlobal('WebSocket', MockWebSocket)

// WebSocket.OPEN constant needed by the component
;(MockWebSocket as any).OPEN = 1

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

vi.mock('../auth', () => ({
  getCurrentUser: vi.fn(() => ({ id: 1, username: 'admin', role: 'admin', permissions: [] })),
  getToken: vi.fn(() => 'mock-token'),
}))

import ChatRoom from '../components/ChatRoom'

describe('ChatRoom', () => {
  beforeEach(() => {
    MockWebSocket.instances = []
    vi.clearAllMocks()
  })

  it('renders chat room with input and send button', () => {
    render(<ChatRoom room="test-room" />)
    expect(screen.getByTestId('chat-input')).toBeTruthy()
    expect(screen.getByTestId('chat-send')).toBeTruthy()
  })

  it('connects to websocket with correct URL', () => {
    render(<ChatRoom room="my-room" />)
    expect(MockWebSocket.instances.length).toBe(1)
    expect(MockWebSocket.instances[0].url).toContain('my-room')
    expect(MockWebSocket.instances[0].url).toContain('user_id=1')
  })

  it('sends message via websocket on form submit', async () => {
    render(<ChatRoom room="test-room" />)
    const ws = MockWebSocket.instances[0]

    const input = screen.getByTestId('chat-input')
    fireEvent.change(input, { target: { value: 'Hello world' } })
    fireEvent.click(screen.getByTestId('chat-send'))

    expect(ws.send).toHaveBeenCalled()
    const sent = JSON.parse(ws.send.mock.calls[0][0])
    expect(sent.text).toBe('Hello world')
  })

  it('does not send empty message', () => {
    render(<ChatRoom room="test-room" />)
    const ws = MockWebSocket.instances[0]
    fireEvent.click(screen.getByTestId('chat-send'))
    expect(ws.send).not.toHaveBeenCalled()
  })

  it('displays received messages', async () => {
    render(<ChatRoom room="test-room" />)
    const ws = MockWebSocket.instances[0]

    await act(async () => {
      ws.onmessage?.({ data: JSON.stringify({ type: 'message', username: 'bob', user_id: 2, text: 'hi there', ts: '2024-01-01' }) })
    })

    expect(screen.getByText('hi there')).toBeTruthy()
    expect(screen.getByText('bob')).toBeTruthy()
  })

  it('closes websocket on unmount', () => {
    const { unmount } = render(<ChatRoom room="test-room" />)
    const ws = MockWebSocket.instances[0]
    unmount()
    expect(ws.close).toHaveBeenCalled()
  })
})
