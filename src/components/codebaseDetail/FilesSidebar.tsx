import { sampleFiles } from '../../model'

export default function FilesSidebar() {
  return (
    <aside className="border border-slate-800/80 bg-[#080f1e]/90 rounded-lg p-4 font-sans shadow-lg shadow-black/40">
      {/* Branch Selector */}
      <div className="mb-4">
        <button className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-[#0c152a] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#12203f]/50 hover:border-slate-700 transition-all w-full justify-between cursor-pointer">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-cyan-500" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100-1.5.75.75 0 000 1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a.5.5 0 00-.5.5v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.628A1.5 1.5 0 017 8.5h3A1 1 0 0011 7.5V5.372a2.25 2.25 0 01-1.5-2.122zm-5 8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
            </svg>
            <span className="text-slate-300">main</span>
          </span>
          <svg className="h-3 w-3 text-slate-400" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M1.25 5.25a.75.75 0 011.06 0L8 10.94l5.69-5.69a.75.75 0 111.06 1.06l-6.22 6.22a.75.75 0 01-1.06 0L1.25 6.31a.75.75 0 010-1.06z"></path>
          </svg>
        </button>
      </div>

      {/* Filter Input */}
      <div className="mb-4 relative">
        <input
          className="w-full rounded-md border border-slate-800 bg-[#040814]/40 px-3 py-1.5 pl-8 text-xs font-sans text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all"
          placeholder="Go to file..."
        />
        <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Directory structure */}
      <div className="space-y-4 text-sm">
        {Object.entries(sampleFiles).map(([folder, files]) => (
          <div key={folder}>
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1 cursor-pointer hover:text-cyan-400 select-none transition-colors">
              <svg className="h-4 w-4 text-cyan-500" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-5.73l-.948-1.517A1.75 1.75 0 006.072 1H1.75z"></path>
              </svg>
              <span>{folder}</span>
            </div>
            <ul className="mt-1 space-y-0.5 pl-4 border-l border-slate-800/80 ml-2">
              {files.map((file) => (
                <li
                  key={file}
                  className={`flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 text-xs text-slate-400 hover:bg-cyan-950/20 hover:text-cyan-400 font-mono transition-colors ${
                    file === 'main.py' ? 'text-cyan-400 bg-cyan-950/30 font-semibold border-l border-cyan-500 pl-1.5' : ''
                  }`}
                >
                  <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l3.293 3.293c.329.329.513.773.513 1.237v9.207A1.75 1.75 0 0113.56 16H3.75A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.81a.25.25 0 00.25-.25V6H10.75A1.75 1.75 0 019 4.25V1.5H3.75zm6.75.06v2.94c0 .138.112.25.25.25h2.94l-3.19-3.19z"></path>
                  </svg>
                  <span>{file}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}


