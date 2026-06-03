export default function ChatPanel({ messages, chatInput, onChatInputChange, onSendMessage }) {
  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900 p-3">
      <p className="mb-2 text-sm font-semibold text-zinc-300">RAG Chat Interface</p>
      <div className="mb-3 max-h-64 space-y-2 overflow-auto rounded border border-white/10 p-2">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded px-3 py-2 text-sm animate-[slide-up-fade_0.3s_ease-out] ${
              message.role === 'user' ? 'ml-auto bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-100'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={chatInput}
          onChange={(event) => onChatInputChange(event.target.value)}
          placeholder="Ask something..."
          className="input flex-1 text-sm"
        />
        <button onClick={onSendMessage} className="rounded bg-cyan-500 px-4 py-2 font-semibold text-black transition-all hover:scale-105 hover:bg-cyan-400 active:scale-95 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          Send
        </button>
      </div>
    </section>
  )
}
