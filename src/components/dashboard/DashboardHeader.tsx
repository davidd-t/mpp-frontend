export default function DashboardHeader({ onToggleCreate, onToggleAutoPopulate, isAutoPopulateOn, online }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 font-mono">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 ring-1 ring-cyan-500/20 shadow-md">
            <svg className="h-4.5 w-4.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25l7.5 4.33v8.66L12 19.57l-7.5-4.33V6.58L12 2.25z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">Codebases</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Manage and monitor your indexed repositories</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAutoPopulate}
          disabled={!online}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border transition-all disabled:cursor-not-allowed disabled:opacity-40 ${isAutoPopulateOn
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
        >
          {isAutoPopulateOn ? '⏹ Stop Generator' : '▶ Start Generator'}
        </button>
        <button onClick={onToggleCreate} className="btn-primary btn-sm rounded-lg text-xs font-semibold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add codebase
        </button>
      </div>
    </div>
  )
}
