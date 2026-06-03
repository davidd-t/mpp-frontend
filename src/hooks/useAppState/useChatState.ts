import { useState } from 'react'

export default function useChatState(detailItem) {
  const [chatInput, setChatInput] = useState('')

  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me about architecture, endpoints, or files in this codebase.' }
  ])

  function sendMessage() {
    if (!chatInput.trim()) return
    const userText = chatInput.trim()
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
      {
        role: 'assistant',
        text: `I found relevant info for: "${userText}". This project uses ${detailItem?.language ?? 'multiple'} and has ${detailItem?.filesCount ?? 0} files.`
      }
    ])
    setChatInput('')
  }

  return {
    chatInput,
    messages,
    setChatInput,
    sendMessage
  }
}