"""
Gmail MCP Server — Custom MCP server for sending AI trend reports via Gmail.

Built with FastMCP. This is a learning stub that simulates sending emails.
Replace the mock implementation with real Gmail API calls once you have
OAuth2 credentials configured.

To run:
    python -m src.mcp_gmail.server

Gmail API setup:
    1. Go to https://console.cloud.google.com/
    2. Enable "Gmail API"
    3. Create OAuth2 credentials (Desktop app)
    4. Download credentials.json to project root
    5. Run the server once — it will open a browser for OAuth consent
    6. A token.json file will be created (gitignored, do not share)
"""

import json
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("gmail", instructions="Send emails via Gmail. Used to deliver AI trend reports.")

# Path for OAuth token (created after first auth flow)
TOKEN_PATH = Path(__file__).parent.parent.parent / "token.json"
CREDENTIALS_PATH = Path(__file__).parent.parent.parent / "credentials.json"


@mcp.tool()
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email via Gmail.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        body: Email body (supports plain text or markdown).

    Returns:
        JSON string with send status.
    """
    # TODO: Replace with real Gmail API call
    # from google.auth.transport.requests import Request
    # from google.oauth2.credentials import Credentials
    # from google_auth_oauthlib.flow import InstalledAppFlow
    # from googleapiclient.discovery import build
    # from email.mime.text import MIMEText
    # import base64
    #
    # SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
    # creds = None
    # if TOKEN_PATH.exists():
    #     creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
    # if not creds or not creds.valid:
    #     if creds and creds.expired and creds.refresh_token:
    #         creds.refresh(Request())
    #     else:
    #         flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
    #         creds = flow.run_local_server(port=0)
    #     TOKEN_PATH.write_text(creds.to_json())
    #
    # service = build("gmail", "v1", credentials=creds)
    # message = MIMEText(body)
    # message["to"] = to
    # message["subject"] = subject
    # raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    # service.users().messages().send(userId="me", body={"raw": raw}).execute()

    return json.dumps(
        {
            "status": "mock_success",
            "note": "Replace with real Gmail API calls. See comments in server.py.",
            "to": to,
            "subject": subject,
            "body_preview": body[:100] + "..." if len(body) > 100 else body,
            "sent_at": datetime.now().isoformat(),
        },
        indent=2,
    )


@mcp.tool()
def send_trend_report(to: str, report_date: str = "") -> str:
    """Send today's AI trend report via Gmail.

    Reads the latest report from output/ and sends it.

    Args:
        to: Recipient email address.
        report_date: Date string (YYYY-MM-DD). Defaults to today.

    Returns:
        JSON string with send status.
    """
    report_date = report_date or datetime.now().strftime("%Y-%m-%d")
    report_path = Path(__file__).parent.parent.parent / "output" / f"{report_date}-trends.md"

    if not report_path.exists():
        return json.dumps({"error": f"No report found at {report_path}. Run /get-ai-trends first."})

    body = report_path.read_text()
    return send_email(to=to, subject=f"AI Trends — {report_date}", body=body)


if __name__ == "__main__":
    mcp.run()
