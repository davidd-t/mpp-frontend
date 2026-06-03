export default function DashboardPagination({ safePage, totalPages, onPrevPage, onNextPage }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm">
      <button disabled={safePage === 1} onClick={onPrevPage} className="rounded border border-white/20 px-3 py-1 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent">
        Prev
      </button>
      <span>
        Page {safePage} / {totalPages}
      </span>
      <button disabled={safePage >= totalPages} onClick={onNextPage} className="rounded border border-white/20 px-3 py-1 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent">
        Next
      </button>
    </div>
  )
}
