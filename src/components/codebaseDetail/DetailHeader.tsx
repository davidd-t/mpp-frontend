import { go } from '../../model'

export default function DetailHeader({ detailItem, onDelete }) {
  return (
    <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between font-sans border-b border-slate-800 pb-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
          </svg>
          <h1 className="text-xl font-bold tracking-tight text-white hover:underline cursor-pointer">
            {detailItem?.name ?? 'Codebase not found'}
          </h1>
          <span className="rounded-full border border-slate-800 bg-[#161b22] px-2 py-0.5 text-[11px] font-semibold text-slate-400 select-none">
            Public
          </span>
          <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 select-none">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100-1.5.75.75 0 000 1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a.5.5 0 00-.5.5v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.628A1.5 1.5 0 017 8.5h3A1 1 0 0011 7.5V5.372a2.25 2.25 0 01-1.5-2.122zm-5 8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
            </svg>
            main
          </span>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">{detailItem?.summary ?? 'No summary available.'}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => go('/dashboard')} className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#30363d] hover:border-slate-700 transition-all cursor-pointer">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Dashboard
        </button>
        {detailItem && (
          <button onClick={() => onDelete(detailItem.id)} className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all cursor-pointer">
            Delete Codebase
          </button>
        )}
      </div>
    </div>
  )
}

