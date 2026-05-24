import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoreCardData } from "@/lib/types"

function qualityVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 80) return "default"
  if (score >= 60) return "secondary"
  return "destructive"
}

interface Props {
  data: ScoreCardData
}

export function ScoreCard({ data }: Props) {
  const metrics = [
    { label: "Rows", value: data.row_count.toLocaleString() },
    { label: "Columns", value: data.col_count.toLocaleString() },
    { label: "Duplicate Rows", value: data.duplicate_row_count.toLocaleString() },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map(({ label, value }) => (
        <Card key={label} className="p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </Card>
      ))}
      <Card className="p-4 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Data Quality</p>
        <div className="mt-2 flex justify-center">
          <Badge variant={qualityVariant(data.data_quality_score)} className="text-lg px-3 py-1">
            {data.data_quality_score}
          </Badge>
        </div>
      </Card>
    </div>
  )
}
