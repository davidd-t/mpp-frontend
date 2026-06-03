import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import * as auth from '../auth'

vi.mock('../hooks/useHashRoute', () => ({
  default: () => '/dashboard'
}))

vi.mock('../hooks/useAppState', () => ({
  default: () => ({
    codebases: [],
    rows: [],
    search: '',
    safePage: 1,
    totalPages: 1,
    showCreate: false,
    editingItem: null,
    detailId: null,
    detailItem: null,
    messages: [],
    chatInput: '',
    actions: {
      setShowCreate: vi.fn(),
      setSearch: vi.fn(),
      setPage: vi.fn(),
      setEditingId: vi.fn(),
      deleteCodebase: vi.fn(),
      addCodebase: vi.fn(),
      updateCodebase: vi.fn(),
      setChatInput: vi.fn(),
      sendMessage: vi.fn()
    }
  })
}))

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(auth, 'getCurrentUser').mockReturnValue({
      id: 1, username: 'alice', role: 'user', permissions: ['codebase.read']
    })
  })

  it('renders header and route content', () => {
    render(<App />)

    expect(screen.getByText('SourceStream')).toBeTruthy()
    expect(screen.getByText('Codebases')).toBeTruthy()
  })
})
