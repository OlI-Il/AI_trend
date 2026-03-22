# AI Trend — Project Instructions

## Purpose

Learning project to master Claude Code automation features while building a practical AI trend aggregator. Fetches trending AI videos from YouTube daily and delivers them via Gmail.

## Tech Stack

- **Language**: Python 3.11+
- **MCP**: @kirbah/mcp-youtube (npm), @shinzolabs/gmail-mcp (npm), Slack (built-in)
- **APIs**: YouTube Data API v3, Gmail API
- **CI/CD**: GitHub Actions with `claude-code-action`

## Key Commands

```bash
# Trigger via slash command in Claude Code
/get-ai-trends

# Run the trend fetcher manually (uses mock data without MCP)
python src/get_trends.py
```

## Conventions

- Reports saved to `output/YYYY-MM-DD-trends.md`
- All output in clean, concise markdown
- Use existing MCP tools before writing custom code
- Stubs return mock data until real API keys are configured

## MCP Servers

Registered in `.claude/settings.json` (committed — teammates get them automatically on clone).

| Server | Package | Purpose |
|--------|---------|---------|
| `youtube` | `@kirbah/mcp-youtube` (npm) | Search videos, get details, transcripts |
| `gmail` | `@shinzolabs/gmail-mcp` (npm) | Send trend reports via Gmail |
| `slack` | Built-in (claude.ai) | Post trends to Slack channels |
| `notion` | `@notionhq/notion-mcp-server` (npm) | Create trend report pages in Notion |

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys. Never commit `.env`.

## Project Structure

```
src/get_trends.py          — Core automation script
.claude/settings.json      — MCP server registration (npm packages, shared)
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
3. **MCP Server** — `.claude/settings.json` (npm packages: @kirbah/mcp-youtube, @shinzolabs/gmail-mcp)
4. **Skill** — `skills/ai-trends/skill.md`
5. **Hook** — `.claude/hooks.json` (post-tool-use logging)
6. **Slash Command** — `.claude/commands/get-ai-trends.md`
7. **GitHub Action** — `.github/workflows/daily-trends.yml`
8. **Agents** — Used during execution for parallel work

## Future Goals

- NotebookLM integration (browser automation or Google Docs workaround)
- Slack delivery channel
- Multi-source aggregation (arxiv, HuggingFace, Twitter/X)
