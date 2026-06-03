import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import useAppState from '../hooks/useAppState'

const mockApi = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  stats: vi.fn()
}))

vi.mock('../api', () => ({
  api: mockApi,
  isOnline: vi.fn(() => true),
  onOnlineChange: vi.fn(() => vi.fn()),
  addToQueue: vi.fn(),
  syncOfflineQueue: vi.fn(async () => ({ synced: 0, failed: 0 })),
  getLocalStore: vi.fn(() => []),
  setLocalStore: vi.fn(),
  addToLocalStore: vi.fn(),
  updateInLocalStore: vi.fn(),
  removeFromLocalStore: vi.fn(),
  replaceLocalStoreId: vi.fn(),
  connectWebSocket: vi.fn(),
  onWebSocketMessage: vi.fn(() => vi.fn()),
}))

const SEED = [
  {
    id: 'c1',
    name: 'api-gateway',
    language: 'TypeScript',
    files_count: 247,
    indexed_at: '2026-03-08',
    status: 'indexed',
    path: 'src/api-gateway',
    embedding_model: 'text-embedding-3-large',
    summary: 'Central API gateway handling auth, routing, and rate limiting.'
  },
  {
    id: 'c2',
    name: 'ml-pipeline',
    language: 'Python',
    files_count: 892,
    indexed_at: '2025-11-12',
    status: 'indexed',
    path: 'src/ml-pipeline',
    embedding_model: 'text-embedding-3-small',
    summary: 'Data preprocessing, feature extraction, and model training flow.'
  },
  {
    id: 'c3',
    name: 'web-client',
    language: 'C#',
    files_count: 1200,
    indexed_at: '2026-01-07',
    status: 'indexing',
    path: 'src/web-client',
    embedding_model: 'text-embedding-3-large',
    summary: 'Frontend client with auth pages, dashboard pages, and API calls.'
  }
]

function makePageResult(items = SEED) {
  return { items, page: 1, page_size: 5, total: items.length, total_pages: 1 }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockApi.list.mockResolvedValue(makePageResult())
  mockApi.get.mockResolvedValue(SEED[0])
  mockApi.stats.mockResolvedValue({
    total: 3,
    by_language: { TypeScript: 1, Python: 1, 'C#': 1 },
    by_status: { indexed: 2, indexing: 1, failed: 0 },
    total_files: 2339,
    avg_files: 779.67
  })
  mockApi.create.mockImplementation(async (data: any) => ({
    id: 'new-id',
    indexed_at: '2026-04-07',
    ...data
  }))
  mockApi.update.mockImplementation(async (_id: any, data: any) => ({
    ...SEED[0],
    ...data
  }))
  mockApi.delete.mockResolvedValue(undefined)
})

describe('useAppState', () => {
  it('loads codebases from the API on mount', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))

    await waitFor(() => {
      expect(result.current.rows.length).toBe(3)
    })

    expect(mockApi.list).toHaveBeenCalled()
  })

  it('creates a codebase via the API', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    const newItem = {
      id: 'new-id',
      name: 'new-service',
      language: 'TypeScript',
      files_count: 50,
      indexed_at: '2026-04-07',
      status: 'indexed',
      path: 'src/new-service',
      embedding_model: 'text-embedding-3-small',
      summary: 'New service for CRUD flow tests'
    }
    mockApi.create.mockResolvedValueOnce(newItem)
    mockApi.list.mockResolvedValue(makePageResult([...SEED, newItem]))

    await act(async () => {
      await result.current.actions.addCodebase({
        name: 'new-service',
        language: 'TypeScript',
        filesCount: 50,
        status: 'indexed',
        path: 'src/new-service',
        embeddingModel: 'text-embedding-3-small',
        summary: 'New service for CRUD flow tests'
      })
    })

    expect(mockApi.create).toHaveBeenCalled()
  })

  it('updates a codebase via the API', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    await act(async () => {
      await result.current.actions.updateCodebase('c1', {
        name: 'renamed-gateway',
        language: 'TypeScript',
        filesCount: 247,
        status: 'indexed',
        path: 'src/api-gateway',
        embeddingModel: 'text-embedding-3-large',
        summary: 'Updated summary for gateway'
      })
    })

    expect(mockApi.update).toHaveBeenCalledWith('c1', expect.objectContaining({ name: 'renamed-gateway' }))
  })

  it('deletes a codebase via the API', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    await act(async () => {
      await result.current.actions.deleteCodebase('c1')
    })

    expect(mockApi.delete).toHaveBeenCalledWith('c1')
  })

  it('redirects to dashboard when deleting current detail item', async () => {
    window.location.hash = '#/codebases/c1'
    const { result } = renderHook(() => useAppState('/codebases/c1'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    await act(async () => {
      await result.current.actions.deleteCodebase('c1')
    })

    expect(window.location.hash).toBe('#/dashboard')
  })

  it('handles chat send message flow', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    const initialMessages = result.current.messages.length

    act(() => { result.current.actions.sendMessage() })
    expect(result.current.messages.length).toBe(initialMessages)

    act(() => { result.current.actions.setChatInput('How many files?') })
    act(() => { result.current.actions.sendMessage() })

    expect(result.current.messages.length).toBe(initialMessages + 2)
    expect(result.current.messages.at(-2)?.role).toBe('user')
    expect(result.current.messages.at(-1)?.role).toBe('assistant')
    expect(result.current.chatInput).toBe('')
  })

  it('keeps editingItem null when editing id is missing', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    act(() => { result.current.actions.setEditingId('missing-id') })

    expect(result.current.editingItem).toBeNull()
  })

  it('toggles auto-populater flag', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    act(() => { result.current.actions.toggleAutoPopulate() })
    expect(result.current.isAutoPopulateOn).toBe(true)

    act(() => { result.current.actions.toggleAutoPopulate() })
    expect(result.current.isAutoPopulateOn).toBe(false)
  })

  it('shows/hides create form', async () => {
    const { result } = renderHook(() => useAppState('/dashboard'))
    await waitFor(() => expect(result.current.rows.length).toBe(3))

    expect(result.current.showCreate).toBe(false)
    act(() => { result.current.actions.setShowCreate(true) })
    expect(result.current.showCreate).toBe(true)
  })

  it('searches by passing search to the API', async () => {
    mockApi.list.mockResolvedValue(makePageResult([SEED[1]]))

    const { result } = renderHook(() => useAppState('/dashboard'))

    await act(async () => {
      result.current.actions.setSearch('python')
    })

    await waitFor(() => {
      expect(mockApi.list).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 'python')
    })
  })
})
