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
    <main className="mx-auto flex max-w-md px-4 py-20">
      <form onSubmit={handleSubmit} className="w-full rounded-xl border border-white/10 bg-zinc-900 p-6">
        <h1 className="mb-4 text-center text-2xl font-semibold">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>

        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Username
            <input
              className="input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isLogin ? 'Enter your username' : 'Choose a username'}
              data-testid="auth-username"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input
              className="input"
              type="password"
              autoComplete={route === '/register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="auth-password"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-400" data-testid="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded bg-cyan-500 px-4 py-2 text-center font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => go(isLogin ? '/register' : '/login')}
            className="text-cyan-400"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </main>
  )
}
