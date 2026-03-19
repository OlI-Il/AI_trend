"""
YouTube MCP Server — Custom MCP server for fetching trending AI videos.

Built with FastMCP. This is a learning stub that returns mock data.
Replace the mock implementations with real YouTube Data API v3 calls
once you have an API key configured.

To run:
    python -m src.mcp_youtube.server

MCP registration is handled by .claude/settings.json (shared with team).

YouTube Data API v3 setup:
    1. Go to https://console.cloud.google.com/
    2. Create a project and enable "YouTube Data API v3"
    3. Create an API key
    4. Copy .env.example to .env and set YOUTUBE_API_KEY
"""

import json
import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("youtube", instructions="Search and retrieve trending AI videos from YouTube.")


# --- Mock Data (replace with real API calls) ---

MOCK_VIDEOS = [
    {
        "video_id": "abc123",
        "title": "GPT-5 Is Here: Everything You Need to Know",
        "channel": "AI Explained",
        "views": 450000,
        "published": "2026-03-19",
        "description": "A deep dive into the latest GPT-5 capabilities, benchmarks, and what it means for developers...",
    },
    {
        "video_id": "def456",
        "title": "Building AI Agents That Actually Work",
        "channel": "Fireship",
        "views": 320000,
        "published": "2026-03-19",
        "description": "Let's build a real AI agent from scratch using the latest frameworks and best practices...",
    },
    {
        "video_id": "ghi789",
        "title": "The AI Paper That Changed Everything This Week",
        "channel": "Yannic Kilcher",
        "views": 180000,
        "published": "2026-03-18",
        "description": "Breaking down the most impactful AI research paper of the week with clear explanations...",
    },
]


@mcp.tool()
def search_trending_ai_videos(max_results: int = 10, time_period: str = "24h") -> str:
    """Search for trending AI videos on YouTube.

    Args:
        max_results: Maximum number of videos to return (default: 10)
        time_period: Time period to search. Options: "24h", "7d", "30d" (default: "24h")

    Returns:
        JSON string with list of trending AI videos.
    """
    # TODO: Replace with real YouTube Data API v3 call
    # from googleapiclient.discovery import build
    # youtube = build("youtube", "v3", developerKey=os.environ["YOUTUBE_API_KEY"])
    # request = youtube.search().list(
    #     q="artificial intelligence OR machine learning OR LLM",
    #     part="snippet",
    #     type="video",
    #     order="viewCount",
    #     publishedAfter=(datetime.utcnow() - timedelta(hours=24)).isoformat() + "Z",
    #     maxResults=max_results,
    # )
    # response = request.execute()

    return json.dumps(
        {
            "status": "mock_data",
            "note": "Replace with real YouTube API calls. See comments in server.py.",
            "videos": MOCK_VIDEOS[:max_results],
            "query": "AI trending videos",
            "time_period": time_period,
            "fetched_at": datetime.now().isoformat(),
        },
        indent=2,
    )


@mcp.tool()
def get_video_details(video_id: str) -> str:
    """Get detailed information about a specific YouTube video.

    Args:
        video_id: The YouTube video ID.

    Returns:
        JSON string with video details.
    """
    # TODO: Replace with real YouTube Data API v3 call
    # youtube = build("youtube", "v3", developerKey=os.environ["YOUTUBE_API_KEY"])
    # request = youtube.videos().list(part="snippet,statistics", id=video_id)
    # response = request.execute()

    for video in MOCK_VIDEOS:
        if video["video_id"] == video_id:
            return json.dumps(video, indent=2)

    return json.dumps({"error": f"Video {video_id} not found (mock data)"})


if __name__ == "__main__":
    mcp.run()
