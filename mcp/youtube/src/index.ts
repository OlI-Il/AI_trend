#!/usr/bin/env node
/**
 * YouTube MCP Server
 *
 * Provides tools to search YouTube, get video details, and fetch transcripts.
 * Requires YOUTUBE_API_KEY env var for search and video info tools.
 * Transcripts do not require an API key.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSearchTool } from "./tools/search.js";
import { registerVideoTool } from "./tools/videos.js";
import { registerTranscriptTool } from "./tools/transcripts.js";

// Load .env from the project root (two levels up from mcp/youtube/)
config({ path: resolve(import.meta.dirname, "../../..", ".env") });

const server = new McpServer({
  name: "youtube-mcp-server",
  version: "1.0.0",
});

registerSearchTool(server);
registerVideoTool(server);
registerTranscriptTool(server);

async function main(): Promise<void> {
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("WARNING: YOUTUBE_API_KEY is not set. youtube_search_videos and youtube_get_video will fail.");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("YouTube MCP server running via stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
