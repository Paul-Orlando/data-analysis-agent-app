"use client"

import { useState } from "react"
import { FileUpload } from "@/components/FileUpload"
import { ModeSelector } from "@/components/ModeSelector"
import { ExpertiseSelector } from "@/components/ExpertiseSelector"
import { ScoreCard } from "@/components/ScoreCard"
import { ReportDisplay } from "@/components/ReportDisplay"
import { DataPreview } from "@/components/DataPreview"
import { SuggestedQuestions } from "@/components/SuggestedQuestions"
import { ChatInterface } from "@/components/ChatInterface"
import { ExportButton } from "@/components/ExportButton"
import { ChartBuilder } from "@/components/ChartBuilder"
import { Button } from "@/components/ui/button"
import { AnalysisMode, AnalysisResult, ExpertiseLevel } from "@/lib/types"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<AnalysisMode>("quick")
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>("expert")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>(undefined)

  async function handleAnalyze() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    setPendingQuestion(undefined)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mode", mode)
      formData.append("expertise_level", expertiseLevel)

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setResult(data)
    } catch {
      setError("Network error — is the analysis service running?")
    } finally {
      setLoading(false)
    }
  }

  function handleSuggestionSelect(q: string) {
    setPendingQuestion(q)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Data Analysis Agent</h1>
          <p className="mt-1 text-gray-500">Upload a dataset and get AI-powered insights in seconds</p>
        </div>

        <FileUpload onFileSelect={setFile} selectedFile={file} />

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Expertise level</p>
          <ExpertiseSelector level={expertiseLevel} onChange={setExpertiseLevel} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Analysis mode</p>
          <ModeSelector mode={mode} onModeChange={setMode} />
        </div>

        <Button className="w-full" size="lg" onClick={handleAnalyze} disabled={!file || loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </Button>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
        )}

        {result && (
          <div className="space-y-5">
            <ScoreCard data={result.scorecard} />

            <DataPreview
              rows={result.preview_rows}
              rowCount={result.scorecard.row_count}
              colCount={result.scorecard.col_count}
            />

            <div className="space-y-2">
              <ReportDisplay report={result.report} />
              <ExportButton
                content={result.report}
                filename="analysis-report"
              />
            </div>

            <ChartBuilder
              chartAggregations={result.chart_aggregations}
            />

            {result.suggestions.length > 0 && (
              <SuggestedQuestions
                questions={result.suggestions}
                onSelect={handleSuggestionSelect}
              />
            )}

            <ChatInterface
              sessionId={result.session_id}
              expertiseLevel={expertiseLevel}
              initialMessage={pendingQuestion}
              onInitialMessageConsumed={() => setPendingQuestion(undefined)}
            />
          </div>
        )}
      </div>
    </main>
  )
}
