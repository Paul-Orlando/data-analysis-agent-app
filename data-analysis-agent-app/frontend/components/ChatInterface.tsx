"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/ChatMessage"
import { ChatMessage as ChatMessageType, ExpertiseLevel } from "@/lib/types"

interface Props {
  sessionId: string
  expertiseLevel: ExpertiseLevel
  initialMessage?: string
  onInitialMessageConsumed?: () => void
}

export function ChatInterface({ sessionId, expertiseLevel, initialMessage, onInitialMessageConsumed }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastInitialMessage = useRef<string | undefined>(undefined)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    if (initialMessage && initialMessage !== lastInitialMessage.current) {
      lastInitialMessage.current = initialMessage
      sendMessage(initialMessage)
      onInitialMessageConsumed?.()
    }
  }, [initialMessage])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setInput("")

    const userMsg: ChatMessageType = { role: "user", text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    const history = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }))

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text, history, expertise_level: expertiseLevel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "agent", text: `Error: ${data.error || "Something went wrong"}` }])
      } else {
        setMessages((prev) => [...prev, { role: "agent", text: data.text, chart: data.chart ?? undefined }])
      }
    } catch {
      setMessages((prev) => [...prev, { role: "agent", text: "Network error — is the backend running?" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Chat with your data</p>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setMessages([])}>
            Clear
          </Button>
        )}
      </div>

      {messages.length > 0 && (
        <Card className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-500">
                Thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </Card>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Ask a question about your data…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          disabled={loading}
        />
        <Button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
          Send
        </Button>
      </div>
    </div>
  )
}
