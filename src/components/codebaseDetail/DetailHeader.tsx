import { go } from '../../model'

export default function DetailHeader({ detailItem, onDelete }) {
  return (
    <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{detailItem?.name ?? 'Codebase not found'}</h1>
        <p className="text-sm text-zinc-400">{detailItem?.summary ?? 'No summary available.'}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => go('/dashboard')} className="rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-cyan-400 active:scale-95 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          Back to dashboard
        </button>
        {detailItem && (
          <button onClick={() => onDelete(detailItem.id)} className="rounded bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-rose-400 active:scale-95">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
