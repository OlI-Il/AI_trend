# AI Trend Aggregator

A learning project for mastering Claude Code automation features while building a daily AI trend aggregator.

## What It Does

Fetches trending AI videos from YouTube each morning and delivers them as a clean markdown report via Gmail (and optionally Slack).

## Claude Code Features Demonstrated

| Feature | File | What It Shows |
|---------|------|---------------|
| CLAUDE.md | `CLAUDE.md` | Project-level instructions |
| MCP Server | `src/mcp_youtube/server.py` | Custom tool server with FastMCP |
| Skill | `skills/ai-trends/skill.md` | Reusable prompt templates |
| Hook | `.claude/hooks.json` | Event-driven automation |
| Slash Command | `.claude/commands/get-ai-trends.md` | User-invocable commands |
| GitHub Action | `.github/workflows/daily-trends.yml` | Scheduled CI/CD with Claude |

## Setup

1. **Clone and install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up YouTube API key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable YouTube Data API v3
   - Create an API key
   - Set `YOUTUBE_API_KEY` environment variable

3. **Register the MCP server** in Claude Code settings (see `CLAUDE.md` for details)

4. **GitHub Actions secrets** (for scheduled runs):
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `YOUTUBE_API_KEY` — your YouTube API key

## Usage

In Claude Code, type:
```
/get-ai-trends
```

Or run directly:
```bash
python src/get_trends.py
```
