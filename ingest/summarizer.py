import os
import time
from typing import Optional


class Summarizer:
    def __init__(self, config: dict):
        self.config = config
        self.client = None
        self._init_client()
    
    def _init_client(self):
        try:
            import openai
            base_url = os.environ.get('LLM_BASE_URL', self.config.get('base_url', 'https://api.openai.com/v1'))
            api_key = os.environ.get('LLM_API_KEY', '')
            if not api_key:
                print("LLM_API_KEY not set, summarization will be skipped")
                return
            self.client = openai.OpenAI(
                base_url=base_url,
                api_key=api_key
            )
        except ImportError:
            print("openai package not installed, summarization will be skipped")
    
    def summarize(self, title: str, original_text: str, language: str) -> Optional[str]:
        if not self.client:
            return None
        
        prompt = self._build_prompt(title, original_text, language)
        
        for attempt in range(3):
            try:
                response = self.client.chat.completions.create(
                    model=os.environ.get('LLM_MODEL', self.config.get('model', 'gpt-4o-mini')),
                    messages=[
                        {"role": "system", "content": self._system_prompt(language)},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=self.config.get('max_tokens', 500),
                    temperature=self.config.get('temperature', 0.3)
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"Summarization attempt {attempt + 1} failed: {e}")
                if attempt < 2:
                    time.sleep(2 ** attempt)
                continue
        
        return None
    
    def _system_prompt(self, language: str) -> str:
        lang_name = "Chinese" if language == 'zh' else "English"
        return (
            f"You are a technical content summarizer for an AI/ML researcher. "
            f"Generate a concise summary (2-3 sentences) in {lang_name}. "
            f"Focus on: what problem it addresses, the key approach or finding, and why it matters."
        )
    
    def _build_prompt(self, title: str, original_text: str, language: str) -> str:
        content = (original_text or title)[:2000]
        return f"Title: {title}\n\nContent: {content}\n\nProvide a 2-3 sentence summary."
