# AI Trend Aggregator

A learning project for mastering Claude Code automation features while building a daily AI trend aggregator.

## What It Does

Fetches trending AI videos from YouTube each morning and delivers them as a clean markdown report via Gmail (and optionally Slack).

## Claude Code Features Demonstrated

| Feature | File | What It Shows |
|---------|------|---------------|
| CLAUDE.md | `CLAUDE.md` | Project-level instructions |
| MCP Servers | `.claude/settings.json` | Using npm MCP packages |
| Skill | `skills/ai-trends/skill.md` | Reusable prompt templates |
| Hook | `.claude/hooks.json` | Event-driven automation |
| Slash Command | `.claude/commands/get-ai-trends.md` | User-invocable commands |
| GitHub Action | `.github/workflows/daily-trends.yml` | Scheduled CI/CD with Claude |

## Setup

1. **Clone the repo** — MCP servers are auto-registered via `.claude/settings.json`:
   ```bash
   git clone https://github.com/OlI-Il/AI_trend.git
   cd AI_trend
   pip install -r requirements.txt
   ```

2. **Set up YouTube API key** (optional — transcripts work without it):
   ```bash
   cp .env.example .env
   # Edit .env and add your YOUTUBE_API_KEY
   ```

3. **Set up Gmail** (one-time OAuth flow):
   ```bash
   npx @shinzolabs/gmail-mcp auth
   ```

4. **GitHub Actions secrets** (for scheduled runs):
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `YOUTUBE_API_KEY` — your YouTube API key

## Usage

In Claude Code, type:
```
/get-ai-trends
```
