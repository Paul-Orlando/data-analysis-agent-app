"use client"

import { Button } from "@/components/ui/button"
import { ExpertiseLevel } from "@/lib/types"

interface Props {
  level: ExpertiseLevel
  onChange: (level: ExpertiseLevel) => void
}

const levels: { value: ExpertiseLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "expert", label: "Expert" },
  { value: "executive", label: "Executive" },
]

export function ExpertiseSelector({ level, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {levels.map((l) => (
        <Button
          key={l.value}
          variant={level === l.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(l.value)}
          className="flex-1"
        >
          {l.label}
        </Button>
      ))}
    </div>
  )
}
