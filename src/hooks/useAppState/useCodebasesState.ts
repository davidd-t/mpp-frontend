import { useCallback, useEffect, useRef, useState } from 'react'
import {
  api, type Codebase,
  isOnline, onOnlineChange,
  addToQueue, syncOfflineQueue,
  getLocalStore, setLocalStore, addToLocalStore,
  updateInLocalStore, removeFromLocalStore,
  connectWebSocket, onWebSocketMessage,
} from '../../api'
import { PAGE_SIZE } from '../../model'

const LIVE_REFRESH_EVENTS = new Set([
  'batch_created',
  'codebase_created',
  'codebase_updated',
  'codebase_deleted',
  'tag_changed',
])

function toFrontend(cb: Codebase) {
  return {
    id: cb.id,
    name: cb.name,
    language: cb.language,
    filesCount: cb.files_count,
    indexedAt: cb.indexed_at,
    status: cb.status,
    path: cb.path,
    embeddingModel: cb.embedding_model,
    summary: cb.summary,
    tags: cb.tags || [],
  }
}

function toBackend(values: any) {
  return {
    name: values.name,
    language: values.language,
    files_count: values.filesCount,
    status: values.status,
    path: values.path,
    embedding_model: values.embeddingModel,
    summary: values.summary,
  }
}

export default function useCodebasesState() {
  const [allRows, setAllRows] = useState<ReturnType<typeof toFrontend>[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPopulating] = useState(false)
  const [isAutoPopulateOn, setIsAutoPopulateOn] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [online, setOnline] = useState(isOnline())
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const didInitialSyncRef = useRef(false)
  const prefetchCache = useRef<Map<number, ReturnType<typeof toFrontend>[]>>(new Map())

  const safePage = Math.min(page, totalPages)
  const editingItem = editingId ? allRows.find((item) => item.id === editingId) ?? null : null

  // --- Infinite scroll: prefetch next page ---
  const prefetchPage = useCallback(async (p: number, s: string) => {
    if (prefetchCache.current.has(p)) return
    try {
      const result = await api.list(p, PAGE_SIZE, s)
      prefetchCache.current.set(p, result.items.map(toFrontend))
    } catch { /* ignore prefetch failure */ }
  }, [])

  const fetchPage = useCallback(async (p: number, s: string) => {
    try {
      const result = await api.list(p, PAGE_SIZE, s)
      const mapped = result.items.map(toFrontend)

      if (p === 1) {
        setAllRows(mapped)
      } else {
        setAllRows((prev) => {
          const existingIds = new Set(prev.map((r) => r.id))
          const newItems = mapped.filter((r) => !existingIds.has(r.id))
          return [...prev, ...newItems]
        })
      }

      setTotalPages(result.total_pages)
      setTotalItems(result.total)
      setHasMore(p < result.total_pages)

      if (p === 1) {
        setLocalStore(result.items)
      } else {
        const merged = new Map(getLocalStore().map((item) => [item.id, item] as const))
        result.items.forEach((item) => merged.set(item.id, item))
        setLocalStore(Array.from(merged.values()))
      }

      // Prefetch next page
      if (p < result.total_pages) {
        prefetchPage(p + 1, s)
      }
    } catch {
      // Offline fallback
      const local = getLocalStore().map(toFrontend)
      const filtered = s.trim()
        ? local.filter((r) => r.name.toLowerCase().includes(s.toLowerCase()) || r.language.toLowerCase().includes(s.toLowerCase()))
        : local
      const total = filtered.length
      const tp = Math.max(1, Math.ceil(total / PAGE_SIZE))
      setAllRows(filtered)
      setTotalPages(tp)
      setTotalItems(total)
      setHasMore(p < tp)
    }
  }, [prefetchPage])

  // --- Online status listener ---
  useEffect(() => {
    const unsub = onOnlineChange((val) => {
      setOnline(val)
      if (val) {
        syncOfflineQueue().then(({ synced, failed }) => {
          if (synced > 0) {
            setSyncStatus(`Synced ${synced} offline operations`)
            setTimeout(() => setSyncStatus(null), 3000)
          }
          if (failed > 0) {
            setSyncStatus('Some offline operations could not be synced yet')
            setTimeout(() => setSyncStatus(null), 3000)
          }
          prefetchCache.current.clear()
          setPage(1)
          fetchPage(1, search)
          bumpRefresh()
        })
      }
    })
    return unsub
  }, [search, fetchPage])

  // --- WebSocket ---
  useEffect(() => {
    connectWebSocket()
    const unsub = onWebSocketMessage((data) => {
      if (typeof data?.type === 'string' && LIVE_REFRESH_EVENTS.has(data.type)) {
        prefetchCache.current.clear()
        setPage(1)
        fetchPage(1, search)
        bumpRefresh()
      }
    })
    return unsub
  }, [search, fetchPage])

  // --- Load more (infinite scroll) ---
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1

    // Try prefetch cache first
    const cached = prefetchCache.current.get(nextPage)
    if (cached) {
      setAllRows((prev) => {
        const existingIds = new Set(prev.map((r) => r.id))
        const newItems = cached.filter((r) => !existingIds.has(r.id))
        return [...prev, ...newItems]
      })
      setPage(nextPage)
      setHasMore(nextPage < totalPages)
      prefetchCache.current.delete(nextPage)
      // Prefetch the one after
      if (nextPage + 1 <= totalPages) {
        prefetchPage(nextPage + 1, search)
      }
      setIsLoadingMore(false)
      return
    }

    try {
      const result = await api.list(nextPage, PAGE_SIZE, search)
      const mapped = result.items.map(toFrontend)
      setAllRows((prev) => {
        const existingIds = new Set(prev.map((r) => r.id))
        const newItems = mapped.filter((r) => !existingIds.has(r.id))
        return [...prev, ...newItems]
      })
      setPage(nextPage)
      setTotalPages(result.total_pages)
      setHasMore(nextPage < result.total_pages)
      // Prefetch next
      if (nextPage + 1 <= result.total_pages) {
        prefetchPage(nextPage + 1, search)
      }
    } catch { /* ignore */ }

    setIsLoadingMore(false)
  }, [isLoadingMore, hasMore, page, totalPages, search, prefetchPage])

  useEffect(() => {
    prefetchCache.current.clear()
    setPage(1)
    setAllRows([])
    fetchPage(1, search)
  }, [search, fetchPage])

  useEffect(() => {
    if (didInitialSyncRef.current) return
    didInitialSyncRef.current = true
    if (!isOnline()) return

    syncOfflineQueue().then(({ synced, failed }) => {
      if (synced > 0) {
        setSyncStatus(`Synced ${synced} offline operations`)
        setTimeout(() => setSyncStatus(null), 3000)
      }
      if (failed > 0) {
        setSyncStatus('Some offline operations could not be synced yet')
        setTimeout(() => setSyncStatus(null), 3000)
      }
      if (synced > 0 || failed > 0) {
        prefetchCache.current.clear()
        setPage(1)
        fetchPage(1, search)
        bumpRefresh()
      }
    })
  }, [search, fetchPage])

  function bumpRefresh() {
    setRefreshKey((k) => k + 1)
  }

  async function addCodebase(input: any) {
    const backendData = toBackend(input)
    if (!online) {
      const fakeId = `offline-${Date.now()}`
      const fakeItem: Codebase = {
        id: fakeId,
        ...backendData,
        indexed_at: new Date().toISOString().slice(0, 10),
        tags: [],
      } as Codebase
      addToLocalStore(fakeItem)
      addToQueue({ type: 'create', payload: { data: backendData, clientId: fakeId } })
      setAllRows((prev) => [toFrontend(fakeItem), ...prev])
      setShowCreate(false)
      bumpRefresh()
      return
    }
    try {
      await api.create(backendData)
      setShowCreate(false)
      setPage(1)
      await fetchPage(1, search)
      bumpRefresh()
    } catch {
      const fakeId = `offline-${Date.now()}`
      const fakeItem: Codebase = {
        id: fakeId,
        ...backendData,
        indexed_at: new Date().toISOString().slice(0, 10),
        tags: [],
      } as Codebase
      addToLocalStore(fakeItem)
      addToQueue({ type: 'create', payload: { data: backendData, clientId: fakeId } })
      setAllRows((prev) => [toFrontend(fakeItem), ...prev])
      setShowCreate(false)
      bumpRefresh()
    }
  }

  async function updateCodebase(id: string, input: any) {
    const backendData = toBackend(input)
    if (!online) {
      updateInLocalStore(id, backendData)
      addToQueue({ type: 'update', payload: { id, data: backendData } })
      setAllRows((prev) => prev.map((r) => r.id === id ? { ...r, ...input } : r))
      setEditingId(null)
      bumpRefresh()
      return
    }
    try {
      await api.update(id, backendData)
      setEditingId(null)
      await fetchPage(page, search)
      bumpRefresh()
    } catch {
      updateInLocalStore(id, backendData)
      addToQueue({ type: 'update', payload: { id, data: backendData } })
      setAllRows((prev) => prev.map((r) => r.id === id ? { ...r, ...input } : r))
      setEditingId(null)
      bumpRefresh()
    }
  }

  async function deleteCodebaseById(id: string) {
    if (!online) {
      removeFromLocalStore(id)
      addToQueue({ type: 'delete', payload: { id } })
      setAllRows((prev) => prev.filter((r) => r.id !== id))
      bumpRefresh()
      return
    }
    try {
      await api.delete(id)
      setPage(1)
      await fetchPage(1, search)
      bumpRefresh()
    } catch {
      removeFromLocalStore(id)
      addToQueue({ type: 'delete', payload: { id } })
      setAllRows((prev) => prev.filter((r) => r.id !== id))
      bumpRefresh()
    }
  }

  async function toggleAutoPopulate() {
    if (isAutoPopulateOn) {
      try {
        await api.stopGenerator()
      } catch { /* ignore */ }
      setIsAutoPopulateOn(false)
    } else {
      try {
        await api.startGenerator()
      } catch { /* ignore */ }
      setIsAutoPopulateOn(true)
    }
  }

  const populateWithFaker = useCallback(async () => {
    // Not used anymore, generator is server-side
  }, [])

  // --- Periodic online check ---
  useEffect(() => {
    const interval = setInterval(async () => {
      const base = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`
      try {
        await fetch(`${base}/`, { method: 'GET' })
        if (!online) {
          setOnline(true)
          const { synced } = await syncOfflineQueue()
          if (synced > 0) {
            setSyncStatus(`Synced ${synced} offline operations`)
            setTimeout(() => setSyncStatus(null), 3000)
            prefetchCache.current.clear()
            setPage(1)
            fetchPage(1, search)
            bumpRefresh()
          }
        }
      } catch {
        setOnline(false)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [online, search, fetchPage])

  return {
    rows: allRows,
    search,
    safePage,
    totalPages,
    totalItems,
    showCreate,
    isPopulating,
    isAutoPopulateOn,
    editingItem,
    refreshKey,
    online,
    syncStatus,
    hasMore,
    isLoadingMore,
    setSearch,
    setPage,
    setShowCreate,
    setEditingId,
    addCodebase,
    updateCodebase,
    deleteCodebaseById,
    populateWithFaker,
    toggleAutoPopulate,
    loadMore,
  }
}