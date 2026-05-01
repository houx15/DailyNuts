'use client'

import { useState, useMemo } from 'react'
import { Lang, t } from '@/i18n'
import { Item, SourcesData } from '@/lib/content'

interface SourceFilterProps {
  lang: Lang
  items: Item[]
  sources: SourcesData
  onFilterChange: (filteredItems: Item[]) => void
}

const FILTER_OPTIONS = [
  { id: 'all', label_en: 'All', label_zh: '全部' },
  { id: 'company_blog', label_en: 'Blogs', label_zh: '博客' },
  { id: 'paper', label_en: 'Papers', label_zh: '论文' },
  { id: 'release', label_en: 'Releases', label_zh: '发布' },
]

export function SourceFilter({ lang, items, sources, onFilterChange }: SourceFilterProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedSource, setSelectedSource] = useState<string | null>(null)

  const sourceList = useMemo(() => {
    const uniqueSources = new Set(items.map((item) => item.source))
    return Array.from(uniqueSources).map((sourceId) => ({
      id: sourceId,
      name: lang === 'zh' ? sources[sourceId]?.name_zh : sources[sourceId]?.name,
      kind: sources[sourceId]?.kind || 'other',
    }))
  }, [items, sources, lang])

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    setSelectedSource(null)

    if (filterId === 'all') {
      onFilterChange(items)
    } else {
      const filtered = items.filter((item) => {
        const source = sources[item.source]
        return source?.kind === filterId
      })
      onFilterChange(filtered)
    }
  }

  const handleSourceChange = (sourceId: string | null) => {
    setSelectedSource(sourceId)
    setActiveFilter('all')

    if (sourceId === null) {
      onFilterChange(items)
    } else {
      const filtered = items.filter((item) => item.source === sourceId)
      onFilterChange(filtered)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 items-center flex-wrap">
        <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted">
          {lang === 'zh' ? '筛选' : 'Filter'}
        </span>
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            className={`border-0 bg-transparent py-1 font-inherit cursor-pointer transition-colors duration-160 relative ${
              activeFilter === option.id ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
            onClick={() => handleFilterChange(option.id)}
          >
            {lang === 'zh' ? option.label_zh : option.label_en}
            {activeFilter === option.id && (
              <span className="absolute left-0 right-0 bottom-[-4px] h-px bg-accent"></span>
            )}
          </button>
        ))}
      </div>

      {sourceList.length > 0 && (
        <div className="flex gap-2 items-center flex-wrap">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-2">
            {lang === 'zh' ? '来源' : 'Source'}
          </span>
          <select
            value={selectedSource || ''}
            onChange={(e) => handleSourceChange(e.target.value || null)}
            className="bg-transparent border border-rule rounded px-2 py-1 font-sans text-[12px] text-ink cursor-pointer"
          >
            <option value="">{lang === 'zh' ? '全部来源' : 'All sources'}</option>
            {sourceList.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name || source.id}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
