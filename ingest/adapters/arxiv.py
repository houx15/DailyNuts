import requests
from datetime import datetime, timedelta
from typing import List
import xml.etree.ElementTree as ET

from .base import BaseAdapter, RawItem


class ArxivAdapter(BaseAdapter):
    def fetch(self) -> List[RawItem]:
        categories = self.config.get('categories', ['cs.CL', 'cs.AI', 'cs.LG'])
        keywords = self.config.get('keywords', [])
        max_results = self.config.get('max_results_per_day', 30)
        
        try:
            items = self._fetch_arxiv(categories, keywords, max_results)
            return items
        except Exception as e:
            print(f"arXiv fetch error for {self.source_id}: {e}")
            return []
    
    def _fetch_arxiv(self, categories: List[str], keywords: List[str], max_results: int) -> List[RawItem]:
        yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
        today = datetime.utcnow().strftime('%Y-%m-%d')
        
        cat_query = ' OR '.join(f'cat:{cat}' for cat in categories)
        url = (
            f"http://export.arxiv.org/api/query?"
            f"search_query={cat_query}&"
            f"start=0&max_results={max_results}&"
            f"sortBy=submittedDate&sortOrder=descending"
        )
        
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        items = []
        for entry in root.findall('atom:entry', ns):
            try:
                item = self._parse_entry(entry, ns, keywords)
                if item:
                    items.append(item)
            except Exception as e:
                print(f"Error parsing arXiv entry: {e}")
                continue
        
        return items
    
    def _parse_entry(self, entry, ns, keywords: List[str]) -> RawItem:
        title = entry.find('atom:title', ns)
        if title is None:
            return None
        title = title.text.strip().replace('\n', ' ')
        
        link = entry.find('atom:id', ns)
        if link is None:
            return None
        link = link.text.strip()
        
        summary = entry.find('atom:summary', ns)
        summary_text = summary.text.strip()[:1000] if summary is not None else ''
        
        published = entry.find('atom:published', ns)
        if published is not None:
            published_at = datetime.fromisoformat(published.text.replace('Z', '+00:00'))
        else:
            published_at = datetime.utcnow()
        
        authors = []
        for author in entry.findall('atom:author', ns):
            name = author.find('atom:name', ns)
            if name is not None:
                authors.append(name.text)
        
        if keywords and not self._matches_keywords(title + ' ' + summary_text, keywords):
            return None
        
        return self._make_item(
            title=title,
            url=link,
            published_at=published_at,
            original_summary=summary_text,
            original_language='en',
            authors=authors,
            extra={'type': 'paper', 'arxiv_id': link.split('/')[-1]}
        )
    
    def _matches_keywords(self, text: str, keywords: List[str]) -> bool:
        text_lower = text.lower()
        return any(kw.lower() in text_lower for kw in keywords)
