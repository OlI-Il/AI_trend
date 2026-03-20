import axios, { AxiosError } from "axios";
import { YOUTUBE_API_BASE_URL } from "./constants.js";
import type { YouTubeSearchResult, YouTubeVideoDetails, SearchResponse } from "./types.js";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }
  return key;
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as { error?: { message?: string } } | undefined;
      const msg = data?.error?.message ?? "";
      switch (error.response.status) {
        case 400:
          return `Error: Bad request — ${msg || "check your parameters"}`;
        case 403:
          return `Error: API key invalid or quota exceeded — ${msg || "check your YOUTUBE_API_KEY"}`;
        case 404:
          return "Error: Resource not found. Please check the video ID is correct.";
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        default:
          return `Error: YouTube API request failed with status ${error.response.status}: ${msg}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    }
  }
  return `Error: Unexpected error — ${error instanceof Error ? error.message : String(error)}`;
}

export async function searchVideos(params: {
  query: string;
  maxResults: number;
  order: string;
  pageToken?: string;
}): Promise<SearchResponse> {
  const { data } = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
    params: {
      key: getApiKey(),
      part: "snippet",
      q: params.query,
      type: "video",
      maxResults: params.maxResults,
      order: params.order,
      ...(params.pageToken ? { pageToken: params.pageToken } : {}),
    },
    timeout: 30000,
  });

  const items: YouTubeSearchResult[] = (data.items ?? []).map((item: {
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      channelId: string;
      publishedAt: string;
      thumbnails: { high?: { url: string }; default?: { url: string } };
    };
  }) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.default?.url ?? "",
  }));

  return {
    total: data.pageInfo?.totalResults ?? items.length,
    count: items.length,
    nextPageToken: data.nextPageToken,
    items,
    has_more: !!data.nextPageToken,
  };
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
  const { data } = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
    params: {
      key: getApiKey(),
      part: "snippet,statistics,contentDetails",
      id: videoId,
    },
    timeout: 30000,
  });

  if (!data.items || data.items.length === 0) return null;

  const item = data.items[0] as {
    id: string;
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      channelId: string;
      publishedAt: string;
      thumbnails: { high?: { url: string }; default?: { url: string } };
      tags?: string[];
      categoryId: string;
    };
    statistics: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    contentDetails: {
      duration: string;
    };
  };

  return {
    videoId: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails.duration,
    viewCount: item.statistics.viewCount ?? "0",
    likeCount: item.statistics.likeCount ?? "0",
    commentCount: item.statistics.commentCount ?? "0",
    thumbnailUrl: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.default?.url ?? "",
    tags: item.snippet.tags ?? [],
    categoryId: item.snippet.categoryId,
  };
}

/** Format ISO 8601 duration (e.g., PT1H2M3S) to human-readable string */
export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return iso;
  const [, h, m, s] = match;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}

/** Format large numbers with commas */
export function formatNumber(n: string): string {
  return parseInt(n, 10).toLocaleString("en-US");
}
