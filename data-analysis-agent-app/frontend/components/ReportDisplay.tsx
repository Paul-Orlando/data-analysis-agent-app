"use client"

import ReactMarkdown from "react-markdown"
import { Card } from "@/components/ui/card"

interface Props {
  report: string
}

export function ReportDisplay({ report }: Props) {
  return (
    <Card className="p-6 max-h-[60vh] overflow-y-auto">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    </Card>
  )
}
