# GitHub Actions CI Design — AI Trend Aggregator

**Date:** 2026-03-20
**Status:** Approved

## Goal

Run the AI trend aggregator daily at 9 AM Melbourne time (AEDT, UTC+11) via GitHub Actions. Verify the full stack works in CI: custom YouTube MCP server, Claude Code Action, slash command, report generation, and commit.

## Approach

Build the custom MCP server in CI before invoking `claude-code-action`. Fix `.mcp.json` to use a relative path so it works on any machine, not just the local dev environment.

## Changes Required

| File | Change |
|------|--------|
| `.mcp.json` | Replace absolute local path with relative path `mcp/youtube/dist/index.js` |
| `.github/workflows/daily-trends.yml` | Update cron, add Node setup + MCP build step, pass `YOUTUBE_API_KEY`, remove Gmail mention from prompt |
| GitHub repo settings | Add `YOUTUBE_API_KEY` secret |

## Workflow Design

**Schedule:** `0 22 * * *` UTC = 9 AM AEDT (UTC+11). Drifts 1 hour to 10 AM in AEST (UTC+10) winter — acceptable.

**Steps:**
1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 18+)
3. Build MCP: `cd mcp/youtube && npm ci && npm run build`
4. `anthropics/claude-code-action@v1` — runs `/get-ai-trends` with MCP available
5. Commit + push report to `output/`

**Secrets:**
- `ANTHROPIC_API_KEY` — already referenced in workflow
- `YOUTUBE_API_KEY` — must be added to GitHub repo settings

## Verification

Use `workflow_dispatch` to manually trigger after pushing changes. Confirm:
- MCP server builds and loads without errors
- Claude fetches real YouTube results (not mock data)
- Report is saved to `output/YYYY-MM-DD-trends.md`
- Report is committed and pushed to the repo

## Out of Scope

- Gmail delivery (not yet configured)
- Timezone-aware cron (GitHub Actions limitation — accept 1-hour seasonal drift)
