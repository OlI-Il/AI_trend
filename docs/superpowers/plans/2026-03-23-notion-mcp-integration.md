# Notion MCP Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Notion as a delivery channel for daily AI trend reports, creating one page per day under a parent Notion page.

**Architecture:** Register the official `@notionhq/notion-mcp-server` npm package in `.claude/settings.json`. The skill and slash command gain a "Post to Notion" option. The GitHub Action creates a Notion page after generating the report. Existing `output/` git flow remains unchanged.

**Tech Stack:** `@notionhq/notion-mcp-server` (official npm), Notion API, GitHub Actions

**Design doc:** `docs/plans/2026-03-23-notion-mcp-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `.claude/settings.json` | Modify | Add Notion MCP server config + permission |
| `.env.example` | Modify | Document `NOTION_TOKEN` and `NOTION_PARENT_PAGE_ID` |
| `skills/ai-trends/skill.md` | Modify | Add Notion as delivery option |
| `.claude/commands/get-ai-trends.md` | Modify | Mention Notion delivery |
| `.github/workflows/daily-trends.yml` | Modify | Add Notion MCP + page creation to CI |
| `CLAUDE.md` | Modify | Document Notion MCP in tables |

---

### Task 1: Register Notion MCP Server

**Files:**
- Modify: `.claude/settings.json`

- [ ] **Step 1: Add Notion MCP server and permission to settings.json**

Update `.claude/settings.json` to add the Notion MCP server and permission:

```json
{
  "permissions": {
    "allow": [
      "Write(output/**)",
      "mcp__youtube__*",
      "mcp__notion__*"
    ]
  },
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/settings.json
git commit -m "feat: register Notion MCP server in settings.json"
```

---

### Task 2: Update Environment Variable Documentation

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add Notion env vars to .env.example**

Append to `.env.example`:

```bash
# Notion Integration
# 1. Create an integration at https://www.notion.so/profile/integrations
# 2. Copy the "Internal Integration Secret" (starts with ntn_)
# 3. In Notion, connect the integration to your "AI Trends" parent page
#    (page "..." menu → "Connect to" → select your integration)
NOTION_TOKEN=your_notion_token_here

# The ID of the parent Notion page where daily reports are created.
# Find it in the page URL: notion.so/Your-Page-Title-<PAGE_ID>
# (the 32-character hex string at the end, add dashes to make a UUID)
NOTION_PARENT_PAGE_ID=your_parent_page_id_here
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add Notion env vars to .env.example"
```

---

### Task 3: Update Skill to Include Notion Delivery

**Files:**
- Modify: `skills/ai-trends/skill.md`

- [ ] **Step 1: Add Notion as a delivery option in the skill**

In `skills/ai-trends/skill.md`, update step 4 (Delivery options) to include Notion. Replace the current delivery section:

```markdown
4. **Delivery options**: Ask the user how they'd like to receive the report:
   - View it here (display in chat)
   - Send via Gmail (use Gmail MCP)
   - Post to Slack (use Slack MCP)
   - Save to Notion (use Notion MCP — create a page under the parent page with the report content)
```

- [ ] **Step 2: Commit**

```bash
git add skills/ai-trends/skill.md
git commit -m "feat: add Notion as delivery option in ai-trends skill"
```

---

### Task 4: Update Slash Command

**Files:**
- Modify: `.claude/commands/get-ai-trends.md`

- [ ] **Step 1: Add Notion mention to slash command**

In `.claude/commands/get-ai-trends.md`, update step 4 to include Notion. Replace the current last step:

```markdown
4. Ask the user how they'd like to receive the report: send via Gmail (use Gmail MCP), post to Slack (use Slack MCP), or save to Notion (use Notion MCP to create a new page titled "AI Trends — YYYY-MM-DD" under the configured parent page, with the report as the page content).
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/get-ai-trends.md
git commit -m "feat: add Notion delivery option to slash command"
```

---

### Task 5: Update GitHub Action for Notion Delivery

**Files:**
- Modify: `.github/workflows/daily-trends.yml`

- [ ] **Step 1: Add NOTION_TOKEN and NOTION_PARENT_PAGE_ID to env block**

In the `fetch-trends` job, add to the `env:` section:

```yaml
env:
  YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
  NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
  NOTION_PARENT_PAGE_ID: ${{ secrets.NOTION_PARENT_PAGE_ID }}
```

- [ ] **Step 2: Add Notion MCP server to the MCP config step**

Update the "Create MCP config" step to include the Notion server. The full config becomes:

```yaml
      - name: Create MCP config
        run: |
          if [ -z "${YOUTUBE_API_KEY}" ]; then
            echo "::error::YOUTUBE_API_KEY is empty or missing. Set it in repo secrets."
            exit 1
          fi

          cat > /tmp/mcp-config.json << EOF
          {
            "mcpServers": {
              "youtube": {
                "command": "node",
                "args": ["${{ github.workspace }}/mcp/youtube/dist/index.js"],
                "env": {
                  "YOUTUBE_API_KEY": "${YOUTUBE_API_KEY}"
                }
              },
              "notion": {
                "command": "npx",
                "args": ["-y", "@notionhq/notion-mcp-server"],
                "env": {
                  "NOTION_TOKEN": "${NOTION_TOKEN}"
                }
              }
            }
          }
          EOF
```

- [ ] **Step 3: Update the Claude Code action prompt to include Notion page creation**

Update the `prompt` in the "Fetch AI trends with Claude Code" step. Add Notion instructions and allow Notion tools:

```yaml
      - name: Fetch AI trends with Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: |
            --model claude-sonnet-4-6
            --allowedTools "Write,Bash(python*),mcp__youtube__*,mcp__notion__*"
            --mcp-config /tmp/mcp-config.json
          show_full_output: "true"
          prompt: |
            IMPORTANT: Do NOT create any Python scripts or code files. Do NOT write to any .py files.
            Only use MCP tools and the Write tool to create the final markdown report.

            Today's date is ${{ steps.date.outputs.today }}.

            Use the youtube MCP tools (mcp__youtube__youtube_search_videos, mcp__youtube__youtube_get_video)
            to search for the top 10 trending AI videos from the last 24 hours. Search for:
            "artificial intelligence", "LLM", "AI agents", "generative AI".
            For each video collect title, channel, views, URL.
            Write the markdown report directly to output/${{ steps.date.outputs.today }}-trends.md with a table
            of results and a highlights section. Use the Write tool to create the report file — do not use
            Bash or Python to write it.

            After saving the report file, also create a Notion page:
            - Use the Notion MCP to create a new page under parent page ID "${{ env.NOTION_PARENT_PAGE_ID }}"
            - Title the page "AI Trends — ${{ steps.date.outputs.today }}"
            - Include the full report content as the page body
            - If Notion creation fails (e.g. missing token), log a warning but do not fail the workflow
        env:
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
```

- [ ] **Step 4: Add Notion debug info to the debug step**

Update the "Debug MCP setup" step to also check Notion config:

```yaml
          echo "=== NOTION_TOKEN present ==="
          if [ -n "${NOTION_TOKEN}" ]; then echo "yes"; else echo "no"; fi
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/daily-trends.yml
git commit -m "feat: add Notion MCP to GitHub Action workflow"
```

---

### Task 6: Update Project Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add Notion to the MCP Servers table in CLAUDE.md**

Add a row to the MCP Servers table:

```markdown
| `notion` | `@notionhq/notion-mcp-server` (npm) | Create trend report pages in Notion |
```

- [ ] **Step 2: Add NOTION_TOKEN and NOTION_PARENT_PAGE_ID to Environment Variables section**

If there's no env vars section with details, add a note that `.env.example` documents the required variables.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Notion MCP to project documentation"
```

---

## Prerequisites (manual)

Before the GitHub Action will work, add these **GitHub repository secrets**:
- `NOTION_TOKEN` — the Notion integration secret (`ntn_...`)
- `NOTION_PARENT_PAGE_ID` — the parent page ID from the Notion URL

---

## Verification

After all tasks are complete:

1. Confirm `npx -y @notionhq/notion-mcp-server` runs without errors locally (needs `NOTION_TOKEN` in `.env`)
2. Manually test the slash command `/get-ai-trends` and choose "Notion" delivery
3. Verify a page appears in Notion under the parent page with correct title and content
4. Trigger the GitHub Action manually via `workflow_dispatch` and confirm both `output/` file and Notion page are created
