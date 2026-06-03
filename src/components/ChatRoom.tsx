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

    ws.onopen = () => {}
    ws.onclose = () => {
      reconnectTimer.current = setTimeout(() => setReconnectKey((k) => k + 1), 3000)
    }
    ws.onerror = () => {}
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
      <section className="rounded-lg border border-white/10 bg-zinc-900 p-3">
        <p className="text-sm text-zinc-400">Sign in to chat.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900 p-3" data-testid="chat-room">
      <p className="mb-2 flex items-center justify-between text-sm font-semibold text-zinc-300">
        <span>Live chat — room <code className="text-cyan-400">{room}</code></span>
        
      </p>

      <div className="mb-3 max-h-64 space-y-2 overflow-auto rounded border border-white/10 p-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded px-3 py-2 text-sm ${
              m.user_id === user.id ? 'ml-auto bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-100'
            }`}
          >
            <div className="text-xs opacity-60">{m.username}</div>
            {m.text}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-xs text-zinc-500">No messages yet — be the first.</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
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
          className="rounded bg-cyan-500 px-4 py-2 font-semibold text-black hover:bg-cyan-400"
          data-testid="chat-send"
        >
          Send
        </button>
      </div>
    </section>
  )
}
