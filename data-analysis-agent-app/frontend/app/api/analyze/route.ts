import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "https://data-analysis-agent-app-production.up.railway.app"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Analysis failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to reach analysis service" },
      { status: 502 }
    )
  }
}
