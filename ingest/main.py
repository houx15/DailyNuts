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


THEME_MAP = {
    'company_blog': 'apps',
    'paper': 'arch',
    'release': 'release',
}

CATEGORIES_EN_MAP = {
    'company_blog': ['Industry'],
    'paper': ['Research'],
    'release': ['Release'],
}
CATEGORIES_ZH_MAP = {
    'company_blog': ['业界'],
    'paper': ['研究'],
    'release': ['发布'],
}


def normalize_item(item: dict, source_config: dict) -> dict:
    normalized = dict(item)
    
    normalized['source'] = normalized.pop('source_id', 'unknown')
    
    lang = item.get('original_language', 'en')
    if lang == 'zh':
        normalized['title_zh'] = item.get('title', '')
        normalized['title_en'] = item.get('title_en', '')
    else:
        normalized['title_en'] = item.get('title', '')
        normalized['title_zh'] = item.get('title_zh', '')
    
    category = source_config.get('category', 'company_blog')
    normalized['theme'] = source_config.get('theme', THEME_MAP.get(category, 'other'))
    
    normalized.setdefault('categories_en', CATEGORIES_EN_MAP.get(category, ['Other']))
    normalized.setdefault('categories_zh', CATEGORIES_ZH_MAP.get(category, ['其他']))
    
    normalized.pop('original_summary', None)
    normalized.pop('authors', None)
    normalized.pop('extra', None)
    
    return normalized


def generate_sources(config: dict, content_dir: str = '../content') -> dict:
    sources = {}
    for src in config.get('sources', []):
        sid = src['id']
        category = src.get('category', 'company_blog')
        
        kind_labels = {
            'company_blog': {'en': 'Blog', 'zh': '博客'},
            'paper': {'en': 'Paper', 'zh': '论文'},
            'release': {'en': 'Release', 'zh': '发布'},
        }
        labels = kind_labels.get(category, {'en': 'Other', 'zh': '其他'})
        
        sources[sid] = {
            'mono': src.get('name', src['id'])[0].upper(),
            'tone': src.get('color', DEFAULT_COLORS.get(sid, '#888888')),
            'name': src.get('name', sid),
            'name_zh': src.get('name_zh', src.get('name', sid)),
            'kind': category,
            'kind_label_en': src.get('kind_label_en', labels['en']),
            'kind_label_zh': src.get('kind_label_zh', labels['zh']),
        }
    
    os.makedirs(f'{content_dir}', exist_ok=True)
    filepath = f'{content_dir}/sources.json'
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(sources, f, ensure_ascii=False, indent=2)
    
    print(f"Saved sources.json with {len(sources)} sources")
    return sources


DEFAULT_COLORS = {
    'openai_news': '#1F8F6B',
    'anthropic_research': '#C97B4F',
    'anthropic_news': '#C97B4F',
    'anthropic_engineering': '#C97B4F',
    'anthropic_eng': '#C97B4F',
    'google_research': '#3F6FB8',
    'meta_ai': '#2563A8',
    'arxiv_cs_cl': '#A02B2B',
    'hf_papers': '#D69014',
    'deepseek_github': '#3D5AB7',
    'qwen_github': '#7339B0',
    'thudm_github': '#7E1D1D',
    'moonshot_blog': '#1A1A2E',
    'moonshot_github': '#1A1A2E',
    'hunyuan_github': '#5B3FA8',
    'zhipu_news': '#1F7A6F',
}


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
    
    source_by_id = {s['id']: s for s in config.get('sources', [])}
    items = [
        normalize_item(item, source_by_id.get(item.get('source_id', ''), {}))
        for item in items
    ]
    
    generate_sources(config)
    
    generator = BriefGenerator(llm_config)
    brief = generate_briefs(items, generator, languages)
    
    save_items(items, date)
    save_brief(brief, date)
    
    print("Daily ingest complete!")


if __name__ == '__main__':
    main()
