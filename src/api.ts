const BASE = 'https://mpp-backend-production-d1dc.up.railway.app'
const WS_BASE = 'wss://mpp-backend-production-d1dc.up.railway.app'
const OFFLINE_QUEUE_STORAGE_KEY = 'mpp.offlineQueue'
const LOCAL_STORE_STORAGE_KEY = 'mpp.localStore'

export interface Tag {
  id: string
  codebase_id: string
  label: string
  color: string
}

export interface Codebase {
  id: string
  name: string
  language: string
  files_count: number
  indexed_at: string
  status: 'indexed' | 'indexing' | 'failed'
  path: string
  embedding_model: string
  summary: string
  tags: Tag[]
}

export interface PageResult {
  items: Codebase[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface Stats {
  total: number
  by_language: Record<string, number>
  by_status: Record<string, number>
  total_files: number
  avg_files: number
  tag_stats: { total_tags: number; by_label: Record<string, number> }
}

export interface CreateInput {
  name: string
  language: string
  files_count: number
  status: string
  path: string
  embedding_model: string
  summary: string
}


function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJsonStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota/security failures and keep in-memory behavior.
  }
}


let _online = typeof navigator !== 'undefined' ? navigator.onLine : true
const _listeners: ((online: boolean) => void)[] = []

export function isOnline() {
  return _online
}

export function onOnlineChange(fn: (online: boolean) => void) {
  _listeners.push(fn)
  return () => {
    const idx = _listeners.indexOf(fn)
    if (idx >= 0) _listeners.splice(idx, 1)
  }
}

function setOnline(val: boolean) {
  if (_online !== val) {
    _online = val
    _listeners.forEach((fn) => fn(val))
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setOnline(true))
  window.addEventListener('offline', () => setOnline(false))
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    // Inject JWT Bearer token for authenticated requests.
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('mpp.token')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${BASE}${path}`, {
      headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
      ...init,
    })
    setOnline(true)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail ?? 'Request failed')
    }
    if (res.status === 204) return undefined as T
    return res.json()
  } catch (err: any) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      setOnline(false)
      throw new Error('OFFLINE')
    }
    throw err
  }
}

// --- Offline queue ---

export interface QueuedOp {
  id: string
  type: 'create' | 'update' | 'delete'
  payload: any
  timestamp: number
}

type CreateQueuePayload = {
  data: CreateInput
  clientId?: string
}

type UpdateQueuePayload = {
  id: string
  data: Partial<CreateInput>
}

type DeleteQueuePayload = {
  id: string
}

const _offlineQueue: QueuedOp[] = readJsonStorage<QueuedOp[]>(OFFLINE_QUEUE_STORAGE_KEY, [])
let _syncInFlight: Promise<{ synced: number; failed: number }> | null = null
let _queueModificationQueue: Array<() => void> = []

function persistOfflineQueue() {
  writeJsonStorage(OFFLINE_QUEUE_STORAGE_KEY, _offlineQueue)
}

function resolveCreatePayload(payload: any): CreateQueuePayload {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload as CreateQueuePayload
  }
  return { data: payload as CreateInput }
}

function findPendingCreate(clientId: string): QueuedOp | undefined {
  return _offlineQueue.find((op) => op.type === 'create' && resolveCreatePayload(op.payload).clientId === clientId)
}

export function getOfflineQueue(): QueuedOp[] {
  return [..._offlineQueue]
}

export function addToQueue(op: Omit<QueuedOp, 'id' | 'timestamp'>) {
  // Use a synchronous approach: queue modifications if sync is in progress
  if (_syncInFlight) {
    _queueModificationQueue.push(() => _addToQueueSync(op))
  } else {
    _addToQueueSync(op)
  }
}

function _addToQueueSync(op: Omit<QueuedOp, 'id' | 'timestamp'>) {
  if (op.type === 'update') {
    const payload = op.payload as UpdateQueuePayload
    const pendingCreate = findPendingCreate(payload.id)
    if (pendingCreate) {
      const createPayload = resolveCreatePayload(pendingCreate.payload)
      pendingCreate.payload = {
        ...createPayload,
        data: { ...createPayload.data, ...payload.data },
      }
      persistOfflineQueue()
      return
    }

    for (let i = _offlineQueue.length - 1; i >= 0; i -= 1) {
      const queued = _offlineQueue[i]
      if (queued.type === 'update' && (queued.payload as UpdateQueuePayload).id === payload.id) {
        queued.payload = {
          id: payload.id,
          data: { ...(queued.payload as UpdateQueuePayload).data, ...payload.data },
        }
        queued.timestamp = Date.now()
        persistOfflineQueue()
        return
      }
    }
  }

  if (op.type === 'delete') {
    const payload = op.payload as DeleteQueuePayload
    const pendingCreate = findPendingCreate(payload.id)

    if (pendingCreate) {
      const createPayload = resolveCreatePayload(pendingCreate.payload)
      _offlineQueue.splice(_offlineQueue.indexOf(pendingCreate), 1)
      for (let i = _offlineQueue.length - 1; i >= 0; i -= 1) {
        const queued = _offlineQueue[i]
        if (queued.type === 'update' && (queued.payload as UpdateQueuePayload).id === payload.id) {
          _offlineQueue.splice(i, 1)
        }
      }
      if (createPayload.clientId) {
        removeFromLocalStore(createPayload.clientId)
      }
      persistOfflineQueue()
      return
    }

    for (let i = _offlineQueue.length - 1; i >= 0; i -= 1) {
      const queued = _offlineQueue[i]
      if (queued.type === 'update' && (queued.payload as UpdateQueuePayload).id === payload.id) {
        _offlineQueue.splice(i, 1)
      }
    }

    const hasPendingDelete = _offlineQueue.some((queued) => queued.type === 'delete' && (queued.payload as DeleteQueuePayload).id === payload.id)
    if (hasPendingDelete) {
      persistOfflineQueue()
      return
    }
  }

  _offlineQueue.push({
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  })
  persistOfflineQueue()
}

export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (_syncInFlight) return _syncInFlight

  _syncInFlight = (async () => {
    let totalSynced = 0
    let totalFailed = 0

    while (true) {
      let synced = 0
      let failed = 0
      const tempIdToServerId = new Map<string, string>()

      function isNotFoundError(err: unknown) {
        if (!(err instanceof Error)) return false
        return err.message.toLowerCase().includes('not found')
      }

      while (_offlineQueue.length > 0) {
        const op = _offlineQueue[0]
        try {
          if (op.type === 'create') {
            const payload = resolveCreatePayload(op.payload)
            const created = await api.create(payload.data)
            if (payload.clientId) {
              tempIdToServerId.set(payload.clientId, created.id)
              replaceLocalStoreId(payload.clientId, created)
            } else {
              addToLocalStore(created)
            }
          } else if (op.type === 'update') {
            const payload = op.payload as UpdateQueuePayload
            const id = tempIdToServerId.get(payload.id) ?? payload.id
            if (!id.startsWith('offline-')) {
              await api.update(id, payload.data)
            }
          } else if (op.type === 'delete') {
            const payload = op.payload as DeleteQueuePayload
            const id = tempIdToServerId.get(payload.id) ?? payload.id
            if (!id.startsWith('offline-')) {
              await api.delete(id)
            }
          }
          const processedIndex = _offlineQueue.findIndex((queued) => queued.id === op.id)
          if (processedIndex >= 0) {
            _offlineQueue.splice(processedIndex, 1)
          }
          persistOfflineQueue()
          synced++
        } catch (err) {
          // If an item was removed elsewhere while we were offline, dropping stale
          // update/delete ops keeps the remaining queue syncable.
          if ((op.type === 'update' || op.type === 'delete') && isNotFoundError(err)) {
            const staleIndex = _offlineQueue.findIndex((queued) => queued.id === op.id)
            if (staleIndex >= 0) {
              _offlineQueue.splice(staleIndex, 1)
            }
            persistOfflineQueue()
            synced++
            continue
          }
          failed++
          break
        }
      }
      
      totalSynced += synced
      totalFailed += failed

      // Process any queued modifications that occurred during sync
      if (_queueModificationQueue.length > 0) {
        while (_queueModificationQueue.length > 0) {
          const modification = _queueModificationQueue.shift()!
          modification()
        }
        
        // If there are new items in the queue after processing modifications, 
        // continue syncing instead of returning
        if (_offlineQueue.length > 0 && totalFailed === 0) {
          continue
        }
      }
      
      return { synced: totalSynced, failed: totalFailed }
    }
  })()

  try {
    return await _syncInFlight
  } finally {
    _syncInFlight = null
  }
}

// --- Local offline store ---

const _localStore: Map<string, Codebase> = new Map(
  readJsonStorage<Codebase[]>(LOCAL_STORE_STORAGE_KEY, []).map((item) => [item.id, item] as const),
)

function persistLocalStore() {
  writeJsonStorage(LOCAL_STORE_STORAGE_KEY, Array.from(_localStore.values()))
}

export function getLocalStore(): Codebase[] {
  return Array.from(_localStore.values())
}

export function setLocalStore(items: Codebase[]) {
  _localStore.clear()
  items.forEach((item) => _localStore.set(item.id, item))
  persistLocalStore()
}

export function addToLocalStore(item: Codebase) {
  _localStore.set(item.id, item)
  persistLocalStore()
}

export function updateInLocalStore(id: string, data: Partial<CreateInput>) {
  const existing = _localStore.get(id)
  if (existing) {
    _localStore.set(id, { ...existing, ...data } as Codebase)
    persistLocalStore()
  }
}

export function removeFromLocalStore(id: string) {
  _localStore.delete(id)
  persistLocalStore()
}

export function clearLocalData() {
  _localStore.clear()
  persistLocalStore()
  _offlineQueue.length = 0
  persistOfflineQueue()
}

export function replaceLocalStoreId(oldId: string, item: Codebase) {
  _localStore.delete(oldId)
  _localStore.set(item.id, item)
  persistLocalStore()
}

// --- WebSocket ---

let _ws: WebSocket | null = null
let _wsListeners: ((data: any) => void)[] = []

export function connectWebSocket() {
  if (_ws && _ws.readyState <= 1) return

  try {
    _ws = new WebSocket(`${WS_BASE}/codebases/ws`)

    _ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        _wsListeners.forEach((fn) => fn(data))
      } catch { /* ignore */ }
    }

    _ws.onclose = () => {
      setTimeout(connectWebSocket, 3000)
    }

    _ws.onerror = () => {
      _ws?.close()
    }
  } catch { /* ignore */ }
}

export function onWebSocketMessage(fn: (data: any) => void) {
  _wsListeners.push(fn)
  return () => {
    _wsListeners = _wsListeners.filter((l) => l !== fn)
  }
}

// --- REST API ---

export const api = {
  list(page: number, pageSize: number, search: string): Promise<PageResult> {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      search,
    })
    return request(`/codebases/?${params}`)
  },

  get(id: string): Promise<Codebase> {
    return request(`/codebases/${id}`)
  },

  create(data: CreateInput): Promise<Codebase> {
    return request('/codebases/', { method: 'POST', body: JSON.stringify(data) })
  },

  update(id: string, data: Partial<CreateInput>): Promise<Codebase> {
    return request(`/codebases/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  delete(id: string): Promise<void> {
    return request(`/codebases/${id}`, { method: 'DELETE' })
  },

  stats(): Promise<Stats> {
    return request('/codebases/stats')
  },

  startGenerator(): Promise<{ status: string }> {
    return request('/codebases/generate/start', { method: 'POST' })
  },

  stopGenerator(): Promise<{ status: string }> {
    return request('/codebases/generate/stop', { method: 'POST' })
  },

  // --- Tag API (1-to-many) ---

  listTags(codebaseId: string): Promise<Tag[]> {
    return request(`/codebases/${codebaseId}/tags`)
  },

  createTag(codebaseId: string, data: { label: string; color: string }): Promise<Tag> {
    return request(`/codebases/${codebaseId}/tags`, { method: 'POST', body: JSON.stringify(data) })
  },

  updateTag(tagId: string, data: { label?: string; color?: string }): Promise<Tag> {
    return request(`/codebases/tags/${tagId}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  deleteTag(tagId: string): Promise<void> {
    return request(`/codebases/tags/${tagId}`, { method: 'DELETE' })
  },
}

// --- GraphQL client ---

async function gqlRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(`${BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  setOnline(true)
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

export const gql = {
  async listCodebases(page: number, pageSize: number, search: string): Promise<PageResult> {
    const data = await gqlRequest<any>(`
      query($page: Int!, $pageSize: Int!, $search: String!) {
        codebases(page: $page, pageSize: $pageSize, search: $search) {
          items {
            id name language filesCount indexedAt status path embeddingModel summary
            tags { id codebaseId label color }
          }
          page pageSize total totalPages
        }
      }
    `, { page, pageSize, search })
    const result = data.codebases
    return {
      items: result.items.map((i: any) => ({
        id: i.id,
        name: i.name,
        language: i.language,
        files_count: i.filesCount,
        indexed_at: i.indexedAt,
        status: i.status,
        path: i.path,
        embedding_model: i.embeddingModel,
        summary: i.summary,
        tags: (i.tags || []).map((t: any) => ({
          id: t.id,
          codebase_id: t.codebaseId,
          label: t.label,
          color: t.color,
        })),
      })),
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
      total_pages: result.totalPages,
    }
  },

  async getStats(): Promise<Stats> {
    const data = await gqlRequest<any>(`
      query {
        stats {
          total byLanguage byStatus totalFiles avgFiles
          tagStats { totalTags byLabel }
        }
      }
    `)
    const s = data.stats
    return {
      total: s.total,
      by_language: s.byLanguage,
      by_status: s.byStatus,
      total_files: s.totalFiles,
      avg_files: s.avgFiles,
      tag_stats: { total_tags: s.tagStats.totalTags, by_label: s.tagStats.byLabel },
    }
  },

  async createCodebase(input: CreateInput): Promise<Codebase> {
    const data = await gqlRequest<any>(`
      mutation($input: CodebaseInput!) {
        createCodebase(input: $input) {
          id name language filesCount indexedAt status path embeddingModel summary
          tags { id codebaseId label color }
        }
      }
    `, {
      input: {
        name: input.name,
        language: input.language,
        filesCount: input.files_count,
        status: input.status,
        path: input.path,
        embeddingModel: input.embedding_model,
        summary: input.summary,
      },
    })
    const c = data.createCodebase
    return {
      id: c.id, name: c.name, language: c.language,
      files_count: c.filesCount, indexed_at: c.indexedAt, status: c.status,
      path: c.path, embedding_model: c.embeddingModel, summary: c.summary,
      tags: (c.tags || []).map((t: any) => ({ id: t.id, codebase_id: t.codebaseId, label: t.label, color: t.color })),
    }
  },

  async deleteCodebase(id: string): Promise<boolean> {
    const data = await gqlRequest<any>(`
      mutation($id: String!) { deleteCodebase(id: $id) }
    `, { id })
    return data.deleteCodebase
  },
}


// ── Admin endpoints (Gold) ─────────────────────────────────────

export interface MonitoredUser {
  user_id: number
  username: string
  role_name: string
  reason: string
  action_count: number
  first_flagged_at: string
  last_flagged_at: string
}

export interface LogEntry {
  id: number
  user_id: number
  username: string
  role_name: string
  action_info: string
  http_method: string
  path: string
  ts: string
}

export const adminApi = {
  monitoredUsers: (noScan = false) =>
    request<MonitoredUser[]>(`/admin/monitored-users${noScan ? '?no_scan=true' : ''}`),
  clearMonitored: (userId: number) => request<void>(`/admin/monitored-users/${userId}`, { method: 'DELETE' }),
  logs: (userId?: number, limit = 100) => {
    const q = new URLSearchParams()
    if (userId !== undefined) q.set('user_id', String(userId))
    q.set('limit', String(limit))
    return request<LogEntry[]>(`/admin/logs?${q.toString()}`)
  },
}
