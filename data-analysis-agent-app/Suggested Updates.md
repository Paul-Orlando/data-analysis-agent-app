# Data Analysis Agent App — Suggested Updates
# Version 2.0 Build Brief

## Overview
Upgrade the app from a static report generator to a true interactive data analysis agent.

---

## Feature 1 — Chat Interface

Add a conversational chat interface below the initial analysis report.

- Chat input box with send button appears after initial analysis completes
- User can type follow-up questions about their dataset
- Agent responds with data-backed answers
- Full conversation history displayed in chat thread
- Agent remembers dataset context across all messages
- Loading indicator while agent is thinking
- Clear conversation button to reset chat

Example questions the agent handles:
- "Show me sales by region"
- "What is driving the negative profits?"
- "Which category has the highest margin?"
- "Compare Q1 vs Q2 performance"
- "What are the top 10 products by revenue?"
- "Is there a correlation between discount and profit?"
- "Show me the distribution of order quantities"
- "Which customer segment is most profitable?"

---

## Feature 2 — Chart and Graph Generation

Generate and display charts inline in the chat when the user requests a visualization or when the agent determines a chart would help.

Uses recharts for all chart rendering in the frontend.

Chart types supported:
- Bar chart — categorical comparisons
- Line chart — time series and trends
- Scatter plot — numeric relationships
- Histogram — distributions
- Pie chart — proportions (max 5 categories only)

Chart selection rules (agent decides automatically):
- Categorical comparisons → bar chart
- Time series → line chart
- Numeric relationships → scatter plot
- Distributions → histogram
- Proportions → bar chart preferred, pie if ≤5 categories

Chart display:
- Renders inline below agent text response
- Chart title + labeled axes
- 1–2 sentence takeaway below each chart
- Download chart as PNG button
- Responsive — fits chat container width

---

## Feature 3 — Dataset Memory and Session Storage

Store the parsed dataframe in backend session memory so every follow-up chat message can query the actual data.

Backend:
- Store parsed dataframe in server-side session dict keyed by session ID
- Generate unique session ID on file upload
- Session expires after 30 minutes of inactivity
- POST /chat endpoint alongside existing /analyze

Frontend:
- Store session ID in React state after upload
- Pass session ID with every chat message
- Handle session expiry gracefully

---

## Feature 4 — Suggested Follow-Up Questions

After the initial analysis report, show 3–4 suggested follow-up questions.

- Questions generated dynamically based on what the agent found
- Displayed as clickable chips/buttons below the initial report
- Clicking a suggestion populates and submits the chat input automatically
- Questions disappear after one is selected

Example suggestions for Superstore data:
- "Show profit by region as a bar chart"
- "What is causing the negative profits?"
- "Show sales trend over time as a line chart"
- "Which category performs best?"

---

## Feature 5 — Expertise Level Selector

Add an expertise level selector alongside the Quick/Deep mode toggle.

Options: Beginner | Expert (default) | Executive

Behavior per level:
- Beginner: simple language, define terms, minimal math
- Expert: concise, technical, skip basics
- Executive: max 5 bullets, conclusion → evidence → action

---

## Feature 6 — Data Preview Table

Collapsible data preview showing the first 10 rows after file upload.

- Collapsed by default — click to expand
- Shows first 10 rows in a scrollable table
- Horizontal scroll for wide datasets
- Row and column count shown in header

---

## Feature 7 — Export Options

Download buttons for saving analysis output.

- Download full report as markdown (.md file)
- Download individual charts as PNG images
- Download conversation history as markdown
- Export buttons appear at bottom of report and after each chart

---

## UI Layout

```
┌─────────────────────────────────────┐
│         Data Analysis Agent         │
│  Upload a dataset for AI insights   │
├─────────────────────────────────────┤
│  [File Upload Area]                 │
│  Expertise: Beginner Expert Executive│
│  Mode: Quick | Deep                 │
│  [Analyze Button]                   │
├─────────────────────────────────────┤
│  DATA PREVIEW (collapsed)           │
│  > Click to expand first 10 rows    │
├─────────────────────────────────────┤
│  DATA QUALITY SCORECARD             │
├─────────────────────────────────────┤
│  INITIAL ANALYSIS REPORT            │
│  [Download Report]                  │
├─────────────────────────────────────┤
│  SUGGESTED QUESTIONS                │
│  [Chip 1] [Chip 2] [Chip 3]        │
├─────────────────────────────────────┤
│  CHAT WITH YOUR DATA                │
│  Agent: [response + inline chart]  │
│  User: [message]                    │
│  [Type your question...] [Send]    │
└─────────────────────────────────────┘
```

---

## Testing Checklist (Sample-Superstore.xls)

- [ ] Upload file and get initial report
- [ ] Data Quality Scorecard displays correctly
- [ ] Suggested questions appear after report
- [ ] Click suggested question — chat responds
- [ ] Ask "show profit by region as a bar chart"
- [ ] Bar chart renders inline with takeaway
- [ ] Ask "show sales trend over time"
- [ ] Line chart renders inline
- [ ] Switch expertise level — response changes tone
- [ ] Expand data preview — first 10 rows show
- [ ] Download report as markdown
- [ ] Download chart as PNG
- [ ] Session persists across multiple questions
- [ ] Clear conversation resets chat only
- [ ] Upload new file — new session starts

---

## Technical Notes

### Backend /chat endpoint
```
POST /chat
Body: { session_id, message, conversation_history, expertise_level }
Returns: { text, chart }

chart structure:
{
  "type": "bar|line|scatter|histogram|pie",
  "title": "Chart Title",
  "x_label": "X Axis Label",
  "y_label": "Y Axis Label",
  "data": [{"name": "Category", "value": 1234}],
  "takeaway": "1-2 sentence insight"
}
```

### Session storage
- Python dict keyed by UUID session ID
- Value: `{df: DataFrame, summary: dict, last_accessed: float}`
- TTL: 30 minutes inactivity

### New frontend packages
- recharts — chart rendering
- file-saver — download exports
- @types/file-saver — TypeScript types

---

## Deployment Notes

Frontend env vars (Vercel):
```
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
```

Backend env vars (Railway):
```
OPENAI_API_KEY=your_key
SESSION_TIMEOUT_MINUTES=30
```

Railway Procfile:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

GitHub repo: https://github.com/Paul-Orlando/data-analysis-agent-app
Commit message: "Upgrade to interactive agent — chat, charts, session memory"
