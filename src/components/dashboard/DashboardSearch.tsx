export default function DashboardSearch({ search, onSearchChange }) {
  return (
    <div className="relative max-w-sm font-mono">
      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="input pl-10 !pl-10 text-xs font-mono focus:ring-cyan-500/30 placeholder:text-slate-600"
        style={{ paddingLeft: '2.5rem' }}
        placeholder="Search codebases..."
      />
    </div>
  )
}
