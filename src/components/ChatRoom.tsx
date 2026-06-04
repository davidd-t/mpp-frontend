import { useEffect, useRef, useState } from 'react'
import { getCurrentUser } from '../auth'

interface ChatMessage {
  username: string
  user_id: number
  text: string
  ts: string
}

export default function ChatRoom({ room }: { room: string }) {
  const user = getCurrentUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [reconnectKey, setReconnectKey] = useState(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) return
    setMessages([])
    const host = window.location.hostname
    const wsproto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${wsproto}://${host}:8000/chat/ws/${encodeURIComponent(room)}?user_id=${user.id}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => { }
    ws.onclose = () => {
      reconnectTimer.current = setTimeout(() => setReconnectKey((k) => k + 1), 3000)
    }
    ws.onerror = () => { }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'history' || data.type === 'message') {
          setMessages((prev) => [...prev, {
            username: data.username,
            user_id: data.user_id,
            text: data.text,
            ts: data.ts,
          }])
        }
      } catch {
        // ignore malformed payloads
      }
    }

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.close()
    }
  }, [room, user?.id, reconnectKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ text }))
    setInput('')
  }

  if (!user) {
    return (
      <section className="glass-card p-4">
        <p className="text-sm text-slate-500">Sign in to chat.</p>
      </section>
    )
  }

  return (
    <section className="glass-card overflow-hidden" data-testid="chat-room">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs font-semibold text-slate-400">
          Live chat — <code className="text-brand-400 font-mono">{room}</code>
        </p>
      </div>

      <div className="max-h-64 space-y-2 overflow-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${m.user_id === user.id
                ? 'ml-auto bg-gradient-to-r from-brand-500 to-brand-600 text-surface-900 font-medium'
                : 'bg-white/[0.04] text-slate-300 ring-1 ring-white/[0.06]'
              }`}
          >
            <div className="text-[10px] opacity-60 mb-0.5">{m.username}</div>
            {m.text}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-600">No messages yet — be the first.</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-white/[0.06] p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          placeholder="Type a message…"
          className="input flex-1 text-sm"
          data-testid="chat-input"
        />
        <button
          onClick={send}
          className="btn-primary btn-sm"
          data-testid="chat-send"
        >
          Send
        </button>
      </div>
    </section>
  )
}
