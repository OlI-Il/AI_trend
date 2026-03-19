# AI Trend — Project Instructions

## Purpose

Learning project to master Claude Code automation features while building a practical AI trend aggregator. Fetches trending AI videos from YouTube daily and delivers them via Gmail.

## Tech Stack

- **Language**: Python 3.11+
- **MCP**: FastMCP (custom YouTube server), Gmail (built-in), Slack (built-in)
- **APIs**: YouTube Data API v3
- **CI/CD**: GitHub Actions with `claude-code-action`

## Key Commands

```bash
# Start the YouTube MCP server locally
python -m src.mcp_youtube.server

# Run the trend fetcher manually
python src/get_trends.py

# Trigger via slash command in Claude Code
/get-ai-trends
```

## Conventions

- Reports saved to `output/YYYY-MM-DD-trends.md`
- All output in clean, concise markdown
- Use existing MCP tools before writing custom code
- Stubs return mock data until real API keys are configured

## MCP Servers

Registered in `.claude/settings.json` (committed — teammates get them automatically on clone).

| Server | Type | Purpose |
|--------|------|---------|
| `youtube` | Custom (local) | Search trending AI videos via YouTube Data API |
| `gmail` | Custom (local) | Send formatted trend reports via Gmail API |
| `slack` | Built-in (claude.ai) | Post trends to Slack channels |

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys. Never commit `.env`.

## Project Structure

```
src/get_trends.py          — Core automation script
src/mcp_youtube/server.py  — YouTube MCP server (FastMCP)
src/mcp_gmail/server.py    — Gmail MCP server (FastMCP)
.claude/settings.json      — MCP server registration (shared)
.claude/commands/           — Slash commands
.claude/hooks.json          — Hook configurations
skills/ai-trends/           — Custom skill definitions
.github/workflows/          — GitHub Actions
output/                     — Generated reports
```

## Learning Goals

Each Claude Code feature has one working example in this project:

1. **CLAUDE.md** — This file. Project instructions Claude reads automatically.
2. **MEMORY.md** — Persistent memory across conversations.
3. **MCP Server** — `src/mcp_youtube/server.py` (FastMCP)
4. **Skill** — `skills/ai-trends/skill.md`
5. **Hook** — `.claude/hooks.json` (post-tool-use logging)
6. **Slash Command** — `.claude/commands/get-ai-trends.md`
7. **GitHub Action** — `.github/workflows/daily-trends.yml`
8. **Agents** — Used during execution for parallel work

## Future Goals

- NotebookLM integration (browser automation or Google Docs workaround)
- Slack delivery channel
- Multi-source aggregation (arxiv, HuggingFace, Twitter/X)
