"use client"

import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface Props {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export function FileUpload({ onFileSelect, selectedFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    onFileSelect(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card
      className={`border-2 border-dashed cursor-pointer transition-colors p-8 text-center ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        className="hidden"
        onChange={onInputChange}
      />
      {selectedFile ? (
        <div className="space-y-1">
          <p className="font-medium text-gray-800">{selectedFile.name}</p>
          <p className="text-sm text-gray-500">{formatBytes(selectedFile.size)}</p>
          <p className="text-xs text-gray-400">Click or drop to replace</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">Drop your file here or click to browse</p>
          <p className="text-sm text-gray-400">Supports CSV, Excel (.xlsx / .xls), JSON — max 10 MB</p>
        </div>
      )}
    </Card>
  )
}
