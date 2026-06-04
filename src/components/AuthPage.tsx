import { useState } from 'react'
import { go } from '../model'
import { login, register } from '../auth'

export default function AuthPage({ route }: { route: string }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!username || !password) {
      setError('Username and password are required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      if (route === '/register') {
        await register(username, password)
      } else {
        await login(username, password)
      }
      go('/dashboard')
    } catch (err) {
      setError((err as Error).message ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const isLogin = route === '/login'

  return (
    <main className="mx-auto flex max-w-[420px] px-6 py-20 relative z-10">
      <form onSubmit={handleSubmit} className="glass-card w-full p-8 border border-slate-800/80 shadow-2xl shadow-cyan-500/5">
        <div className="mb-7 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10 animate-[pulse_3s_infinite]">
            <svg className="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 font-mono">
            {isLogin ? 'Sign in to your SourceStream workspace' : 'Get started with SourceStream for free'}
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-mono">
            <span className="font-medium text-slate-400">Username</span>
            <input
              className="input font-mono text-xs focus:ring-cyan-500/30"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isLogin ? 'Enter your username' : 'Choose a username'}
              data-testid="auth-username"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-mono">
            <span className="font-medium text-slate-400">Password</span>
            <input
              className="input font-mono text-xs focus:ring-cyan-500/30"
              type="password"
              autoComplete={route === '/register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="auth-password"
            />
          </label>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2.5 text-xs text-rose-400 border border-rose-500/25 font-mono" data-testid="auth-error">
              <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-1 w-full py-2.5 font-mono text-xs tracking-wider uppercase rounded-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="relative w-4 h-4">
                  <span className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping"></span>
                  <span className="absolute inset-0.5 border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></span>
                </span>
                Please wait…
              </span>
            ) : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span className="h-px flex-1 bg-slate-800/80" />
          OR
          <span className="h-px flex-1 bg-slate-800/80" />
        </div>

        <p className="mt-5 text-center text-xs text-slate-500 font-mono">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => go(isLogin ? '/register' : '/login')}
            className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </main>
  )
}
