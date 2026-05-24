export type AnalysisMode = "quick" | "deep"
export type ExpertiseLevel = "beginner" | "expert" | "executive"

export interface ScoreCardData {
  row_count: number
  col_count: number
  data_quality_score: number
  duplicate_row_count: number
}

export interface ChartData {
  type: "bar" | "line" | "scatter" | "histogram" | "pie"
  title: string
  x_label: string
  y_label: string
  data: Record<string, unknown>[]
  takeaway: string
}

export interface ChatMessage {
  role: "user" | "agent"
  text: string
  chart?: ChartData
}

export type ChartAggregations = Record<string, Record<string, { name: string; value: number }[]>>

export interface AnalysisResult {
  report: string
  scorecard: ScoreCardData
  session_id: string
  suggestions: string[]
  preview_rows: Record<string, unknown>[]
  chart_aggregations: ChartAggregations
}
