import { go } from '../model'
import { getCurrentUser, isAdmin, logout } from '../auth'

export default function AppHeader({ route }) {
  const user = getCurrentUser()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <button onClick={() => go('/')} className="group flex items-center gap-2.5 transition-all hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <svg className="h-4.5 w-4.5 text-cyan-400 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25l7.5 4.33v8.66L12 19.57l-7.5-4.33V6.58L12 2.25z" />
            </svg>
          </div>
          <span className="text-[15px] font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent font-mono">SourceStream</span>
        </button>

        <nav className="flex items-center gap-1.5 text-[13px]">
          {isAdmin() && (
            <button
              onClick={() => go('/admin')}
              className="rounded-lg px-3 py-1.5 font-mono font-medium text-amber-400/90 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
              data-testid="admin-link"
            >
              Admin System
            </button>
          )}

          {route !== '/' && (
            <button onClick={() => go('/')} className="rounded-lg px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-all font-mono">
              ← TERMINAL
            </button>
          )}

          {user ? (
            <>
              <div className="mx-1 hidden sm:flex items-center gap-2 rounded-lg bg-slate-900/90 px-3 py-1.5 border border-slate-800 ring-1 ring-cyan-500/10" data-testid="current-user">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-slate-950 uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  {user.username}
                </span>
                <span className="text-slate-700">·</span>
                <span className="text-[10px] text-cyan-400/80 font-mono uppercase">{user.role}</span>
              </div>
              <button
                onClick={() => { logout(); go('/') }}
                className="rounded-lg px-3 py-1.5 text-slate-400 hover:text-rose-400 transition-all font-mono"
                data-testid="sign-out"
              >
                Disconnect
              </button>
            </>
          ) : (
            route === '/' && (
              <button onClick={() => go('/login')} className="btn-primary btn-sm font-mono tracking-wide px-4 py-1.5 rounded-lg">
                INITIALIZE
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
