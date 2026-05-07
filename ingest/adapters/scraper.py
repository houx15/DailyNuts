from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from typing import List
from urllib.parse import urljoin, urlparse

from .base import BaseAdapter, RawItem
from utils import fetch_with_retry, parse_robots_txt, is_url_allowed, RateLimiter


class ScraperAdapter(BaseAdapter):
    def __init__(self, source_config: dict):
        super().__init__(source_config)
        self.rate_limiter = RateLimiter(default_delay=2.0)
        self._robots_cache = {}
    
    def fetch(self) -> List[RawItem]:
        url = self.config['url']
        selectors = self.config.get('selectors', {})
        max_age_days = self.config.get('max_age_days', 2)
        cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
        
        domain = urlparse(url).netloc
        
        if domain not in self._robots_cache:
            self._robots_cache[domain] = parse_robots_txt(url)
        
        disallowed = self._robots_cache[domain]
        
        if not is_url_allowed(url, disallowed):
            print(f"URL disallowed by robots.txt: {url}")
            return []
        
        self.rate_limiter.wait(domain)
        
        try:
            response = fetch_with_retry(
                url,
                max_retries=3,
                base_delay=2.0,
                timeout=30
            )
        except Exception as e:
            print(f"Scraper fetch error for {self.source_id}: {e}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []
        skipped = 0
        
        item_selector = selectors.get('item', 'article')
        title_selector = selectors.get('title', 'h2')
        link_selector = selectors.get('link', 'a')
        date_selector = selectors.get('date', '.date')
        
        for element in soup.select(item_selector):
            try:
                title_elem = element.select_one(title_selector)
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                
                link_elem = element.select_one(link_selector) if link_selector else None
                if not link_elem and element.name == 'a' and element.get('href'):
                    link_elem = element
                if not link_elem:
                    continue
                
                href = link_elem.get('href', '')
                link = urljoin(url, href)
                
                if not is_url_allowed(link, disallowed):
                    continue
                
                date_elem = element.select_one(date_selector)
                published = self._parse_date(date_elem.get_text(strip=True) if date_elem else '')
                
                if published.replace(tzinfo=timezone.utc) < cutoff:
                    skipped += 1
                    continue
                
                summary_elem = element.select_one('p')
                summary = summary_elem.get_text(strip=True)[:500] if summary_elem else ''
                
                lang = self.config.get('lang', 'zh')
                items.append(self._make_item(
                    title=title,
                    url=link,
                    published_at=published,
                    original_summary=summary,
                    original_language=lang
                ))
            except Exception as e:
                print(f"Error parsing element from {self.source_id}: {e}")
                continue
        
        if skipped > 0:
            print(f"Filtered {skipped} items older than {max_age_days}d from {self.source_id}")
        
        return items
    
    def _parse_date(self, date_text: str) -> datetime:
        if not date_text:
            return datetime.utcnow()
        
        formats = [
            '%Y-%m-%d',
            '%Y/%m/%d',
            '%m/%d/%Y',
            '%B %d, %Y',
            '%b %d, %Y',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_text.strip(), fmt)
            except ValueError:
                continue
        
        return datetime.utcnow()
