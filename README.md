# AI Trend Aggregator

A learning project for mastering Claude Code automation features while building a daily AI trend aggregator.

## What It Does

Fetches trending AI videos from YouTube each morning and delivers them as a clean markdown report. Reports are saved to `output/YYYY-MM-DD-trends.md`.

## Claude Code Features Demonstrated

| Feature | File | What It Shows |
|---------|------|---------------|
| CLAUDE.md | `CLAUDE.md` | Project-level instructions |
| MEMORY.md | `.claude/projects/.../memory/` | Persistent memory across conversations |
| MCP Server | `mcp/youtube/` | Custom-built YouTube MCP server |
| Skill | `skills/ai-trends/skill.md` | Reusable prompt templates |
| Hook | `.claude/hooks.json` | Event-driven automation |
| Slash Command | `.claude/commands/get-ai-trends.md` | User-invocable commands |
| GitHub Action | `.github/workflows/daily-trends.yml` | Scheduled CI/CD with Claude |
| Agents | — | Parallel subagent dispatch during execution |

## Project Structure

```
src/get_trends.py          — Core automation script
mcp/youtube/               — Custom-built YouTube MCP server
.mcp.json                  — MCP server registration (auto-loaded by Claude Code)
.claude/settings.json      — Claude Code permissions/settings
.claude/commands/          — Slash commands
.claude/hooks.json         — Hook configurations
skills/ai-trends/          — Custom skill definitions
.github/workflows/         — GitHub Actions
output/                    — Generated reports
```

## Setup

1. **Clone the repo** — the MCP server is auto-registered via `.mcp.json`:
   ```bash
   git clone https://github.com/OlI-Il/AI_trend.git
   cd AI_trend
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your YOUTUBE_API_KEY
   ```

3. **GitHub Actions secrets** (for scheduled runs):
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `YOUTUBE_API_KEY` — your YouTube API key

## Usage

In Claude Code, run the slash command:
```
/get-ai-trends
```

Or run the script directly (uses mock data without MCP):
```bash
python src/get_trends.py
```

## Future Goals

- Gmail delivery channel
- Slack delivery channel
- NotebookLM integration
- Multi-source aggregation (arxiv, HuggingFace, Twitter/X)
