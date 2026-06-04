export default function DashboardPagination({ safePage, totalPages, onPrevPage, onNextPage }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm">
      <button disabled={safePage === 1} onClick={onPrevPage} className="btn-ghost btn-sm disabled:opacity-30 disabled:cursor-not-allowed">
        ← Prev
      </button>
      <span className="px-2 text-xs text-slate-500 tabular-nums">
        Page {safePage} / {totalPages}
      </span>
      <button disabled={safePage >= totalPages} onClick={onNextPage} className="btn-ghost btn-sm disabled:opacity-30 disabled:cursor-not-allowed">
        Next →
      </button>
    </div>
  )
}
