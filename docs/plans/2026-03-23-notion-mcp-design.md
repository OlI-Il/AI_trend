# Design: Notion MCP Integration

**Date**: 2026-03-23
**Branch**: `feature/notion-mcp-integration`
**Status**: Approved

## Goal

Store daily AI trend reports in Notion (one page per day under a parent page) so the user can view reports directly in their Notion workspace, instead of browsing the GitHub repo.

## Decisions

- **MCP Server**: `@notionhq/notion-mcp-server` (official Notion package, npm, run via `npx`)
- **Page structure**: One Notion page per day, created under a parent "AI Trends" page
- **Existing flow**: Keep `output/` file + git commit as-is (remove later once Notion is proven)
- **Delivery**: Notion added as a new delivery channel alongside Gmail and Slack

## Notion Setup (manual, one-time)

1. Create a Notion integration at https://www.notion.so/profile/integrations → copy `ntn_` token
2. Create a parent page in Notion called "AI Trends"
3. Connect the integration to that parent page (page "..." menu → "Connect to")
4. Add `NOTION_TOKEN` and `NOTION_PARENT_PAGE_ID` to `.env`
5. Add both as GitHub repo secrets for CI

## Code Changes

| File | Change |
|------|--------|
| `.claude/settings.json` | Add `notion` MCP server config + `mcp__notion__*` permission |
| `.env.example` | Add `NOTION_TOKEN` and `NOTION_PARENT_PAGE_ID` |
| `skills/ai-trends/skill.md` | Add "Post to Notion" as delivery option |
| `.claude/commands/get-ai-trends.md` | Mention Notion delivery |
| `.github/workflows/daily-trends.yml` | Add Notion MCP config + page creation step, pass secrets |
| `CLAUDE.md` | Document Notion MCP in the MCP servers table |

## Out of Scope

- No custom MCP server — using the official package
- No Notion database — just pages under a parent page
- Not removing the `output/` git flow yet
