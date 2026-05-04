import pytest
from datetime import datetime
from unittest.mock import Mock, patch
import xml.etree.ElementTree as ET
import sys
sys.path.insert(0, '/home/monkey/apps/DailyNuts/ingest')

from adapters.base import RawItem
from adapters.rss import RSSAdapter
from adapters.arxiv import ArxivAdapter
from adapters.github_releases import GitHubReleasesAdapter
from summarizer import Summarizer
from brief_generator import BriefGenerator
from main import deduplicate_items


class MockFeed:
    def __init__(self, entries):
        self.entries = entries


class TestRawItem:
    def test_raw_item_creation(self):
        item = RawItem(
            title="Test Title",
            url="https://example.com",
            source_id="test_source",
            published_at=datetime(2026, 5, 1, 10, 0, 0)
        )
        assert item.title == "Test Title"
        assert item.url == "https://example.com"
        assert item.original_language == "en"
        assert item.authors == []


class TestBaseAdapter:
    def test_make_item(self):
        config = {'id': 'test', 'name': 'Test Source'}
        adapter = RSSAdapter(config)
        
        item = adapter._make_item(
            title="Test",
            url="https://example.com",
            published_at=datetime(2026, 5, 1),
            original_summary="Summary",
            original_language="zh"
        )
        
        assert item.title == "Test"
        assert item.source_id == "test"
        assert item.original_language == "zh"


class TestRSSAdapter:
    def test_fetch_empty_feed(self):
        config = {'id': 'test', 'name': 'Test', 'url': 'https://example.com/feed'}
        adapter = RSSAdapter(config)
        
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(content=b'', raise_for_status=Mock())
            
            with patch('feedparser.parse') as mock_parse:
                mock_parse.return_value = MockFeed([])
                items = adapter.fetch()
                
        assert items == []

    def test_parse_entry_valid(self):
        config = {'id': 'test', 'name': 'Test'}
        adapter = RSSAdapter(config)
        
        entry = Mock()
        entry.get.side_effect = lambda key, default='': {
            'title': 'Test Title',
            'link': 'https://example.com/post',
            'summary': 'Test summary'
        }.get(key, default)
        entry.get.return_value = 'Test Title'
        
        with patch.object(adapter, '_parse_date', return_value=datetime(2026, 5, 1)):
            item = adapter._parse_entry(entry)
        
        assert item is not None
        assert item.title == 'Test Title'

    def test_parse_entry_missing_title(self):
        config = {'id': 'test', 'name': 'Test'}
        adapter = RSSAdapter(config)
        
        entry = Mock()
        entry.get.return_value = ''
        
        item = adapter._parse_entry(entry)
        assert item is None

    def test_parse_date_from_published_parsed(self):
        config = {'id': 'test', 'name': 'Test'}
        adapter = RSSAdapter(config)
        
        entry = Mock()
        entry.get.return_value = None
        entry.get.side_effect = lambda key, default=None: {
            'published_parsed': (2026, 5, 1, 10, 0, 0)
        }.get(key, default)
        
        date = adapter._parse_date(entry)
        assert date == datetime(2026, 5, 1, 10, 0, 0)

    def test_parse_date_fallback(self):
        config = {'id': 'test', 'name': 'Test'}
        adapter = RSSAdapter(config)
        
        entry = Mock()
        entry.get.side_effect = lambda key, default=None: {
            'published': '2026-05-01T10:00:00+00:00'
        }.get(key, default)
        
        date = adapter._parse_date(entry)
        assert date.year == 2026


class TestArxivAdapter:
    def test_matches_keywords(self):
        config = {'id': 'arxiv', 'name': 'arXiv'}
        adapter = ArxivAdapter(config)
        
        assert adapter._matches_keywords("Large language models for reasoning", ["LLM", "reasoning"])
        assert not adapter._matches_keywords("Computer vision", ["LLM", "agent"])

    def test_parse_entry(self):
        config = {'id': 'arxiv', 'name': 'arXiv'}
        adapter = ArxivAdapter(config)
        
        import xml.etree.ElementTree as ET
        xml_str = '''
        <entry xmlns="http://www.w3.org/2005/Atom">
            <title>Test Paper</title>
            <id>http://arxiv.org/abs/2605.00001</id>
            <published>2026-05-01T10:00:00Z</published>
            <summary>This is a test abstract.</summary>
        </entry>
        '''
        entry = ET.fromstring(xml_str)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        item = adapter._parse_entry(entry, ns, [])
        
        assert item is not None
        assert item.title == "Test Paper"
        assert "arxiv" in item.url


class TestGitHubReleasesAdapter:
    def test_fetch_repos(self):
        config = {'id': 'github', 'name': 'GitHub', 'repo': 'test-org'}
        adapter = GitHubReleasesAdapter(config)
        
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                json=Mock(return_value=[
                    {'name': 'repo1'},
                    {'name': 'repo2'}
                ]),
                raise_for_status=Mock()
            )
            
            repos = adapter._fetch_repos('test-org', '')
        
        assert repos == ['repo1', 'repo2']

    def test_fetch_releases(self):
        from datetime import datetime, timezone
        
        config = {'id': 'github', 'name': 'GitHub', 'repo': 'test-org'}
        adapter = GitHubReleasesAdapter(config)
        
        # Use today's date so the 2-day recency filter passes
        today_str = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                json=Mock(return_value=[{
                    'name': 'v1.0.0',
                    'tag_name': 'v1.0.0',
                    'html_url': 'https://github.com/test-org/repo1/releases/tag/v1.0.0',
                    'published_at': today_str,
                    'body': 'Release notes'
                }]),
                raise_for_status=Mock(),
                status_code=200
            )
            
            items = adapter._fetch_releases('test-org', 'repo1', '')
        
        assert len(items) == 1
        assert 'v1.0.0' in items[0].title


class TestSummarizer:
    def test_init_without_openai(self):
        config = {'base_url': 'https://api.example.com', 'model': 'test-model'}
        
        with patch.dict('sys.modules', {'openai': None}):
            summarizer = Summarizer(config)
            assert summarizer.client is None

    def test_summarize_no_client(self):
        config = {'base_url': 'https://api.example.com', 'model': 'test-model'}
        summarizer = Summarizer(config)
        summarizer.client = None
        
        result = summarizer.summarize("Title", "Content", "en")
        assert result is None


class TestBriefGenerator:
    def test_fallback_brief_en(self):
        config = {'base_url': 'https://api.example.com', 'model': 'test-model'}
        generator = BriefGenerator(config)
        generator.client = None
        
        items = [{'source_id': 'test1'}, {'source_id': 'test2'}]
        result = generator.generate(items, 'en')
        
        assert result['headline_en'] == '2 items collected today'
        assert result['item_count'] == 2

    def test_fallback_brief_zh(self):
        config = {'base_url': 'https://api.example.com', 'model': 'test-model'}
        generator = BriefGenerator(config)
        generator.client = None
        
        items = [{'source_id': 'test1'}]
        result = generator.generate(items, 'zh')
        
        assert '今日共采集' in result['headline_zh']
        assert result['item_count'] == 1

    def test_count_sources(self):
        config = {'base_url': 'https://api.example.com', 'model': 'test-model'}
        generator = BriefGenerator(config)
        
        items = [
            {'source_id': 'source_a'},
            {'source_id': 'source_a'},
            {'source_id': 'source_b'}
        ]
        counts = generator._count_sources(items)
        
        assert counts == {'source_a': 2, 'source_b': 1}


class TestMainPipeline:
    def test_deduplicate_items(self):
        items = [
            {'url': 'https://example.com/1', 'title': 'A'},
            {'url': 'https://example.com/1', 'title': 'A duplicate'},
            {'url': 'https://example.com/2', 'title': 'B'}
        ]
        
        result = deduplicate_items(items)
        assert len(result) == 2
        assert result[0]['title'] == 'A'
        assert result[1]['title'] == 'B'

    def test_deduplicate_empty(self):
        assert deduplicate_items([]) == []


class TestUtils:
    def test_get_random_user_agent(self):
        from utils import get_random_user_agent
        ua = get_random_user_agent()
        assert isinstance(ua, str)
        assert len(ua) > 0
        assert 'Mozilla' in ua

    def test_is_url_allowed(self):
        from utils import is_url_allowed
        
        assert is_url_allowed('https://example.com/page', set()) is True
        assert is_url_allowed('https://example.com/admin', {'/admin'}) is False
        assert is_url_allowed('https://example.com/page', {'/admin'}) is True

    def test_rate_limiter(self):
        from utils import RateLimiter
        import time
        
        limiter = RateLimiter(default_delay=0.1)
        limiter.wait('example.com')
        start = time.time()
        limiter.wait('example.com')
        elapsed = time.time() - start
        assert elapsed >= 0.1


class TestCostMonitor:
    def test_estimate_tokens(self):
        from cost_monitor import CostMonitor
        monitor = CostMonitor()
        tokens = monitor.estimate_tokens("This is a test prompt")
        assert tokens > 0

    def test_calculate_cost(self):
        from cost_monitor import CostMonitor
        monitor = CostMonitor(model='gpt-4o-mini')
        cost = monitor.calculate_cost(1000, 500)
        assert cost > 0
        assert cost < 0.01

    def test_log_request(self):
        from cost_monitor import CostMonitor
        monitor = CostMonitor(model='gpt-4o-mini')
        result = monitor.log_request("Test prompt", "Test response")
        
        assert result['input_tokens'] > 0
        assert result['output_tokens'] > 0
        assert result['cost'] >= 0
        assert result['total_cost'] >= 0
        assert monitor.request_count == 1

    def test_is_over_budget(self):
        from cost_monitor import CostMonitor
        monitor = CostMonitor(cost_limit=0.001)
        monitor.daily_cost = 0.002
        assert monitor.is_over_budget() is True

    def test_get_summary(self):
        from cost_monitor import CostMonitor
        monitor = CostMonitor(model='gpt-4o-mini')
        monitor.log_request("Test", "Response")
        summary = monitor.get_summary()
        
        assert summary['model'] == 'gpt-4o-mini'
        assert summary['requests'] == 1
        assert summary['total_cost_usd'] >= 0
        assert 'remaining_usd' in summary


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
