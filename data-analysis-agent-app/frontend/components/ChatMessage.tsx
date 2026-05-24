"use client"

import ReactMarkdown from "react-markdown"
import { ChartDisplay } from "@/components/ChartDisplay"
import { ChatMessage as ChatMessageType } from "@/lib/types"

interface Props {
  message: ChatMessageType
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? "bg-gray-900 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p>{message.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>
        {message.chart && <ChartDisplay chart={message.chart} />}
      </div>
    </div>
  )
}
