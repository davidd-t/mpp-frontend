import { useEffect, useState } from 'react'
import { api, getLocalStore, type Codebase } from '../../api'

export default function useCodebaseDetail(route: string) {
  const detailMatch = route.match(/^\/codebases\/([^/]+)$/)
  const detailId = detailMatch?.[1] ?? null

  const [detailItem, setDetailItem] = useState<ReturnType<typeof toFrontend> | null>(null)

  useEffect(() => {
    if (!detailId) {
      setDetailItem(null)
      return
    }

    api.get(detailId)
      .then((cb) => setDetailItem(toFrontend(cb)))
      .catch(() => {
        const local = getLocalStore().find((item) => item.id === detailId)
        setDetailItem(local ? toFrontend(local) : null)
      })
  }, [detailId])

  return { detailId, detailItem }
}

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