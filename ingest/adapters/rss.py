import feedparser
import requests
from datetime import datetime
from typing import List
from urllib.parse import urljoin

from .base import BaseAdapter, RawItem


class RSSAdapter(BaseAdapter):
    """Generic RSS/Atom feed adapter using feedparser."""
    
    def fetch(self) -> List[RawItem]:
        url = self.config['url']
        
        try:
            if url.startswith('http'):
                response = requests.get(url, timeout=30, headers={
                    'User-Agent': 'DailyNuts-Bot/1.0'
                })
                response.raise_for_status()
                feed = feedparser.parse(response.content)
            else:
                feed = feedparser.parse(url)
        except Exception as e:
            print(f"RSS fetch error for {self.source_id}: {e}")
            return []
        
        items = []
        for entry in feed.entries:
            try:
                item = self._parse_entry(entry)
                if item:
                    items.append(item)
            except Exception as e:
                print(f"Error parsing entry from {self.source_id}: {e}")
                continue
        
        return items
    
    def _parse_entry(self, entry) -> RawItem:
        title = entry.get('title', '').strip()
        link = entry.get('link', '')
        
        if not title or not link:
            return None
        
        published = self._parse_date(entry)
        summary = entry.get('summary', '') or entry.get('description', '')
        
        return self._make_item(
            title=title,
            url=link,
            published_at=published,
            original_summary=summary[:500]
        )
    
    def _parse_date(self, entry) -> datetime:
        published_parsed = entry.get('published_parsed') or entry.get('updated_parsed')
        if published_parsed:
            return datetime(*published_parsed[:6])
        
        published = entry.get('published', '') or entry.get('updated', '')
        if published:
            try:
                return datetime.fromisoformat(published.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        return datetime.utcnow()
