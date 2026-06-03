export default function DashboardHeader({ onToggleCreate, onToggleAutoPopulate, isAutoPopulateOn, online }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">Codebases</h1>
        <p className="text-sm text-zinc-400">Manage and monitor your indexed repositories</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAutoPopulate}
          disabled={!online}
          className={`rounded px-4 py-2 font-semibold text-black transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
            isAutoPopulateOn
              ? 'bg-rose-500 hover:bg-rose-400'
              : 'bg-emerald-500 hover:bg-emerald-400'
          }`}
        >
          {isAutoPopulateOn ? '⏹ Stop Generator' : '▶ Start Generator'}
        </button>
        <button onClick={onToggleCreate} className="rounded bg-cyan-500 px-4 py-2 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95">
          + Add codebase
        </button>
      </div>
    </div>
  )
}
