import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";
import { CHARACTER_LIMIT } from "../constants.js";
import type { TranscriptEntry } from "../types.js";

const TranscriptInputSchema = z.object({
  video_id: z
    .string()
    .min(1, "Video ID is required")
    .describe("YouTube video ID (e.g., 'dQw4w9WgXcQ'). Found in the URL: youtube.com/watch?v=<video_id>"),
  language: z
    .string()
    .optional()
    .describe("BCP-47 language code for the transcript (e.g., 'en', 'fr', 'de'). Defaults to the video's primary language."),
  include_timestamps: z
    .boolean()
    .default(false)
    .describe("Whether to include timestamps in the output (default: false for clean text)"),
}).strict();

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function buildTranscriptText(entries: TranscriptEntry[], includeTimestamps: boolean): string {
  if (includeTimestamps) {
    return entries
      .map((e) => `[${formatTimestamp(e.start)}] ${e.text}`)
      .join("\n");
  }
  return entries.map((e) => e.text).join(" ");
}

export function registerTranscriptTool(server: McpServer): void {
  server.registerTool(
    "youtube_get_transcript",
    {
      title: "Get YouTube Video Transcript",
      description: `Fetch the captions/transcript for a YouTube video. Does NOT require a YouTube API key — uses publicly available captions.

Returns the full transcript as plain text, or with timestamps if requested. Only works for videos that have captions enabled (auto-generated or manual).

Args:
  - video_id (string): YouTube video ID (e.g., 'dQw4w9WgXcQ')
  - language (string, optional): BCP-47 language code (e.g., 'en', 'fr'). Defaults to the video's primary language.
  - include_timestamps (boolean): Include [M:SS] timestamps before each segment (default: false)

Returns: Full transcript text. If include_timestamps is true, each line is prefixed with [M:SS].

Examples:
  - Clean transcript: video_id="abc123", include_timestamps=false
  - Timestamped: video_id="abc123", include_timestamps=true
  - French captions: video_id="abc123", language="fr"

Errors:
  - "Transcript not available" if the video has no captions
  - "No transcript found for language" if the requested language isn't available`,
      inputSchema: TranscriptInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const rawEntries = await YoutubeTranscript.fetchTranscript(params.video_id, {
          lang: params.language,
        });

        if (!rawEntries || rawEntries.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No transcript available for video "${params.video_id}". The video may not have captions enabled.`,
            }],
          };
        }

        const entries: TranscriptEntry[] = rawEntries.map((e) => ({
          text: e.text,
          start: e.offset / 1000,
          duration: e.duration / 1000,
        }));

        let text = buildTranscriptText(entries, params.include_timestamps ?? false);

        if (text.length > CHARACTER_LIMIT) {
          const half = Math.ceil(entries.length / 2);
          const truncatedEntries = entries.slice(0, half);
          text = buildTranscriptText(truncatedEntries, params.include_timestamps ?? false);
          text += `\n\n[Transcript truncated — showing first ${half} of ${entries.length} segments. Use a more specific video or filter by section.]`;
        }

        return {
          content: [{ type: "text", text }],
          structuredContent: { videoId: params.video_id, segmentCount: entries.length } as Record<string, unknown>,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.toLowerCase().includes("no transcript") || msg.toLowerCase().includes("disabled")) {
          return {
            content: [{
              type: "text",
              text: `Transcript not available for video "${params.video_id}". Captions may be disabled for this video.`,
            }],
          };
        }
        if (msg.toLowerCase().includes("language")) {
          return {
            content: [{
              type: "text",
              text: `No transcript found for language "${params.language}" on video "${params.video_id}". Try omitting the language parameter to use the default.`,
            }],
          };
        }
        return { content: [{ type: "text", text: `Error fetching transcript: ${msg}` }] };
      }
    }
  );
}
