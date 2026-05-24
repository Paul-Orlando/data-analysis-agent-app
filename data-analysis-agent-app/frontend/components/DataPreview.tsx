"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  rows: Record<string, unknown>[]
  rowCount: number
  colCount: number
}

export function DataPreview({ rows, rowCount, colCount }: Props) {
  const [open, setOpen] = useState(false)
  if (!rows.length) return null
  const headers = Object.keys(rows[0])

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-medium text-gray-700">
          Data Preview — {rowCount.toLocaleString()} rows × {colCount} columns
        </span>
        <Button variant="ghost" size="sm" className="text-xs">
          {open ? "Collapse ▲" : "Expand ▼"}
        </Button>
      </div>
      {open && (
        <div className="overflow-x-auto border-t">
          <table className="text-xs w-full">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-1.5 text-gray-700 whitespace-nowrap border-b border-gray-100 max-w-[200px] truncate">
                      {String(row[h] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
