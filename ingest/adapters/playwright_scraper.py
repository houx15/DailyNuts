from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from typing import List
from urllib.parse import urljoin

from .base import RawItem
from .scraper import ScraperAdapter


class PlaywrightScraperAdapter(ScraperAdapter):
    """Scraper for JS-rendered pages using Playwright. Falls back gracefully if
    Playwright is not installed — useful for environments where browser
    dependencies are not available (e.g. developer laptops without `playwright
    install`)."""

    def fetch(self) -> List[RawItem]:
        url = self.config['url']
        selectors = self.config.get('selectors', {})
        max_age_days = self.config.get('max_age_days', 2)
        cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)

        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            print(f"Playwright not installed, skipping {self.source_id}")
            return []

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, wait_until='domcontentloaded', timeout=30000)
                page.wait_for_timeout(3000)
                html = page.content()
                browser.close()
        except Exception as e:
            print(f"Playwright fetch error for {self.source_id}: {e}")
            return []

        soup = BeautifulSoup(html, 'html.parser')
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
                if not title:
                    continue

                link_elem = element.select_one(link_selector)
                if not link_elem:
                    continue

                href = link_elem.get('href', '')
                link = urljoin(url, href)

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
