import json
import os
import sys
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


def load_config(path: str = 'config.yml') -> dict:
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
            raw_items = adapter.fetch()
            
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
    
    print(f"Total unique items: {len(items)}")
    
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
