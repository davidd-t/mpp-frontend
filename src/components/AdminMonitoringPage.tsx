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
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-zinc-300">Please <a href="#/login" className="text-cyan-400">sign in</a> to view this page.</p>
      </main>
    )
  }
  if (!isAdmin()) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12" data-testid="admin-forbidden">
        <h1 className="text-xl font-semibold text-red-400">Access denied</h1>
        <p className="mt-2 text-sm text-zinc-400">
          The observation list is only visible to administrators.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Observation List</h1>
        <button
          onClick={refresh}
          className="rounded bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-cyan-400"
          data-testid="admin-refresh"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="mt-4 rounded border border-red-700 bg-red-900/20 p-2 text-sm text-red-300">{error}</p>}
      {clearError && <p className="mt-4 rounded border border-red-700 bg-red-900/20 p-2 text-sm text-red-300">Clear failed: {clearError}</p>}

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Suspicious users</h2>
        {monitored.length === 0 ? (
          <p className="text-sm text-zinc-500">No users currently flagged.</p>
        ) : (
          <table className="w-full table-auto border border-white/10 text-sm">
            <thead className="bg-zinc-900 text-left">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Actions</th>
                <th className="px-3 py-2">Last flagged</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {monitored.map((m) => (
                <tr key={m.user_id} className="border-t border-white/5">
                  <td className="px-3 py-2">{m.username}</td>
                  <td className="px-3 py-2">{m.role_name}</td>
                  <td className="px-3 py-2 text-yellow-300">{m.reason}</td>
                  <td className="px-3 py-2">{m.action_count}</td>
                  <td className="px-3 py-2">{new Date(m.last_flagged_at).toLocaleTimeString()}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleClear(m.user_id)}
                      className="rounded bg-zinc-700 px-2 py-1 text-xs hover:bg-zinc-600"
                    >
                      Clear
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Recent actions</h2>
        <table className="w-full table-auto border border-white/10 text-sm">
          <thead className="bg-zinc-900 text-left">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-white/5">
                <td className="px-3 py-2 text-zinc-400">{new Date(l.ts).toLocaleTimeString()}</td>
                <td className="px-3 py-2">{l.username}</td>
                <td className="px-3 py-2">{l.role_name}</td>
                <td className="px-3 py-2"><code className="text-xs">{l.action_info}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
