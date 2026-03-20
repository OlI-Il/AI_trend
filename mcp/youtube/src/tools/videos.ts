import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { getVideoDetails, handleApiError, formatDuration, formatNumber } from "../youtube-client.js";
import type { YouTubeVideoDetails } from "../types.js";

const VideoInputSchema = z.object({
  video_id: z
    .string()
    .min(1, "Video ID is required")
    .describe("YouTube video ID (e.g., 'dQw4w9WgXcQ'). Found in the URL: youtube.com/watch?v=<video_id>"),
  response_format: z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

function formatMarkdown(video: YouTubeVideoDetails): string {
  const date = new Date(video.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lines: string[] = [
    `# ${video.title}`,
    "",
    `- **Channel**: ${video.channelTitle} (\`${video.channelId}\`)`,
    `- **Published**: ${date}`,
    `- **Duration**: ${formatDuration(video.duration)}`,
    `- **Views**: ${formatNumber(video.viewCount)}`,
    `- **Likes**: ${formatNumber(video.likeCount)}`,
    `- **Comments**: ${formatNumber(video.commentCount)}`,
    `- **URL**: https://www.youtube.com/watch?v=${video.videoId}`,
    "",
    `## Description`,
    "",
    video.description || "_No description provided._",
  ];

  if (video.tags.length > 0) {
    lines.push("", `## Tags`, "", video.tags.map((t) => `\`${t}\``).join(", "));
  }

  return lines.join("\n");
}

export function registerVideoTool(server: McpServer): void {
  server.registerTool(
    "youtube_get_video",
    {
      title: "Get YouTube Video Details",
      description: `Fetch detailed information about a YouTube video by its ID, using the YouTube Data API v3.

Returns the video's title, channel, publish date, duration, view/like/comment counts, description, and tags.
Use youtube_search_videos to find video IDs, or extract them from YouTube URLs (youtube.com/watch?v=<video_id>).

Args:
  - video_id (string): YouTube video ID (e.g., 'dQw4w9WgXcQ')
  - response_format ('markdown'|'json'): Output format (default: 'markdown')

Returns (markdown): Formatted card with all video metadata.
Returns (json): { videoId, title, description, channelTitle, channelId, publishedAt, duration, viewCount, likeCount, commentCount, thumbnailUrl, tags, categoryId }

Examples:
  - After searching, get details: video_id="abc123"
  - Check video stats: video_id="dQw4w9WgXcQ"

Errors:
  - "Resource not found" if the video ID doesn't exist or the video is private/deleted
  - "API key invalid or quota exceeded" if YOUTUBE_API_KEY is missing or quota is exhausted`,
      inputSchema: VideoInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const video = await getVideoDetails(params.video_id);

        if (!video) {
          return {
            content: [{
              type: "text",
              text: `No video found with ID "${params.video_id}". It may be private, deleted, or the ID may be incorrect.`,
            }],
          };
        }

        let text: string;
        if ((params.response_format ?? ResponseFormat.MARKDOWN) === ResponseFormat.JSON) {
          text = JSON.stringify(video, null, 2);
        } else {
          text = formatMarkdown(video);
        }

        return {
          content: [{ type: "text", text }],
          structuredContent: video as unknown as Record<string, unknown>,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}
