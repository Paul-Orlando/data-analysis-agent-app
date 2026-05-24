import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: data.detail || "Chat failed" }, { status: response.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to reach analysis service" }, { status: 502 })
  }
}
