import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from datetime import datetime
from typing import List, Dict
import yaml

from adapters.rss import RSSAdapter
from adapters.scraper import ScraperAdapter
from adapters.arxiv import ArxivAdapter
from adapters.github_releases import GitHubReleasesAdapter
from summarizer import Summarizer
from brief_generator import BriefGenerator


ADAPTER_MAP = {
    'rss': RSSAdapter,
    'scraper': ScraperAdapter,
    'arxiv': ArxivAdapter,
    'github_releases': GitHubReleasesAdapter,
}

ADAPTER_TIMEOUT = 120  # seconds per source


def load_config(path: str = None) -> dict:
    if path is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(script_dir, 'config.yml')
    with open(path, 'r') as f:
        return yaml.safe_load(f)


def run_adapters(config: dict) -> List[dict]:
    all_items = []
    
    for source_config in config.get('sources', []):
        source_id = source_config['id']
        adapter_type = source_config['type']
        
        adapter_class = ADAPTER_MAP.get(adapter_type)
        if not adapter_class:
            print(f"Unknown adapter type: {adapter_type} for {source_id}")
            continue
        
        try:
            adapter = adapter_class(source_config)
            
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(adapter.fetch)
                try:
                    raw_items = future.result(timeout=ADAPTER_TIMEOUT)
                except FuturesTimeoutError:
                    print(f"Timeout fetching from {source_id} (>{ADAPTER_TIMEOUT}s), skipping")
                    continue
            
            for item in raw_items:
                all_items.append({
                    'id': hash(item.url) & 0xFFFFFFFF,
                    'url': item.url,
                    'title': item.title,
                    'source_id': item.source_id,
                    'published_at': item.published_at.isoformat(),
                    'original_language': item.original_language,
                    'original_summary': item.original_summary,
                    'authors': item.authors,
                    'extra': item.extra
                })
            
            print(f"Fetched {len(raw_items)} items from {source_id}")
        except Exception as e:
            print(f"Error running adapter {source_id}: {e}")
            continue
    
    return all_items


def deduplicate_items(items: List[dict]) -> List[dict]:
    seen = set()
    unique = []
    for item in items:
        url = item['url']
        if url not in seen:
            seen.add(url)
            unique.append(item)
    return unique


def get_recent_urls(content_dir: str = '../content', lookback_days: int = 7) -> set:
    """Load URLs from recent item files to avoid cross-day repeats."""
    from datetime import datetime as dt, timedelta
    
    urls = set()
    today = dt.utcnow().date()
    
    for i in range(1, lookback_days + 1):
        date_str = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        filepath = f'{content_dir}/items/{date_str}.json'
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for item in data.get('items', []):
                        if 'url' in item:
                            urls.add(item['url'])
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
    
    if urls:
        print(f"Loaded {len(urls)} recent URLs for cross-day dedup")
    return urls


def filter_repeat_items(items: List[dict], recent_urls: set) -> List[dict]:
    fresh = []
    skipped = 0
    for item in items:
        if item['url'] in recent_urls:
            skipped += 1
        else:
            fresh.append(item)
    
    if skipped > 0:
        print(f"Skipped {skipped} items already seen in previous days")
    return fresh


def summarize_items(items: List[dict], summarizer: Summarizer, languages: List[str]) -> List[dict]:
    for item in items:
        for lang in languages:
            if f'summary_{lang}' not in item or not item[f'summary_{lang}']:
                summary = summarizer.summarize(
                    item['title'],
                    item.get('original_summary', item['title']),
                    lang
                )
                if summary:
                    item[f'summary_{lang}'] = summary
                else:
                    item[f'summary_{lang}'] = item.get('original_summary', item['title'])[:300]
    
    return items


def generate_briefs(items: List[dict], generator: BriefGenerator, languages: List[str]) -> Dict:
    brief = {'date': datetime.utcnow().strftime('%Y-%m-%d')}
    
    for lang in languages:
        result = generator.generate(items, lang)
        brief.update(result)
    
    return brief


def save_items(items: List[dict], date: str, content_dir: str = '../content'):
    os.makedirs(f'{content_dir}/items', exist_ok=True)
    
    filepath = f'{content_dir}/items/{date}.json'
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump({'date': date, 'items': items}, f, ensure_ascii=False, indent=2)
    
    print(f"Saved {len(items)} items to {filepath}")


def save_brief(brief: dict, date: str, content_dir: str = '../content'):
    os.makedirs(f'{content_dir}/briefs', exist_ok=True)
    
    filepath = f'{content_dir}/briefs/{date}.json'
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(brief, f, ensure_ascii=False, indent=2)
    
    print(f"Saved brief to {filepath}")


def main():
    config = load_config()
    
    date = datetime.utcnow().strftime('%Y-%m-%d')
    languages = config.get('languages', ['en', 'zh'])
    
    print(f"Starting daily ingest for {date}")
    
    items = run_adapters(config)
    items = deduplicate_items(items)
    
    print(f"Total unique items (same-day): {len(items)}")
    
    recent_urls = get_recent_urls()
    items = filter_repeat_items(items, recent_urls)
    
    print(f"Items after cross-day dedup: {len(items)}")
    
    llm_config = config.get('llm', {})
    summarizer = Summarizer(llm_config)
    items = summarize_items(items, summarizer, languages)
    
    generator = BriefGenerator(llm_config)
    brief = generate_briefs(items, generator, languages)
    
    save_items(items, date)
    save_brief(brief, date)
    
    print("Daily ingest complete!")


if __name__ == '__main__':
    main()
