import { useEffect, useState } from 'react'
import { api, type Stats } from '../../api'

export default function DashboardChart({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null))
  }, [refreshKey])

  if (!stats) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-100 mb-6">Most Used Languages</h3>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  const sorted = Object.entries(stats.by_language)
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const maxCount = sorted.length > 0 ? sorted[0].count : 1

  const tagEntries = stats.tag_stats
    ? Object.entries(stats.tag_stats.by_label)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : []

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-100 mb-6">Most Used Languages</h3>

        {sorted.length === 0 ? (
          <p className="text-sm text-gray-400">No data available.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sorted.map(({ lang, count }) => {
              const widthPercent = Math.max(5, (count / maxCount) * 100)
              return (
                <div key={lang} className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between items-end text-gray-300">
                    <span className="font-medium truncate pr-2">{lang}</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {count} {count === 1 ? 'repo' : 'repos'}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>
            <span className="text-gray-200 font-semibold text-sm">{stats.total}</span>
            <span className="ml-1">total repos</span>
          </div>
          <div>
            <span className="text-gray-200 font-semibold text-sm">{stats.avg_files.toLocaleString()}</span>
            <span className="ml-1">avg files</span>
          </div>
        </div>
      </div>

      {/* Tag statistics */}
      {tagEntries.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Tags</h3>
          <div className="flex flex-col gap-3">
            {tagEntries.map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium">{label}</span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300 font-mono">
                  {count}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
            <span className="text-gray-200 font-semibold text-sm">{stats.tag_stats.total_tags}</span>
            <span className="ml-1">total tags</span>
          </div>
        </div>
      )}
    </div>
  )
}
