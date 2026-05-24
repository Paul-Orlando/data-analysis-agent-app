"use client"

import { Button } from "@/components/ui/button"

interface Props {
  content: string
  filename: string
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
}

async function downloadPDF(content: string, filename: string) {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()

  const lines = content.split("\n")
  let y = 20
  const margin = 15
  const pageWidth = doc.internal.pageSize.getWidth()
  const maxWidth = pageWidth - margin * 2

  for (const rawLine of lines) {
    if (y > 270) {
      doc.addPage()
      y = 20
    }

    const line = rawLine.trimEnd()

    if (line.startsWith("# ")) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      const wrapped = doc.splitTextToSize(stripMarkdown(line.slice(2)), maxWidth)
      doc.text(wrapped, margin, y)
      y += wrapped.length * 7 + 4
    } else if (line.startsWith("## ")) {
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      const wrapped = doc.splitTextToSize(stripMarkdown(line.slice(3)), maxWidth)
      doc.text(wrapped, margin, y)
      y += wrapped.length * 6 + 3
    } else if (line.startsWith("### ")) {
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      const wrapped = doc.splitTextToSize(stripMarkdown(line.slice(4)), maxWidth)
      doc.text(wrapped, margin, y)
      y += wrapped.length * 5.5 + 3
    } else if (/^[-*] /.test(line)) {
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const bulletText = "• " + stripMarkdown(line.slice(2))
      const wrapped = doc.splitTextToSize(bulletText, maxWidth - 5)
      doc.text(wrapped, margin + 3, y)
      y += wrapped.length * 5 + 2
    } else if (line.trim() === "") {
      y += 4
    } else {
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const wrapped = doc.splitTextToSize(stripMarkdown(line), maxWidth)
      doc.text(wrapped, margin, y)
      y += wrapped.length * 5 + 2
    }
  }

  doc.save(`${filename}.pdf`)
}

async function downloadDOCX(content: string, filename: string) {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import("docx")

  const children: InstanceType<typeof Paragraph>[] = []
  const lines = content.split("\n")

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.startsWith("# ")) {
      children.push(new Paragraph({ text: stripMarkdown(line.slice(2)), heading: HeadingLevel.HEADING_1 }))
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ text: stripMarkdown(line.slice(3)), heading: HeadingLevel.HEADING_2 }))
    } else if (line.startsWith("### ")) {
      children.push(new Paragraph({ text: stripMarkdown(line.slice(4)), heading: HeadingLevel.HEADING_3 }))
    } else if (/^[-*] /.test(line)) {
      children.push(new Paragraph({ children: [new TextRun(stripMarkdown(line.slice(2)))], bullet: { level: 0 } }))
    } else if (line.trim() === "") {
      children.push(new Paragraph({ text: "" }))
    } else {
      const runs: InstanceType<typeof TextRun>[] = []
      const boldRegex = /\*\*(.*?)\*\*/g
      let lastIndex = 0
      let match
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) runs.push(new TextRun(line.slice(lastIndex, match.index)))
        runs.push(new TextRun({ text: match[1], bold: true }))
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < line.length) runs.push(new TextRun(line.slice(lastIndex)))
      children.push(new Paragraph({ children: runs.length ? runs : [new TextRun(line)] }))
    }
  }

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportButton({ content, filename }: Props) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="text-xs" onClick={() => downloadPDF(content, filename)}>
        Download PDF
      </Button>
      <Button variant="outline" size="sm" className="text-xs" onClick={() => downloadDOCX(content, filename)}>
        Download DOCX
      </Button>
    </div>
  )
}
