"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  questions: string[]
  onSelect: (q: string) => void
}

export function SuggestedQuestions({ questions, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  if (!questions.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggested questions</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className={`text-xs h-auto py-1.5 px-3 text-left whitespace-normal ${
              selected === q ? "border-gray-600 bg-gray-50 font-medium" : ""
            }`}
            onClick={() => {
              setSelected(q)
              onSelect(q)
            }}
          >
            {q}
          </Button>
        ))}
      </div>
    </div>
  )
}
