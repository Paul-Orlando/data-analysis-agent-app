import json
import os
import re
from openai import OpenAI
from agent.agent_instructions_v8_1 import SYSTEM_PROMPT

client = OpenAI(
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1",
)

MODEL_NAME = os.environ.get("MODEL_NAME", "google/gemini-2.5-flash")

EXPERTISE_ADDENDUM = {
    "beginner": "The user is a beginner. Use simple language, define all technical terms, avoid math notation, and explain every finding clearly.",
    "expert": "The user is an expert. Be concise and technical. Skip definitions and basics.",
    "executive": "The user is an executive. Lead with the key conclusion first, follow with supporting evidence, end with a clear action. Max 5 bullets. No methodology detail.",
}


def analyze(summary: dict, mode: str, expertise_level: str = "expert") -> tuple[str, list[str]]:
    mode_label = "QUICK" if mode == "quick" else "DEEP"
    expertise_note = EXPERTISE_ADDENDUM.get(expertise_level, EXPERTISE_ADDENDUM["expert"])

    user_message = (
        f"Mode: {mode_label}\n"
        f"Expertise level: {expertise_level.upper()}\n"
        f"{expertise_note}\n\n"
        f"Dataset summary:\n```json\n{json.dumps(summary, indent=2)}\n```\n\n"
        "After your analysis, on a new line output exactly:\n"
        'SUGGESTIONS_JSON: ["Question 1?", "Question 2?", "Question 3?", "Question 4?"]\n'
        "The questions must be specific to this dataset's actual columns and findings."
    )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
    )

    content = response.choices[0].message.content

    suggestions: list[str] = []
    match = re.search(r"SUGGESTIONS_JSON:\s*(\[.*?\])", content, re.DOTALL)
    if match:
        try:
            suggestions = json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
        content = content[: match.start()].rstrip()

    return content, suggestions
