"use client"

import { useState, useMemo, useEffect } from "react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartAggregations } from "@/lib/types"

type ChartType = "bar" | "line" | "pie"

const COLORS = ["#4e79a7", "#f28e2b", "#59a14f", "#e15759", "#76b7b2", "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac"]

const CURRENCY_RE = /\b(sales?|profits?|revenue|price|cost|amount|income|total|earnings|spend|budget|fee|charges?|payment|value|worth|gross|net|margin)\b/i

function isCurrencyCol(col: string) {
  return CURRENCY_RE.test(col)
}

function fmtAxis(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function fmtTooltip(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
}

interface Props {
  chartAggregations: ChartAggregations
}

export function ChartBuilder({ chartAggregations }: Props) {
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [xCol, setXCol] = useState("")
  const [yCol, setYCol] = useState("")

  const catColumns = useMemo(() => Object.keys(chartAggregations ?? {}), [chartAggregations])

  const numericColumns = useMemo(
    () => Object.keys(chartAggregations?.[xCol] ?? {}).filter(k => k !== "__count__"),
    [chartAggregations, xCol]
  )

  useEffect(() => {
    if (!catColumns.length || xCol) return
    const preferred = ["Category", "Region", "Sub-Category", "Segment", "Ship Mode"]
    const match = preferred.find(c => catColumns.includes(c))
    setXCol(match ?? catColumns[0])
  }, [catColumns, xCol])

  useEffect(() => {
    if (!numericColumns.length || yCol) return
    const preferred = ["Sales", "Profit", "Quantity", "Discount"]
    const match = preferred.find(c => numericColumns.includes(c))
    setYCol(match ?? numericColumns[0])
  }, [numericColumns, yCol])

  const aggregated = useMemo(() => {
    if (!xCol) return null
    if (chartType === "pie") {
      return chartAggregations?.[xCol]?.["__count__"] ?? chartAggregations?.[xCol]?.[yCol] ?? null
    }
    return (xCol && yCol ? chartAggregations?.[xCol]?.[yCol] ?? null : null)
  }, [xCol, yCol, chartType, chartAggregations])

  const chartData = useMemo(() => {
    if (!xCol) return []
    return aggregated ?? []
  }, [xCol, aggregated])

  const chartTitle =
    chartType === "pie"
      ? `Distribution of ${xCol}`
      : xCol && yCol
      ? `${yCol} by ${xCol}`
      : ""

  const renderChart = () => {
    const isCurrency = isCurrencyCol(yCol)
    const axisFormatter = isCurrency ? fmtAxis : undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tooltipFormatter: any = isCurrency
      ? (value: unknown) => [fmtTooltip(Number(value ?? 0)), yCol]
      : undefined

    if (chartType === "bar") {
      return (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={55} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={axisFormatter} width={axisFormatter ? 55 : 40} />
          <Tooltip formatter={tooltipFormatter} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      )
    }
    if (chartType === "line") {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={55} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={axisFormatter} width={axisFormatter ? 55 : 40} />
          <Tooltip formatter={tooltipFormatter} />
          <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      )
    }
    return (
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Data Visualization</p>
        <span className="text-xs text-gray-400">Full dataset</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["bar", "line", "pie"] as ChartType[]).map(t => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              chartType === t
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {t === "bar" ? "Bar Chart" : t === "line" ? "Line Graph" : "Pie Chart"}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap items-end">
        <div className="space-y-1">
          <label className="text-xs text-gray-500 block">
            {chartType === "pie" ? "Category column" : "X axis"}
          </label>
          <select
            value={xCol}
            onChange={e => setXCol(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            {catColumns.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {chartType !== "pie" && (
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Y axis (numeric)</label>
            <select
              value={yCol}
              onChange={e => setYCol(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {numericColumns.length ? (
                numericColumns.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                <option value="">No numeric columns</option>
              )}
            </select>
          </div>
        )}
      </div>

      {chartTitle && <p className="text-xs text-gray-500 font-medium">{chartTitle}</p>}

      {!catColumns.length ? (
        <p className="text-xs text-gray-400 py-8 text-center">No categorical columns available for charting</p>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-gray-400 py-8 text-center">Select columns to generate a chart</p>
      )}
    </Card>
  )
}
