import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat, CHARACTER_LIMIT } from "../constants.js";
import { searchVideos, handleApiError, formatNumber } from "../youtube-client.js";
import type { YouTubeSearchResult } from "../types.js";

const SearchInputSchema = z.object({
  query: z
    .string()
    .min(1, "Query must be at least 1 character")
    .max(500, "Query must not exceed 500 characters")
    .describe("Search query to find YouTube videos (e.g., 'AI agents tutorial 2024')"),
  max_results: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("Maximum number of results to return (1–50, default: 10)"),
  order: z
    .enum(["relevance", "date", "rating", "viewCount", "title"])
    .default("relevance")
    .describe("Sort order for results: relevance, date, rating, viewCount, or title"),
  page_token: z
    .string()
    .optional()
    .describe("Pagination token from a previous search response to get the next page"),
  response_format: z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

function formatMarkdown(results: YouTubeSearchResult[], total: number, nextPageToken?: string): string {
  const lines: string[] = [
    `# YouTube Search Results`,
    "",
    `Found approximately ${formatNumber(String(total))} results (showing ${results.length})`,
    "",
  ];

  for (const video of results) {
    const date = new Date(video.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    lines.push(`## ${video.title}`);
    lines.push(`- **Video ID**: \`${video.videoId}\``);
    lines.push(`- **Channel**: ${video.channelTitle}`);
    lines.push(`- **Published**: ${date}`);
    lines.push(`- **URL**: https://www.youtube.com/watch?v=${video.videoId}`);
    if (video.description) {
      const snippet = video.description.slice(0, 200).replace(/\n/g, " ");
      lines.push(`- **Description**: ${snippet}${video.description.length > 200 ? "…" : ""}`);
    }
    lines.push("");
  }

  if (nextPageToken) {
    lines.push(`> **More results available** — use \`page_token: "${nextPageToken}"\` to get the next page.`);
  }

  return lines.join("\n");
}

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "youtube_search_videos",
    {
      title: "Search YouTube Videos",
      description: `Search YouTube for videos matching a query using the YouTube Data API v3.

Returns a list of videos with their IDs, titles, channel names, publish dates, and descriptions.
Use the returned video IDs with youtube_get_video to fetch full details, or youtube_get_transcript for transcripts.

Args:
  - query (string): Search query (e.g., "GPT-4o tutorial", "LLM fine-tuning 2024")
  - max_results (number): 1–50 results per page (default: 10)
  - order ('relevance'|'date'|'rating'|'viewCount'|'title'): Sort order (default: 'relevance')
  - page_token (string): Pagination token from a previous response
  - response_format ('markdown'|'json'): Output format (default: 'markdown')

Returns (markdown): Formatted list with title, video ID, channel, date, URL, and description snippet.
Returns (json): { total, count, nextPageToken?, has_more, items: [{ videoId, title, description, channelTitle, channelId, publishedAt, thumbnailUrl }] }

Examples:
  - "Find recent AI trend videos" → query="AI trends 2024", order="date"
  - "Find popular LLM tutorials" → query="LLM tutorial", order="viewCount"
  - Paginate → use page_token from previous response`,
      inputSchema: SearchInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const results = await searchVideos({
          query: params.query,
          maxResults: params.max_results ?? 10,
          order: params.order ?? "relevance",
          pageToken: params.page_token,
        });

        if (results.items.length === 0) {
          return { content: [{ type: "text", text: `No videos found for query: "${params.query}"` }] };
        }

        let text: string;
        if ((params.response_format ?? ResponseFormat.MARKDOWN) === ResponseFormat.JSON) {
          text = JSON.stringify(results, null, 2);
        } else {
          text = formatMarkdown(results.items, results.total, results.nextPageToken);
        }

        if (text.length > CHARACTER_LIMIT) {
          const truncated = { ...results, items: results.items.slice(0, Math.ceil(results.items.length / 2)), truncated: true };
          text = JSON.stringify(truncated, null, 2);
        }

        return {
          content: [{ type: "text", text }],
          structuredContent: results as unknown as Record<string, unknown>,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}
