import json
import os
import re
import pandas as pd
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

EXPERTISE_INSTRUCTIONS = {
    "beginner": "The user is a beginner. Use simple language, define technical terms, avoid heavy math, and explain every finding clearly.",
    "expert": "The user is an expert data analyst. Be concise and technical. Skip definitions and basics.",
    "executive": "The user is an executive. Lead with the conclusion, follow with evidence, end with action. Max 5 bullets. No methodology detail.",
}

CHAT_SYSTEM_PROMPT = """You are an expert data analyst assistant. You have access to a dataset summary and can answer questions about it.

When answering:
- Base your answers on the actual data columns and statistics provided
- Be specific — reference real column names and values
- When a chart would help (or the user asks for one), include a CHART_SPEC_JSON line at the very end of your response

Chart spec format (use ONLY when a chart is appropriate):
CHART_SPEC_JSON: {"type":"bar|line|scatter|histogram|pie","title":"...","x_col":"...","y_col":"...","aggregation":"none|sum|mean|count","takeaway":"1-2 sentence insight about the chart"}

Chart selection rules:
- Categorical comparisons → bar
- Time series / trends → line
- Numeric vs numeric → scatter
- Single column distribution → histogram
- Proportions (≤5 categories) → pie, otherwise bar

Only output CHART_SPEC_JSON when a chart genuinely adds value. Never output it for purely textual answers.
"""


def _build_chart_data(df: pd.DataFrame, spec: dict) -> dict | None:
    try:
        chart_type = spec.get("type", "bar")
        x_col = spec.get("x_col")
        y_col = spec.get("y_col")
        aggregation = spec.get("aggregation", "none")

        if x_col not in df.columns:
            return None

        if chart_type == "histogram":
            if x_col not in df.select_dtypes(include="number").columns:
                return None
            series = df[x_col].dropna()
            counts, edges = pd.cut(series, bins=20, retbins=True)
            hist_data = (
                series.groupby(pd.cut(series, bins=20))
                .count()
                .reset_index()
            )
            data = [
                {"name": str(row.iloc[0]), "value": int(row.iloc[1])}
                for _, row in hist_data.iterrows()
            ]
            return {
                "type": "histogram",
                "title": spec.get("title", f"Distribution of {x_col}"),
                "x_label": x_col,
                "y_label": "Count",
                "data": data,
                "takeaway": spec.get("takeaway", ""),
            }

        if chart_type == "scatter":
            if y_col not in df.columns:
                return None
            sample = df[[x_col, y_col]].dropna().head(500)
            data = [{"x": row[x_col], "y": row[y_col]} for _, row in sample.iterrows()]
            return {
                "type": "scatter",
                "title": spec.get("title", f"{x_col} vs {y_col}"),
                "x_label": x_col,
                "y_label": y_col,
                "data": data,
                "takeaway": spec.get("takeaway", ""),
            }

        if y_col and y_col in df.columns and aggregation != "none":
            if aggregation == "sum":
                grouped = df.groupby(x_col)[y_col].sum()
            elif aggregation == "mean":
                grouped = df.groupby(x_col)[y_col].mean().round(2)
            elif aggregation == "count":
                grouped = df.groupby(x_col)[y_col].count()
            else:
                grouped = df.groupby(x_col)[y_col].sum()

            grouped = grouped.sort_values(ascending=False).head(20)
            data = [{"name": str(k), "value": round(float(v), 2)} for k, v in grouped.items()]
            y_label = y_col
        elif y_col and y_col in df.columns:
            sample = df[[x_col, y_col]].dropna().head(20)
            data = [{"name": str(row[x_col]), "value": round(float(row[y_col]), 2) if isinstance(row[y_col], (int, float)) else row[y_col]} for _, row in sample.iterrows()]
            y_label = y_col
        else:
            counts = df[x_col].value_counts().head(20)
            data = [{"name": str(k), "value": int(v)} for k, v in counts.items()]
            y_label = "Count"

        return {
            "type": chart_type,
            "title": spec.get("title", f"{x_col} by {y_col or 'Count'}"),
            "x_label": x_col,
            "y_label": y_label,
            "data": data,
            "takeaway": spec.get("takeaway", ""),
        }
    except Exception:
        return None


def reply(
    summary: dict,
    df: pd.DataFrame,
    message: str,
    history: list[dict],
    expertise_level: str = "expert",
) -> dict:
    expertise_note = EXPERTISE_INSTRUCTIONS.get(expertise_level, EXPERTISE_INSTRUCTIONS["expert"])

    system = (
        CHAT_SYSTEM_PROMPT
        + f"\n\nExpertise level: {expertise_level.upper()}\n{expertise_note}"
        + f"\n\nDataset summary:\n```json\n{json.dumps(summary, indent=2)}\n```"
    )

    messages = [{"role": "system", "content": system}]
    for h in history:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.3,
    )

    content = response.choices[0].message.content
    chart = None

    match = re.search(r"CHART_SPEC_JSON:\s*(\{.*?\})", content, re.DOTALL)
    if match:
        try:
            spec = json.loads(match.group(1))
            chart = _build_chart_data(df, spec)
        except json.JSONDecodeError:
            pass
        content = content[: match.start()].rstrip()

    return {"text": content, "chart": chart}
