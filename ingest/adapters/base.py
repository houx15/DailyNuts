from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime


@dataclass
class RawItem:
    """Represents a raw content item before processing."""
    title: str
    url: str
    source_id: str
    published_at: datetime
    original_summary: str = ""
    original_language: str = "en"
    authors: List[str] = field(default_factory=list)
    extra: dict = field(default_factory=dict)


class BaseAdapter(ABC):
    """Base class for all content source adapters."""
    
    def __init__(self, source_config: dict):
        self.config = source_config
        self.source_id = source_config['id']
        self.source_name = source_config['name']
    
    @abstractmethod
    def fetch(self) -> List[RawItem]:
        """Fetch raw items from the source.
        
        Returns:
            List of RawItem objects
        """
        pass
    
    def _make_item(self, title: str, url: str, published_at: datetime,
                   original_summary: str = "", original_language: str = "en",
                   authors: List[str] = None, extra: dict = None) -> RawItem:
        """Helper to create a RawItem with source metadata."""
        return RawItem(
            title=title,
            url=url,
            source_id=self.source_id,
            published_at=published_at,
            original_summary=original_summary,
            original_language=original_language,
            authors=authors or [],
            extra=extra or {}
        )
