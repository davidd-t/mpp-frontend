import { useEffect, useState } from 'react'
import { adminApi, type LogEntry, type MonitoredUser } from '../api'
import { getCurrentUser, isAdmin } from '../auth'

export default function AdminMonitoringPage() {
  const user = getCurrentUser()
  const [monitored, setMonitored] = useState<MonitoredUser[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [clearError, setClearError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const [m, l] = await Promise.all([
        adminApi.monitoredUsers(),
        adminApi.logs(undefined, 50),
      ])
      setMonitored(m)
      setLogs(l)
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  async function handleClear(userId: number) {
    setClearError(null)
    try {
      await adminApi.clearMonitored(userId)
      // Refresh without re-running the scan so the cleared user isn't immediately re-flagged
      setLoading(true)
      const [m, l] = await Promise.all([
        adminApi.monitoredUsers(true),
        adminApi.logs(undefined, 50),
      ])
      setMonitored(m)
      setLogs(l)
    } catch (err) {
      setClearError((err as Error).message ?? 'Failed to clear user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin()) refresh()
  }, [])

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-slate-400">Please <a href="#/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">sign in</a> to view this page.</p>
      </main>
    )
  }
  if (!isAdmin()) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12" data-testid="admin-forbidden">
        <div className="glass-card p-6">
          <h1 className="text-xl font-bold text-rose-400">Access denied</h1>
          <p className="mt-2 text-sm text-slate-500">
            The observation list is only visible to administrators.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 font-mono">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">Observation List</h1>
          <p className="mt-0.5 text-[10px] text-slate-500 uppercase tracking-widest">Admin · Monitor suspicious activity</p>
        </div>
        <button
          onClick={refresh}
          className="btn-primary btn-sm rounded-lg text-xs font-semibold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-1.5"
          data-testid="admin-refresh"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="relative w-4.5 h-4.5">
                <span className="absolute inset-0 border-2 border-slate-950/30 rounded-full animate-ping"></span>
                <span className="absolute inset-0.5 border-2 border-t-slate-950 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></span>
              </span>
              Refreshing…
            </span>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-400">
          <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          {error}
        </div>
      )}
      {clearError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-400">
          <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          Clear failed: {clearError}
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2">
          <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          Suspicious users
        </h2>
        {monitored.length === 0 ? (
          <p className="text-xs text-slate-600">No users currently flagged.</p>
        ) : (
          <div className="glass-card border border-slate-800/80 shadow-2xl shadow-cyan-500/5 overflow-auto w-full">
            <table className="w-full text-xs min-w-[500px] sm:min-w-0">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Role</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Last flagged</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {monitored.map((m) => (
                  <tr key={m.user_id} className="text-slate-300 transition-colors hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-bold text-white">{m.username}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        {m.role_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">{m.reason}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{m.action_count}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{new Date(m.last_flagged_at).toLocaleTimeString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleClear(m.user_id)}
                        className="btn-ghost btn-sm text-[10px] py-1 border border-slate-800 hover:bg-slate-900 font-semibold rounded"
                      >
                        Clear
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2">
          <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Recent actions
        </h2>
        <div className="glass-card border border-slate-800/80 shadow-2xl shadow-cyan-500/5 overflow-auto w-full">
          <table className="w-full text-xs min-w-[500px] sm:min-w-0">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {logs.map((l) => (
                <tr key={l.id} className="text-slate-300 transition-colors hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-slate-500">{new Date(l.ts).toLocaleTimeString()}</td>
                  <td className="px-4 py-3 font-bold text-white">{l.username}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="inline-flex items-center rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      {l.role_name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-xs text-slate-300">
                      {l.action_info}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
