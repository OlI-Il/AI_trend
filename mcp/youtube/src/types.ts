export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  thumbnailUrl: string;
  tags: string[];
  categoryId: string;
}

export interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
}

export interface SearchResponse {
  total: number;
  count: number;
  nextPageToken?: string;
  items: YouTubeSearchResult[];
  has_more: boolean;
}
