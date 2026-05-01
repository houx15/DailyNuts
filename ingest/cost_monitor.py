import json
import os
from datetime import datetime
from typing import Dict, Optional


COST_PER_1K_TOKENS = {
    'gpt-4o-mini': {'input': 0.00015, 'output': 0.0006},
    'gpt-4o': {'input': 0.0025, 'output': 0.01},
    'deepseek-chat': {'input': 0.00014, 'output': 0.00028},
    'claude-3-haiku': {'input': 0.00025, 'output': 0.00125},
}

DEFAULT_COST_LIMIT = 0.5


class CostMonitor:
    def __init__(self, model: str = 'gpt-4o-mini', cost_limit: float = DEFAULT_COST_LIMIT):
        self.model = model
        self.cost_limit = cost_limit
        self.daily_cost = 0.0
        self.request_count = 0
        self.token_usage = {'input': 0, 'output': 0}
        self.start_time = datetime.now()
    
    def estimate_tokens(self, text: str) -> int:
        return len(text.split()) * 1.3
    
    def log_request(self, prompt: str, response: str):
        input_tokens = self.estimate_tokens(prompt)
        output_tokens = self.estimate_tokens(response)
        
        self.token_usage['input'] += input_tokens
        self.token_usage['output'] += output_tokens
        self.request_count += 1
        
        cost = self.calculate_cost(input_tokens, output_tokens)
        self.daily_cost += cost
        
        return {
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'cost': cost,
            'total_cost': self.daily_cost,
            'remaining_budget': max(0, self.cost_limit - self.daily_cost)
        }
    
    def calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        rates = COST_PER_1K_TOKENS.get(self.model, COST_PER_1K_TOKENS['gpt-4o-mini'])
        input_cost = (input_tokens / 1000) * rates['input']
        output_cost = (output_tokens / 1000) * rates['output']
        return input_cost + output_cost
    
    def is_over_budget(self) -> bool:
        return self.daily_cost >= self.cost_limit
    
    def get_summary(self) -> Dict:
        return {
            'model': self.model,
            'requests': self.request_count,
            'input_tokens': self.token_usage['input'],
            'output_tokens': self.token_usage['output'],
            'total_cost_usd': round(self.daily_cost, 4),
            'budget_limit_usd': self.cost_limit,
            'remaining_usd': round(max(0, self.cost_limit - self.daily_cost), 4),
            'duration_seconds': (datetime.now() - self.start_time).total_seconds()
        }
    
    def save_report(self, filepath: str = 'cost_report.json'):
        summary = self.get_summary()
        summary['timestamp'] = datetime.now().isoformat()
        
        with open(filepath, 'w') as f:
            json.dump(summary, f, indent=2)
        
        return summary
