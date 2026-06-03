import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppContent from '../components/AppContent'
import * as auth from '../auth'

// Mock getCurrentUser — tests for protected routes set it to a logged-in user
vi.spyOn(auth, 'getCurrentUser')

function createAppStub(overrides = {}) {
  return {
    codebases: [],
    rows: [],
    search: '',
    safePage: 1,
    totalPages: 1,
    showCreate: false,
    isPopulating: false,
    isAutoPopulateOn: false,
    online: true,
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
      populateWithFaker: vi.fn(),
      toggleAutoPopulate: vi.fn(),
      setChatInput: vi.fn(),
      sendMessage: vi.fn()
    },
    ...overrides
  }
}

describe('AppContent route rendering', () => {
  const fakeUser = { id: 1, username: 'alice', role: 'user' as const, permissions: ['codebase.read'] }

  beforeEach(() => {
    // Default: logged in. Override per test if needed.
    ;(auth.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue(fakeUser)
  })

  it('renders home page for root route', () => {
    render(<AppContent route="/" app={createAppStub()} />)
    expect(screen.getByText('Your Hub for Code')).toBeTruthy()
  })

  it('renders auth page for login route', () => {
    ;(auth.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue(null)
    render(<AppContent route="/login" app={createAppStub()} />)
    expect(screen.getByText('Welcome back')).toBeTruthy()
  })

  it('renders auth page for register route', () => {
    ;(auth.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue(null)
    render(<AppContent route="/register" app={createAppStub()} />)
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeTruthy()
  })

  it('redirects to login when not authenticated', () => {
    ;(auth.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue(null)
    const { container } = render(<AppContent route="/dashboard" app={createAppStub()} />)
    expect(container.innerHTML).toBe('')
    expect(window.location.hash).toBe('#/login')
  })

  it('renders dashboard route', () => {
    render(<AppContent route="/dashboard" app={createAppStub()} />)
    expect(screen.getByText('Codebases')).toBeTruthy()
  })

  it('wires dashboard actions from controls', () => {
    const app = createAppStub({
      safePage: 2,
      totalPages: 3,
      rows: [
        {
          id: 'c1',
          name: 'api-gateway',
          language: 'TypeScript',
          status: 'indexed',
          filesCount: 10,
          indexedAt: '2026-03-01'
        }
      ]
    })

    render(<AppContent route="/dashboard" app={app} />)

    fireEvent.click(screen.getByRole('button', { name: '+ Add codebase' }))
    expect(app.actions.setShowCreate).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /start generator/i }))
    expect(app.actions.toggleAutoPopulate).toHaveBeenCalledTimes(1)

    fireEvent.change(screen.getByPlaceholderText('Search codebases...'), {
      target: { value: 'api' }
    })
    expect(app.actions.setSearch).toHaveBeenCalledWith('api')
    expect(app.actions.setPage).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(app.actions.setEditingId).toHaveBeenCalledWith('c1')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(app.actions.deleteCodebase).toHaveBeenCalledWith('c1')
  })

  it('wires cancel form callback to reset create/edit state', () => {
    const app = createAppStub({ showCreate: true })

    render(<AppContent route="/dashboard" app={app} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(app.actions.setShowCreate).toHaveBeenCalledWith(false)
    expect(app.actions.setEditingId).toHaveBeenCalledWith(null)
  })

  it('renders detail route when detailId exists', () => {
    render(
      <AppContent
        route="/codebases/c1"
        app={createAppStub({
          detailId: 'c1',
          detailItem: {
            id: 'c1',
            name: 'api-gateway',
            summary: 'summary',
            language: 'TypeScript',
            filesCount: 2
          },
          messages: [{ role: 'assistant', text: 'hello' }],
          chatInput: ''
        })}
      />
    )

    expect(screen.getByText('api-gateway')).toBeTruthy()
    expect(screen.getByText('RAG Chat Interface')).toBeTruthy()
  })

  it('returns null for unknown route without detail id', () => {
    const { container } = render(<AppContent route="/unknown" app={createAppStub()} />)
    expect(container.firstChild).toBeNull()
  })
})
