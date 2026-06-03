import { go } from '../model'
import { getCurrentUser, isAdmin, logout } from '../auth'

export default function AppHeader({ route }) {
  const user = getCurrentUser()

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <button onClick={() => go('/')} className="group flex items-center gap-2 text-cyan-400 transition-all hover:opacity-80">
          <img src="/logo.svg" alt="SourceStream logo" className="h-6 w-6 transition-transform duration-500 group-hover:rotate-360" />
          <span className="text-lg font-semibold tracking-wide">SourceStream</span>
        </button>

        <div className="flex items-center gap-3 text-sm text-zinc-300">
          {isAdmin() && (
            <button
              onClick={() => go('/admin')}
              className="text-amber-400 hover:text-amber-300"
              data-testid="admin-link"
            >
              Admin
            </button>
          )}

          {route !== '/' && (
            <button onClick={() => go('/')} className="hover:text-white">
              Back to home
            </button>
          )}

          {user ? (
            <>
              <span className="text-zinc-400" data-testid="current-user">
                {user.username} ({user.role})
              </span>
              <button
                onClick={() => { logout(); go('/') }}
                className="hover:text-white"
                data-testid="sign-out"
              >
                Sign out
              </button>
            </>
          ) : (
            route === '/' && (
              <button onClick={() => go('/login')} className="hover:text-white">
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
