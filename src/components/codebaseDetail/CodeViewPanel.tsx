import { sampleCode } from '../../model'

/** Lightweight syntax highlighter for Python-like code */
function highlightSyntax(code: string): React.ReactNode[] {
  const lines = code.split('\n')
  return lines.map((line, lineIdx) => {
    const tokens = tokenizeLine(line)
    return (
      <div key={lineIdx} className="table-row hover:bg-slate-900/30">
        <span className="table-cell select-none pr-4 text-right text-slate-500 w-10 border-r border-slate-800/80 bg-[#040814]/40">{lineIdx + 1}</span>
        <span className="table-cell pl-4 whitespace-pre font-mono">
          {tokens.map((tok, i) => (
            <span key={i} className={tok.className}>{tok.text}</span>
          ))}
        </span>
      </div>
    )
  })
}

interface Token { text: string; className: string }

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let remaining = line

  const patterns: [RegExp, string][] = [
    // Comments
    [/^(#.*)/, 'text-slate-500 italic'],
    // Decorator
    [/^(@\w+)/, 'text-violet-400'],
    // Strings (double-quoted)
    [/^("(?:[^"\\]|\\.)*")/, 'text-emerald-400'],
    // Strings (single-quoted)
    [/^('(?:[^'\\]|\\.)*')/, 'text-emerald-400'],
    // Strings (triple-quoted)
    [/^("""[\s\S]*?"""|'''[\s\S]*?''')/, 'text-emerald-400'],
    // f-strings
    [/^(f"(?:[^"\\]|\\.)*"|f'(?:[^'\\]|\\.)*')/, 'text-emerald-400'],
    // Keywords
    [/^(from|import|def|return|class|if|else|elif|for|while|try|except|finally|with|as|in|not|and|or|is|None|True|False|yield|async|await|raise|pass|break|continue|lambda)\b/, 'text-pink-400 font-medium'],
    // Built-in functions / types
    [/^(print|len|range|int|str|float|list|dict|set|tuple|type|isinstance|super|self|__init__|__name__)\b/, 'text-amber-400'],
    // Numbers
    [/^(\d+\.?\d*)/, 'text-orange-400'],
    // Function calls
    [/^(\w+)(?=\()/, 'text-sky-400'],
    // Parentheses / brackets
    [/^([()[\]{}])/, 'text-slate-400'],
    // Operators / punctuation
    [/^([=+\-*/<>!:,.]+)/, 'text-slate-500'],
    // Identifiers
    [/^(\w+)/, 'text-slate-300'],
    // Whitespace
    [/^(\s+)/, ''],
  ]

  while (remaining.length > 0) {
    let matched = false
    for (const [regex, className] of patterns) {
      const match = remaining.match(regex)
      if (match) {
        tokens.push({ text: match[1], className })
        remaining = remaining.slice(match[1].length)
        matched = true
        break
      }
    }
    if (!matched) {
      tokens.push({ text: remaining[0], className: 'text-slate-300' })
      remaining = remaining.slice(1)
    }
  }

  return tokens
}

export default function CodeViewPanel() {
  return (
    <section className="border border-slate-800/80 bg-[#080f1e]/90 rounded-lg overflow-hidden font-mono shadow-lg shadow-black/40">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-[#0c152a] gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-200">main.py</span>
          <span className="h-4 w-px bg-slate-800/80 hidden sm:inline" />
          <span className="text-[11px] text-slate-400 hidden sm:inline">103 lines (98 sloc) · 3.64 KB</span>
        </div>
        <div className="flex items-center gap-0.5 text-[11px] font-semibold">
          <button className="px-3 py-1.5 border border-slate-800 bg-[#12203f]/50 text-slate-200 hover:bg-[#12203f] rounded-l transition-all cursor-pointer">Raw</button>
          <button className="px-3 py-1.5 border-t border-b border-r border-slate-800 bg-[#12203f]/50 text-slate-200 hover:bg-[#12203f] transition-all cursor-pointer">Blame</button>
          <button className="px-3 py-1.5 border-t border-b border-r border-slate-800 bg-[#12203f]/50 text-slate-200 hover:bg-[#12203f] rounded-r transition-all flex items-center gap-1.5 cursor-pointer">
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" /></svg>
            Copy
          </button>
        </div>
      </div>
      <div className="overflow-auto bg-[#040814]/60 p-4 font-mono text-[12px] leading-6 text-slate-300">
        <div className="table w-full">
          {highlightSyntax(sampleCode)}
        </div>
      </div>
    </section>
  )
}
