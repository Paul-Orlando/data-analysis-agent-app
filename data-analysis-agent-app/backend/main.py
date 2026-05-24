import os
import time
import uuid
from dotenv import load_dotenv

load_dotenv(override=True)

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent.parser import parse_file
from agent.analyst import analyze
from agent.chat import reply

app = FastAPI(title="Data Analysis Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# In-memory session store: {session_id: {df, summary, last_accessed}}
sessions: dict = {}
SESSION_TTL = 30 * 60  # 30 minutes


def _cleanup_sessions():
    now = time.time()
    expired = [sid for sid, s in sessions.items() if now - s["last_accessed"] > SESSION_TTL]
    for sid in expired:
        del sessions[sid]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_file(
    file: UploadFile = File(...),
    mode: str = Form("quick"),
    expertise_level: str = Form("expert"),
):
    _cleanup_sessions()

    if mode not in ("quick", "deep"):
        raise HTTPException(status_code=400, detail="mode must be 'quick' or 'deep'")
    if expertise_level not in ("beginner", "expert", "executive"):
        expertise_level = "expert"

    allowed_extensions = {"csv", "xlsx", "xls", "json"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    try:
        summary, df = parse_file(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {e}")

    try:
        report, suggestions = analyze(summary, mode, expertise_level)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {e}")

    session_id = str(uuid.uuid4())
    sessions[session_id] = {"df": df, "summary": summary, "last_accessed": time.time()}

    return {
        "report": report,
        "scorecard": {
            "row_count": summary["row_count"],
            "col_count": summary["col_count"],
            "data_quality_score": summary["data_quality_score"],
            "duplicate_row_count": summary["duplicate_row_count"],
        },
        "session_id": session_id,
        "suggestions": suggestions,
        "preview_rows": summary["preview_rows"],
        "chart_aggregations": summary["chart_aggregations"],
    }


class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: list = []
    expertise_level: str = "expert"


@app.post("/chat")
async def chat(req: ChatRequest):
    _cleanup_sessions()

    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired. Please re-upload your file.")

    session["last_accessed"] = time.time()

    try:
        result = reply(
            summary=session["summary"],
            df=session["df"],
            message=req.message,
            history=req.history,
            expertise_level=req.expertise_level,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chat failed: {e}")

    return result
