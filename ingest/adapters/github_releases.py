import os
import re
from datetime import datetime, timedelta, timezone
from typing import List

from .base import BaseAdapter, RawItem
from utils import fetch_with_retry


class GitHubReleasesAdapter(BaseAdapter):
    def fetch(self) -> List[RawItem]:
        org = self.config['repo']
        token = os.environ.get('GITHUB_TOKEN', '')
        
        try:
            repos = self._fetch_repos(org, token)
            items = []
            for repo in repos:
                repo_items = self._fetch_releases(org, repo, token)
                items.extend(repo_items)
            return items[:20]
        except Exception as e:
            print(f"GitHub fetch error for {self.source_id}: {e}")
            return []
    
    def _fetch_repos(self, org: str, token: str) -> List[str]:
        headers = {'Accept': 'application/vnd.github.v3+json'}
        if token:
            headers['Authorization'] = f'token {token}'
        
        url = f"https://api.github.com/orgs/{org}/repos?sort=updated&per_page=20"
        response = fetch_with_retry(url, headers=headers, timeout=30)
        
        return [repo['name'] for repo in response.json()]
    
    def _fetch_releases(self, org: str, repo: str, token: str) -> List[RawItem]:
        headers = {'Accept': 'application/vnd.github.v3+json'}
        if token:
            headers['Authorization'] = f'token {token}'
        
        url = f"https://api.github.com/repos/{org}/{repo}/releases?per_page=5"
        try:
            response = fetch_with_retry(url, headers=headers, timeout=30)
        except Exception as e:
            if '404' in str(e):
                return []
            raise
        
        items = []
        yesterday = datetime.now(timezone.utc) - timedelta(days=2)
        
        for release in response.json():
            try:
                published = datetime.fromisoformat(
                    release['published_at'].replace('Z', '+00:00')
                )
                
                if published < yesterday:
                    continue
                
                body = (release.get('body') or '').strip()
                # Skip releases with no meaningful body — the LLM cannot
                # produce a useful summary from a title alone, so these
                # items end up as "版本更新解决了xxx" hallucinations.
                meaningful = body.replace('\r', '')
                # Strip markdown headings and common boilerplate prefixes
                meaningful = re.sub(r'^#+\s+.*$', '', meaningful, flags=re.MULTILINE)
                meaningful = re.sub(r'\*\*Full Changelog\*\*.*$', '', meaningful, flags=re.DOTALL)
                meaningful = meaningful.strip()
                if len(meaningful) < 100:
                    continue
                
                items.append(self._make_item(
                    title=f"{org}/{repo}: {release['name'] or release['tag_name']}",
                    url=release['html_url'],
                    published_at=published,
                    original_summary=body[:500],
                    original_language='en',
                    extra={'repo': f"{org}/{repo}", 'tag': release['tag_name']}
                ))
            except Exception as e:
                print(f"Error parsing release from {org}/{repo}: {e}")
                continue
        
        return items
