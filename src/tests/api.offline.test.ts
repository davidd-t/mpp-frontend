import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockResponseBody = Record<string, unknown>

function mockJsonResponse(status: number, body: MockResponseBody) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function createStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe('offline queue sync', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()

    const storage = createStorageMock()
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true,
    })
  })

  it('syncs delete+create once when sync is triggered concurrently', async () => {
    const calls: string[] = []

    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (url.endsWith('/codebases/c1') && method === 'DELETE') {
        calls.push('delete')
        return mockJsonResponse(404, { detail: 'Codebase not found' })
      }

      if (url.endsWith('/codebases/') && method === 'POST') {
        calls.push('create')
        const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>
        return mockJsonResponse(201, {
          id: 'srv-1',
          indexed_at: '2026-04-21',
          tags: [],
          ...body,
        })
      }

      throw new Error(`Unexpected request: ${method} ${url}`)
    }))

    const { addToQueue, getLocalStore, getOfflineQueue, syncOfflineQueue } = await import('../api')

    addToQueue({ type: 'delete', payload: { id: 'c1' } })
    addToQueue({
      type: 'create',
      payload: {
        clientId: 'offline-123',
        data: {
          name: 'offline-added',
          language: 'TypeScript',
          files_count: 42,
          status: 'indexed',
          path: 'src/offline-added',
          embedding_model: 'text-embedding-3-small',
          summary: 'created while offline',
        },
      },
    })

    const [first, second] = await Promise.all([syncOfflineQueue(), syncOfflineQueue()])

    expect(first).toEqual({ synced: 2, failed: 0 })
    expect(second).toEqual({ synced: 2, failed: 0 })
    expect(calls.filter((c) => c === 'delete')).toHaveLength(1)
    expect(calls.filter((c) => c === 'create')).toHaveLength(1)
    expect(getOfflineQueue()).toHaveLength(0)
    expect(getLocalStore().some((item) => item.id === 'srv-1')).toBe(true)
  })

  it('delete multiple files offline then add one file - user scenario', async () => {
    const calls: string[] = []
    let createCallCount = 0

    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (method === 'DELETE' && url.includes('/codebases/')) {
        const id = url.split('/').pop()
        calls.push(`delete-${id}`)
        return mockJsonResponse(204, {})
      }

      if (url.endsWith('/codebases/') && method === 'POST') {
        calls.push('create')
        createCallCount++
        const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>
        // Simulate slow network
        await new Promise(resolve => setTimeout(resolve, 10))
        return mockJsonResponse(201, {
          id: `srv-${createCallCount}`,
          indexed_at: '2026-04-21',
          tags: [],
          ...body,
        })
      }

      throw new Error(`Unexpected request: ${method} ${url}`)
    }))

    const { addToQueue, getOfflineQueue, syncOfflineQueue, getLocalStore } = await import('../api')

    // Simulate user deleting 3 server files
    addToQueue({ type: 'delete', payload: { id: 'srv-file-1' } })
    addToQueue({ type: 'delete', payload: { id: 'srv-file-2' } })
    addToQueue({ type: 'delete', payload: { id: 'srv-file-3' } })

    // Then add 1 new file
    addToQueue({
      type: 'create',
      payload: {
        clientId: 'offline-new',
        data: {
          name: 'newly-added',
          language: 'Python',
          files_count: 5,
          status: 'indexed',
          path: '/new/path',
          embedding_model: 'text-embedding-3-small',
          summary: 'added while offline',
        },
      },
    })

    // Queue should have 4 operations
    expect(getOfflineQueue()).toHaveLength(4)

    // Sync should process all 4 operations
    const result = await syncOfflineQueue()
    
    expect(result.synced).toBe(4)
    expect(result.failed).toBe(0)
    expect(getOfflineQueue()).toHaveLength(0)
    expect(calls).toContain('delete-srv-file-1')
    expect(calls).toContain('delete-srv-file-2')
    expect(calls).toContain('delete-srv-file-3')
    expect(calls).toContain('create')
    
    // Local store should only have the newly created item
    const localStore = getLocalStore()
    expect(localStore).toHaveLength(1)
    expect(localStore[0].id).toBe('srv-1')
    expect(localStore[0].name).toBe('newly-added')
  })

  it('handles concurrent queue modifications during sync correctly', async () => {
    const calls: string[] = []
    let createCallCount = 0
    let deletePending = false

    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (method === 'DELETE' && url.includes('/codebases/')) {
        const id = url.split('/').pop()
        calls.push(`delete-${id}`)
        // Simulate network delay during delete to trigger race condition
        deletePending = true
        await new Promise(resolve => setTimeout(resolve, 50))
        deletePending = false
        return mockJsonResponse(204, {})
      }

      if (url.endsWith('/codebases/') && method === 'POST') {
        calls.push('create')
        createCallCount++
        const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>
        return mockJsonResponse(201, {
          id: `srv-${createCallCount}`,
          indexed_at: '2026-04-21',
          tags: [],
          ...body,
        })
      }

      throw new Error(`Unexpected request: ${method} ${url}`)
    }))

    const { addToQueue, getOfflineQueue, syncOfflineQueue, getLocalStore } = await import('../api')

    // Add initial operations
    addToQueue({ type: 'delete', payload: { id: 'srv-file-1' } })
    addToQueue({
      type: 'create',
      payload: {
        clientId: 'offline-123',
        data: {
          name: 'test-item',
          language: 'Python',
          files_count: 5,
          status: 'indexed',
          path: '/test',
          embedding_model: 'text-embedding-3-small',
          summary: 'test',
        },
      },
    })

    // Start sync but don't await yet
    const syncPromise = syncOfflineQueue()

    // While sync is in progress (delete pending), add more operations
    // This tests that queue modifications are properly queued
    await new Promise(resolve => setTimeout(resolve, 20)) // Let delete start
    
    addToQueue({ type: 'delete', payload: { id: 'srv-file-2' } })

    // Wait for sync to complete
    const result = await syncPromise

    expect(result.synced).toBe(3)
    expect(result.failed).toBe(0)
    // The queue should be empty after sync processes all queued modifications
    expect(getOfflineQueue()).toHaveLength(0)
    expect(calls).toContain('delete-srv-file-1')
    expect(calls).toContain('delete-srv-file-2')
    expect(calls).toContain('create')

    const localStore = getLocalStore()
    expect(localStore.some((item) => item.id === 'srv-1')).toBe(true)
  })
})
