import { useEffect, useState } from 'react'
import { api, type Stats } from '../../api'

export default function DashboardChart({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null))
  }, [refreshKey])

  if (!stats) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-6">Analytics</h3>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          Loading…
        </div>
      </div>
    )
  }

  const sorted = Object.entries(stats.by_language)
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const totalLangRepos = sorted.reduce((sum, s) => sum + s.count, 0)


  const tagEntries = stats.tag_stats
    ? Object.entries(stats.tag_stats.by_label)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    : []


  return (
    <div className="space-y-4 font-mono">
      {/* Overview stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 relative overflow-hidden border border-slate-800/80 bg-[#080f30]/20 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Repositories</p>
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{stats.total}</p>
          <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-cyan-500 opacity-[0.03] blur-lg"></div>
        </div>

        <div className="glass-card p-4 relative overflow-hidden border border-slate-800/80 bg-[#080f30]/20 shadow-lg shadow-cyan-500/5 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Avg Files</p>
            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-white tracking-tight leading-8">{stats.avg_files.toLocaleString()}</p>
          <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-purple-500 opacity-[0.03] blur-lg"></div>
        </div>
      </div>

      {/* Language Distribution styled like Resource Allocation */}
      <div className="glass-card p-5 border border-slate-800/80 bg-[#080f30]/10 shadow-lg shadow-cyan-500/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5 border-b border-slate-800/80 pb-2">Language Distribution</h3>

        {sorted.length === 0 ? (
          <p className="text-xs text-slate-500">No data telemetry.</p>
        ) : (
          <div className="space-y-4">
            {sorted.map(({ lang, count }, i) => {
              const pct = Math.round((count / totalLangRepos) * 100)
              
              // Gradient options per language
              const gradients = [
                { classes: 'from-cyan-500 to-blue-500', text: 'text-cyan-400' },
                { classes: 'from-purple-500 to-pink-500', text: 'text-purple-400' },
                { classes: 'from-blue-500 to-indigo-500', text: 'text-blue-400' },
                { classes: 'from-emerald-500 to-green-500', text: 'text-emerald-400' },
                { classes: 'from-amber-500 to-orange-500', text: 'text-amber-400' },
                { classes: 'from-pink-500 to-rose-500', text: 'text-pink-400' },
              ]
              const themeColor = gradients[i % gradients.length]
              
              return (
                <div key={lang}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-slate-400">{lang}</div>
                    <div className={`text-xs ${themeColor.text} font-bold`}>{pct}% allocated</div>
                  </div>
                  <div className="h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${themeColor.classes} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tag statistics styled like Resource Allocation */}
      {tagEntries.length > 0 && (
        <div className="glass-card p-5 border border-slate-800/80 bg-[#080f30]/10 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Tags</h3>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
              {stats.tag_stats.total_tags} total
            </span>
          </div>
          <div className="space-y-4">
            {tagEntries.map(({ label, count }, i) => {
              const maxTag = tagEntries[0].count
              const width = Math.max(8, (count / maxTag) * 100)
              
              const gradients = [
                { classes: 'from-purple-500 to-pink-500', text: 'text-purple-400' },
                { classes: 'from-blue-500 to-indigo-500', text: 'text-blue-400' },
                { classes: 'from-cyan-500 to-blue-500', text: 'text-cyan-400' },
              ]
              const themeColor = gradients[i % gradients.length]
              
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className={`text-xs ${themeColor.text} font-bold`}>{count} instances</div>
                  </div>
                  <div className="h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${themeColor.classes} rounded-full`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
