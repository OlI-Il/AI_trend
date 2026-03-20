# GitHub Actions CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the daily AI trends workflow run end-to-end in GitHub Actions at 9 AM Melbourne time, including building the custom YouTube MCP server in CI.

**Architecture:** Fix `.mcp.json` to use a relative path (replacing the hardcoded absolute local path), then update the workflow to build the MCP before invoking `claude-code-action`. Claude Code Action inherits env vars from the runner, so the MCP subprocess gets `YOUTUBE_API_KEY` automatically.

**Tech Stack:** GitHub Actions, `anthropics/claude-code-action@v1`, Node 20, TypeScript (MCP server), Python 3.11+

---

## File Map

| File | Change |
|------|--------|
| `.gitignore` | Add `mcp/youtube/node_modules/` and `mcp/youtube/dist/` entries; remove `output/*.md` so reports are committed |
| `.mcp.json` | Replace absolute path with relative path |
| `.github/workflows/daily-trends.yml` | Update cron, add Node 20 setup + MCP build step, pass `YOUTUBE_API_KEY`, clean up prompt |

**Manual step (not in code):** Add `YOUTUBE_API_KEY` and `ANTHROPIC_API_KEY` secrets to GitHub repo settings → Settings → Secrets and variables → Actions.

---

## Task 1: Fix `.gitignore`

Three problems need fixing:
1. `mcp/youtube/node_modules/` is not gitignored — could be accidentally committed
2. `mcp/youtube/dist/` is not gitignored — the plan relies on it NOT being committed (built fresh in CI)
3. `output/*.md` IS gitignored — this silently prevents the workflow's commit step from doing anything; reports will never appear in the repo

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update `.gitignore`**

Replace the contents with:

```gitignore
__pycache__/
*.pyc
.env
credentials.json
token.json
mcp/youtube/node_modules/
mcp/youtube/dist/
.claude/settings.local.json
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "fix: gitignore MCP build artifacts, allow output reports to be committed"
```

---

## Task 2: Fix `.mcp.json` path

The current path `/Users/oli/Documents/AI_trend/mcp/youtube/dist/index.js` only works on your local machine. GitHub Actions checks out the repo at a dynamic path, so we use a relative path instead. Claude Code Action runs with the repo root as the working directory.

**Files:**
- Modify: `.mcp.json`

- [ ] **Step 1: Update `.mcp.json`**

Replace the contents with:

```json
{
  "mcpServers": {
    "youtube": {
      "command": "node",
      "args": ["mcp/youtube/dist/index.js"]
    }
  }
}
```

- [ ] **Step 2: Verify it still works locally**

Build the MCP, then start Claude Code and confirm the `youtube` MCP tools are available:

```bash
cd mcp/youtube && npm run build && cd ../..
# Open Claude Code and run /get-ai-trends — should work as before
```

- [ ] **Step 3: Commit**

```bash
git add .mcp.json
git commit -m "fix: use relative path in .mcp.json for CI compatibility"
```

---

## Task 3: Update the GitHub Actions workflow

Four things to fix:
1. Add Node 20 setup + MCP build step (`dist/` is not committed, must be built fresh in CI)
2. Update cron to 9 AM Melbourne time (AEDT = UTC+11 → `0 22 * * *`)
3. Pass `YOUTUBE_API_KEY` as env var so the MCP subprocess can access it
4. Remove the Gmail mention from the prompt (not configured)

**Files:**
- Modify: `.github/workflows/daily-trends.yml`

- [ ] **Step 1: Rewrite the workflow**

Replace `.github/workflows/daily-trends.yml` with:

```yaml
name: Daily AI Trends

on:
  schedule:
    # 9 AM Melbourne time (AEDT, UTC+11). Drifts 1 hour to 10 AM in AEST (UTC+10) winter.
    - cron: '0 22 * * *'
  workflow_dispatch: # Allow manual trigger for testing

permissions:
  contents: write

jobs:
  fetch-trends:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build YouTube MCP server
        run: cd mcp/youtube && npm ci && npm run build

      - name: Fetch AI trends with Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Run the /get-ai-trends slash command to fetch today's trending AI videos.
            Save the report to output/ with the filename format YYYY-MM-DD-trends.md.
        env:
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}

      - name: Commit trend report
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add output/
          git diff --staged --quiet || git commit -m "Add daily AI trends report for $(date +%Y-%m-%d)"
          git push
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/daily-trends.yml
git commit -m "ci: build MCP in CI, update schedule to 9 AM Melbourne time"
```

---

## Task 4: Add secrets to GitHub repo

This is a manual step in the GitHub UI — it cannot be done via code.

- [ ] **Step 1: Add `YOUTUBE_API_KEY` secret**

Go to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

- Name: `YOUTUBE_API_KEY`
- Value: your YouTube Data API v3 key from Google Cloud Console

- [ ] **Step 2: Confirm `ANTHROPIC_API_KEY` is set**

On the same page, verify `ANTHROPIC_API_KEY` exists. Add it if not.

---

## Task 5: Verify with manual trigger

- [ ] **Step 1: Push all changes**

```bash
git push
```

- [ ] **Step 2: Trigger the workflow manually**

Go to: **GitHub repo → Actions → Daily AI Trends → Run workflow → Run workflow**

- [ ] **Step 3: Check the logs**

Watch the run. Confirm each step passes:
- "Build YouTube MCP server" — no TypeScript compile errors
- "Fetch AI trends" — Claude runs `/get-ai-trends` and saves a report
- "Commit trend report" — commits and pushes to the repo

- [ ] **Step 4: Verify the output**

Pull the latest changes and inspect the generated report:

```bash
git pull
ls output/
cat output/$(date +%Y-%m-%d)-trends.md
```

Expected: a markdown report with real YouTube video titles, not the mock "Sample: GPT-5 Is Here" data.
