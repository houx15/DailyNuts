"""AI HOT REST API adapter — fetches curated AI news from aihot.virxact.com.

API docs: https://aihot.virxact.com/agent
Endpoint:  GET /api/public/items
Modes:     selected (精选), all (全部), daily (日报)
"""

import requests
from datetime import datetime, timedelta, timezone
from typing import List
from urllib.parse import urljoin

from .base import BaseAdapter, RawItem


BASE_URL = "https://aihot.virxact.com"
USER_AGENT = "Mozilla/5.0 (compatible; DailyNuts/1.0; +https://github.com/houx15/DailyNuts)"


class AihotApiAdapter(BaseAdapter):
    """Fetches items from the AI HOT public REST API.

    Config keys:
        url:          API base URL (default: https://aihot.virxact.com)
        mode:         "selected" (default) or "all"
        take:         items per page (default: 50)
        max_items:    max total items to fetch across pages (default: 100)
        max_age_days: filter out items older than N days (default: 2)
        category_filter: optional, limit to specific category (e.g. "paper", "ai-models")
    """

    def fetch(self) -> List[RawItem]:
        base = self.config.get("url", BASE_URL)
        mode = self.config.get("mode", "selected")
        take = self.config.get("take", 50)
        max_items = self.config.get("max_items", 100)
        max_age_days = self.config.get("max_age_days", 2)
        category_filter = self.config.get("category_filter", None)

        cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
        all_items: List[RawItem] = []
        cursor = None

        while len(all_items) < max_items:
            url = f"{base}/api/public/items?mode={mode}&take={take}"
            if cursor:
                url += f"&cursor={cursor}"

            try:
                resp = requests.get(
                    url,
                    headers={
                        "Accept": "application/json",
                        "User-Agent": USER_AGENT,
                    },
                    timeout=30,
                )
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                print(f"AI HOT API fetch error ({self.source_id}): {e}")
                break

            items = data.get("items", [])
            if not items:
                break

            for raw in items:
                published_str = raw.get("publishedAt")
                if not published_str:
                    continue

                published = self._parse_iso(published_str)
                if published.replace(tzinfo=timezone.utc) < cutoff:
                    # Items are in reverse-chronological order; once we go
                    # past the cutoff we can stop the entire fetch.
                    return all_items

                if category_filter:
                    cat = raw.get("category", "")
                    if cat != category_filter:
                        continue

                all_items.append(self._make_item(
                    title=raw.get("title", ""),
                    url=raw.get("url", ""),
                    published_at=published,
                    original_summary=raw.get("summary") or "",
                    original_language="zh",
                    extra={
                        "aihot_source": raw.get("source", ""),
                        "aihot_category": raw.get("category", ""),
                        "title_en": raw.get("title_en", ""),
                    },
                ))

            has_next = data.get("hasNext", False)
            next_cursor = data.get("nextCursor")
            if not has_next or not next_cursor:
                break
            cursor = next_cursor

        return all_items

    @staticmethod
    def _parse_iso(ts: str) -> datetime:
        """Parse ISO-8601 timestamp. Handles both 'Z' suffix and '+00:00'."""
        if not ts:
            return datetime.utcnow()
        ts = ts.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(ts)
        except ValueError:
            return datetime.utcnow()
