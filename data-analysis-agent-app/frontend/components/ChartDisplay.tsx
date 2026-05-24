"use client"

import { useRef } from "react"
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartData } from "@/lib/types"

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2", "#be185d", "#65a30d"]

interface Props {
  chart: ChartData
}

export function ChartDisplay({ chart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  async function downloadPng() {
    const { toPng } = await import("html-to-image")
    if (!containerRef.current) return
    const url = await toPng(containerRef.current)
    const a = document.createElement("a")
    a.href = url
    a.download = `${chart.title.replace(/\s+/g, "_")}.png`
    a.click()
  }

  const renderChart = () => {
    switch (chart.type) {
      case "bar":
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS[0]} radius={[3, 3, 0, 0]} />
          </BarChart>
        )
      case "line":
        return (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot={false} />
          </LineChart>
        )
      case "scatter":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name={chart.x_label} tick={{ fontSize: 11 }} />
            <YAxis dataKey="y" name={chart.y_label} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chart.data} fill={COLORS[0]} />
          </ScatterChart>
        )
      case "histogram":
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS[4]} radius={[2, 2, 0, 0]} />
          </BarChart>
        )
      case "pie":
        return (
          <PieChart>
            <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {chart.data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
    }
  }

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">{chart.title}</p>
        <Button variant="ghost" size="sm" className="text-xs" onClick={downloadPng}>
          Download PNG
        </Button>
      </div>
      <div ref={containerRef} className="bg-white">
        <ResponsiveContainer width="100%" height={280}>
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
      </div>
      {chart.takeaway && (
        <p className="text-xs text-gray-500 italic border-t pt-2">{chart.takeaway}</p>
      )}
    </Card>
  )
}
