export default function ChatPanel({ messages, chatInput, onChatInputChange, onSendMessage }) {
  return (
    <section className="glass-card border border-slate-800/80 bg-[#080f30]/10 shadow-2xl shadow-cyan-500/5 overflow-hidden font-mono">
      <div className="flex items-center justify-between border-b border-slate-900/60 px-4 py-2.5 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <svg className="h-4.5 w-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l3.255-4.643a.75.75 0 01.665-.327 30.66 30.66 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.03z" />
          </svg>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">RAG Chat Interface</p>
        </div>
        <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-400 border border-blue-500/20">
          {messages.length} Messages
        </span>
      </div>

      <div className="max-h-64 space-y-3 overflow-auto p-4 bg-[#040810]/40">
        {messages.map((message, index) => {
          const isUser = message.role === 'user'
          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex space-x-3 p-2 rounded-lg border transition-all hover:bg-slate-900/30 ${
                isUser ? 'border-cyan-500/10 bg-cyan-500/[0.02]' : 'border-slate-800/60 bg-[#080f30]/5'
              }`}
            >
              {/* Avatar block */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 border ${
                isUser ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {isUser ? 'U' : 'AI'}
              </div>

              {/* Msg Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between font-mono">
                  <div className="text-xs font-bold text-slate-300">
                    {isUser ? 'User Identity' : 'SourceStream Intelligence'}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </div>
              </div>

              {/* Status pulse dot */}
              <div className="flex-shrink-0 self-center">
                <div className={`h-1.5 w-1.5 rounded-full ${isUser ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}`}></div>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-600 font-mono">No messages yet — ask something about the codebase.</p>
        )}
      </div>

      <div className="flex gap-2 border-t border-slate-900/60 p-4 bg-slate-950/20">
        <input
          value={chatInput}
          onChange={(event) => onChatInputChange(event.target.value)}
          placeholder="Ask something…"
          className="input flex-1 text-xs font-mono focus:ring-cyan-500/30"
        />
        <button onClick={onSendMessage} className="btn-primary btn-sm rounded font-mono text-xs uppercase font-bold tracking-wider hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          Send
        </button>
      </div>
    </section>
  )
}
