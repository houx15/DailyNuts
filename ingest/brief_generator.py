import json
import os
import time
from datetime import datetime
from typing import List, Dict


class BriefGenerator:
    def __init__(self, config: dict):
        self.config = config
        self.client = None
        self._init_client()
    
    def _init_client(self):
        try:
            import openai
            self.client = openai.OpenAI(
                base_url=self.config['base_url'],
                api_key=os.environ.get('LLM_API_KEY', self.config.get('api_key', ''))
            )
        except ImportError:
            print("openai package not installed, brief generation will be skipped")
    
    def generate(self, items: List[dict], language: str) -> Dict:
        if not self.client:
            return self._fallback_brief(items, language)
        
        prompt = self._build_prompt(items, language)
        
        for attempt in range(3):
            try:
                response = self.client.chat.completions.create(
                    model=self.config['model'],
                    messages=[
                        {"role": "system", "content": self._system_prompt(language)},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=3000,
                    temperature=self.config.get('temperature', 0.3)
                )
                content = response.choices[0].message.content.strip()
                return self._parse_response(content, items, language)
            except Exception as e:
                print(f"Brief generation attempt {attempt + 1} failed: {e}")
                if attempt < 2:
                    time.sleep(2 ** attempt)
                continue
        
        return self._fallback_brief(items, language)
    
    def _system_prompt(self, language: str) -> str:
        lang_name = "Chinese" if language == 'zh' else "English"
        return (
            f"You are an AI research analyst preparing a daily intelligence brief in {lang_name}. "
            f"Create a structured daily brief with headline, lede, and themed sections. "
            f"Output valid JSON with keys: headline, lede, sections (array of {{title, body}})."
        )
    
    def _build_prompt(self, items: List[dict], language: str) -> str:
        lang_name = "Chinese" if language == 'zh' else "English"
        items_text = json.dumps([
            {
                "title": item.get(f'title_{language}', item.get('title_en', '')),
                "summary": item.get(f'summary_{language}', item.get('summary_en', '')),
                "source": item.get('source_id', ''),
                "theme": item.get('theme', 'other')
            }
            for item in items[:50]
        ], ensure_ascii=False, indent=2)
        
        return (
            f"Given {len(items)} items, create a daily brief in {lang_name}.\n\n"
            f"Items:\n{items_text}\n\n"
            f"Respond with JSON: {{\"headline\": \"...\", \"lede\": \"...\", \"sections\": [{{\"title\": \"...\", \"body\": \"...\"}}]}}"
        )
    
    def _parse_response(self, content: str, items: List[dict], language: str) -> Dict:
        try:
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            data = json.loads(content.strip())
            return {
                f'headline_{language}': data.get('headline', ''),
                f'lede_{language}': data.get('lede', ''),
                f'sections_{language}': data.get('sections', []),
                'item_count': len(items),
                'source_breakdown': self._count_sources(items),
                'generated_at': datetime.utcnow().isoformat() + 'Z'
            }
        except Exception as e:
            print(f"Error parsing brief response: {e}")
            return self._fallback_brief(items, language)
    
    def _fallback_brief(self, items: List[dict], language: str) -> Dict:
        if language == 'zh':
            return {
                'headline_zh': f'今日共采集 {len(items)} 项内容',
                'lede_zh': f'今日共采集 {len(items)} 项内容。',
                'sections_zh': [],
                'item_count': len(items),
                'source_breakdown': self._count_sources(items),
                'generated_at': datetime.utcnow().isoformat() + 'Z'
            }
        else:
            return {
                'headline_en': f'{len(items)} items collected today',
                'lede_en': f'{len(items)} items collected today.',
                'sections_en': [],
                'item_count': len(items),
                'source_breakdown': self._count_sources(items),
                'generated_at': datetime.utcnow().isoformat() + 'Z'
            }
    
    def _count_sources(self, items: List[dict]) -> Dict[str, int]:
        counts = {}
        for item in items:
            source = item.get('source_id', 'unknown')
            counts[source] = counts.get(source, 0) + 1
        return counts
