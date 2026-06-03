import { useEffect, useRef } from 'react'
import { go } from '../../model'

export default function DashboardTable({ rows, onEdit, onDelete, hasMore, isLoadingMore, onLoadMore, totalItems }) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, onLoadMore])

  return (
    <div>
      <p className="mb-2 text-xs text-zinc-500">{totalItems} total codebases</p>
      <div className="overflow-x-auto rounded-lg border border-white/10 max-h-[60vh] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-900 text-left text-zinc-400 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Language</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Files</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2">Last Indexed</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-white/10 text-zinc-200 transition-colors duration-200 hover:bg-white/5">
                <td className="px-3 py-2">
                  <button onClick={() => go(`/codebases/${item.id}`)} className="text-cyan-400 transition-colors hover:text-cyan-300 hover:underline">
                    {item.name}
                  </button>
                </td>
                <td className="px-3 py-2">{item.language}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === 'indexed' ? 'bg-emerald-500/20 text-emerald-300' :
                    item.status === 'indexing' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2">{item.filesCount}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(item.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: tag.color + '30', color: tag.color, border: `1px solid ${tag.color}50` }}
                      >
                        {tag.label}
                      </span>
                    ))}
                    {(item.tags || []).length > 3 && (
                      <span className="text-[10px] text-zinc-500">+{item.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">{item.indexedAt}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(item.id)} className="rounded bg-cyan-600 px-2 py-1 text-xs font-medium text-black transition-all hover:scale-105 hover:bg-cyan-500 active:scale-95">
                      Update
                    </button>
                    <button onClick={() => onDelete(item.id)} className="rounded bg-rose-500 px-2 py-1 text-xs font-medium text-white transition-all hover:scale-105 hover:bg-rose-400 active:scale-95">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="py-4 text-center text-sm text-zinc-500">
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              Loading more...
            </div>
          )}
          {!hasMore && rows.length > 0 && (
            <span className="text-zinc-600">All codebases loaded</span>
          )}
        </div>
      </div>
    </div>
  )
}
