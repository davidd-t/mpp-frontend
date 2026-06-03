export default function DashboardSearch({ search, onSearchChange }) {
  return (
    <div className="mb-4">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="input w-full max-w-xs text-sm"
        placeholder="Search codebases..."
      />
    </div>
  )
}
