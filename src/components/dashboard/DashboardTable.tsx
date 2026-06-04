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
      <p className="mb-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">{totalItems} total codebases</p>
      <div className="glass-card border border-slate-800/80 shadow-2xl shadow-cyan-500/5 overflow-auto max-h-[65vh] w-full">
        <table className="min-w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Language</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Files</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Tags</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Last Indexed</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {rows.map((item) => (
              <tr key={item.id} className="text-slate-300 transition-colors duration-150 hover:bg-slate-900/40">
                <td className="px-4 py-3 font-semibold text-cyan-400">
                  <button onClick={() => go(`/codebases/${item.id}`)} className="font-bold hover:text-cyan-300 transition-colors hover:underline decoration-cyan-500/45">
                    {item.name}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-cyan-500/5">
                    {item.language}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${item.status === 'indexed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      item.status === 'indexing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${item.status === 'indexed' ? 'bg-emerald-500' :
                        item.status === 'indexing' ? 'bg-amber-500 animate-ping' :
                          'bg-rose-500'
                      }`} />
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs hidden sm:table-cell">{item.filesCount}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(item.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: tag.color + '15', color: tag.color, border: `1px solid ${tag.color}25` }}
                      >
                        {tag.label}
                      </span>
                    ))}
                    {(item.tags || []).length > 3 && (
                      <span className="text-[10px] text-slate-600 font-bold">+{item.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{item.indexedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => onEdit(item.id)} className="btn-ghost btn-sm text-[10px] py-1 border border-slate-800 hover:bg-slate-900 font-semibold rounded">
                      Edit
                    </button>
                    <button onClick={() => onDelete(item.id)} className="rounded border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 text-[10px] font-semibold text-rose-400 hover:bg-rose-500/15 transition-all">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="py-4 text-center text-xs text-slate-500 border-t border-slate-900/60 bg-slate-950/20">
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2">
              <div className="relative h-4 w-4">
                <span className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping"></span>
                <span className="absolute inset-0.5 border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Retrieving nodes…</span>
            </div>
          )}
          {!hasMore && rows.length > 0 && (
            <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">All nodes loaded</span>
          )}
        </div>
      </div>
    </div>
  )
}
