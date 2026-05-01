import random
import time
from typing import Callable, Optional
import requests


USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]


def get_random_user_agent() -> str:
    return random.choice(USER_AGENTS)


def fetch_with_retry(
    url: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 10.0,
    timeout: int = 30,
    headers: Optional[dict] = None,
    **kwargs
) -> requests.Response:
    default_headers = {
        'User-Agent': get_random_user_agent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    if headers:
        default_headers.update(headers)
    
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            response = requests.get(
                url,
                headers=default_headers,
                timeout=timeout,
                **kwargs
            )
            response.raise_for_status()
            return response
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code in (429, 503, 502, 504):
                last_exception = e
                delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                time.sleep(delay)
                continue
            raise
            
        except (requests.exceptions.ConnectionError,
                requests.exceptions.Timeout,
                requests.exceptions.RequestException) as e:
            last_exception = e
            if attempt < max_retries - 1:
                delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                time.sleep(delay)
                continue
            raise
    
    raise last_exception


def parse_robots_txt(url: str) -> set:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        
        response = requests.get(robots_url, timeout=10, headers={
            'User-Agent': 'DailyNuts-Bot/1.0'
        })
        
        if response.status_code != 200:
            return set()
        
        disallowed = set()
        lines = response.text.split('\n')
        user_agent_relevant = False
        
        for line in lines:
            line = line.strip()
            if line.lower().startswith('user-agent:'):
                ua = line.split(':', 1)[1].strip()
                user_agent_relevant = ua == '*' or 'dailynuts' in ua.lower()
            elif user_agent_relevant and line.lower().startswith('disallow:'):
                path = line.split(':', 1)[1].strip()
                if path:
                    disallowed.add(path)
        
        return disallowed
        
    except Exception:
        return set()


def is_url_allowed(url: str, disallowed_paths: set) -> bool:
    from urllib.parse import urlparse
    parsed = urlparse(url)
    path = parsed.path
    
    for disallowed in disallowed_paths:
        if path.startswith(disallowed):
            return False
    
    return True


class RateLimiter:
    def __init__(self, default_delay: float = 1.0):
        self.default_delay = default_delay
        self.last_request = {}
    
    def wait(self, domain: str):
        import time
        from datetime import datetime
        
        now = datetime.now()
        last = self.last_request.get(domain)
        
        if last is not None:
            elapsed = (now - last).total_seconds()
            if elapsed < self.default_delay:
                time.sleep(self.default_delay - elapsed)
        
        self.last_request[domain] = now
