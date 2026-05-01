import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List
from urllib.parse import urljoin

from .base import BaseAdapter, RawItem


class ScraperAdapter(BaseAdapter):
    def fetch(self) -> List[RawItem]:
        url = self.config['url']
        selectors = self.config.get('selectors', {})
        
        try:
            response = requests.get(url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()
        except Exception as e:
            print(f"Scraper fetch error for {self.source_id}: {e}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []
        
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
                
                link_elem = element.select_one(link_selector)
                if not link_elem:
                    continue
                
                href = link_elem.get('href', '')
                link = urljoin(url, href)
                
                date_elem = element.select_one(date_selector)
                published = self._parse_date(date_elem.get_text(strip=True) if date_elem else '')
                
                summary_elem = element.select_one('p')
                summary = summary_elem.get_text(strip=True)[:500] if summary_elem else ''
                
                items.append(self._make_item(
                    title=title,
                    url=link,
                    published_at=published,
                    original_summary=summary,
                    original_language='zh'
                ))
            except Exception as e:
                print(f"Error parsing element from {self.source_id}: {e}")
                continue
        
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
