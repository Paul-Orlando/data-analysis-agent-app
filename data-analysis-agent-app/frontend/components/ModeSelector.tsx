"use client"

import { Button } from "@/components/ui/button"
import { AnalysisMode } from "@/lib/types"

interface Props {
  mode: AnalysisMode
  onModeChange: (mode: AnalysisMode) => void
}

export function ModeSelector({ mode, onModeChange }: Props) {
  return (
    <div className="flex gap-2">
      <Button
        variant={mode === "quick" ? "default" : "outline"}
        onClick={() => onModeChange("quick")}
        className="flex-1"
      >
        Quick
        <span className="ml-1 text-xs opacity-70">3–5 insights</span>
      </Button>
      <Button
        variant={mode === "deep" ? "default" : "outline"}
        onClick={() => onModeChange("deep")}
        className="flex-1"
      >
        Deep
        <span className="ml-1 text-xs opacity-70">Full EDA</span>
      </Button>
    </div>
  )
}
