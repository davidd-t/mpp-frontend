import { sampleFiles } from '../../model'

export default function FilesSidebar() {
  return (
    <aside className="rounded-lg border border-white/10 bg-zinc-900 p-3">
      <p className="mb-2 text-sm font-semibold text-zinc-300">Files</p>
      <input className="mb-3 w-full rounded border border-white/20 bg-transparent px-2 py-1 text-xs" placeholder="Search file..." />
      <div className="space-y-2 text-sm">
        {Object.entries(sampleFiles).map(([folder, files]) => (
          <div key={folder}>
            <p className="text-zinc-400">{folder}</p>
            <ul className="mt-1 space-y-1 pl-2">
              {files.map((file) => (
                <li key={file} className="rounded bg-zinc-800 px-2 py-1 text-zinc-200">
                  {file}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
