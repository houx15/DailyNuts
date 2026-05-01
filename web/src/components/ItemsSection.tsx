'use client'

import { useMemo, useState } from 'react'
import { Lang, t } from '@/i18n'
import { Item, SourcesData } from '@/lib/content'
import { ItemRow } from './ItemRow'
import { SourceFilter } from './SourceFilter'

const THEMES = [
  { id: 'interp', zh: '可解释性与对齐', en: 'Interpretability & Alignment' },
  { id: 'arch', zh: '模型架构与记忆', en: 'Architecture & Memory' },
  { id: 'agent', zh: 'Agent 工程', en: 'Agent Engineering' },
  { id: 'release', zh: '新模型发布', en: 'Model Releases' },
  { id: 'evals', zh: '评估与基准', en: 'Evals & Benchmarks' },
  { id: 'apps', zh: '应用与产品', en: 'Applications & Product' },
  { id: 'other', zh: '其他', en: 'Other' },
]

interface ItemsSectionProps {
  lang: Lang
  items: Item[]
  sources: SourcesData
  onOpen: (item: Item) => void
}

export function ItemsSection({ lang, items, sources, onOpen }: ItemsSectionProps) {
  const [filteredItems, setFilteredItems] = useState(items)

  const grouped = useMemo(() => {
    const buckets = new Map(THEMES.map((th) => [th.id, [] as Item[]]))
    for (const it of filteredItems) {
      const id = it.theme && buckets.has(it.theme) ? it.theme : 'other'
      buckets.get(id)!.push(it)
    }
    return THEMES.map((th) => ({ ...th, items: buckets.get(th.id)! })).filter(
      (th) => th.items.length > 0
    )
  }, [filteredItems])

  const handleFilterChange = (newFiltered: Item[]) => {
    setFilteredItems(newFiltered)
  }

  return (
    <section className="py-16 pb-24">
      <div className="container-editorial">
        <div className="flex items-end justify-between gap-6 border-b border-ink pb-[14px] mb-0">
          <h2 className="font-serif font-semibold text-[28px] tracking-[-0.012em] m-0">
            {t(lang, 'items_title')}
            <span className="font-mono text-[13px] font-normal text-muted tracking-[0.1em] ml-3 align-[4px]">
              {t(lang, 'items_count', { n: String(filteredItems.length) })}
            </span>
          </h2>
          <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted">
            {lang === 'zh' ? '按主题归类 · ' : 'Grouped by theme · '}
            {grouped.length} {lang === 'zh' ? '类' : 'sections'}
          </div>
        </div>

        <div className="py-4 border-b border-rule-soft">
          <SourceFilter
            lang={lang}
            items={items}
            sources={sources}
            onFilterChange={handleFilterChange}
          />
        </div>

        {grouped.map((th, gi) => (
          <div key={th.id} className={gi === 0 ? 'mt-2' : 'mt-12'}>
            <div className="flex items-baseline gap-4 py-[18px] pb-[10px] border-b border-rule-soft">
              <span className="font-serif italic text-[14px] text-accent tracking-[0.04em]">
                § 0{gi + 1}
              </span>
              <h3 className="font-serif font-semibold text-[22px] tracking-[-0.014em] m-0 text-ink">
                {lang === 'zh' ? th.zh : th.en}
              </h3>
              <span className="font-mono text-[10.5px] text-muted tracking-[0.14em] ml-auto">
                {th.items.length} {lang === 'zh' ? '项' : 'items'}
              </span>
            </div>
            <ul className="list-none m-0 p-0">
              {th.items.map((it) => (
                <ItemRow key={it.id} item={it} lang={lang} sources={sources} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
