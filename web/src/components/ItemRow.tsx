'use client'

import { Lang, fmtDateShort, fmtTime } from '@/i18n'
import { Item, SourcesData } from '@/lib/content'
import { MonoCircle } from './MonoCircle'

interface ItemRowProps {
  item: Item
  lang: Lang
  sources: SourcesData
  onOpen: (item: Item) => void
}

export function ItemRow({ item, lang, sources, onOpen }: ItemRowProps) {
  const src = sources[item.source]
  if (!src) return null

  const cats = lang === 'zh' ? item.categories_zh : item.categories_en

  return (
    <li
      className="grid grid-cols-[76px_1fr_220px] gap-8 py-8 border-b border-rule cursor-pointer transition-all duration-200 hover:bg-accent/[0.025] hover:pl-3 max-md:grid-cols-[56px_1fr] max-md:gap-[18px]"
      onClick={() => onOpen(item)}
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <MonoCircle source={src.name} tone={src.tone} mono={src.mono} />
        <div className="font-sans text-[10.5px] tracking-[0.05em] text-muted text-center leading-[1.2] max-w-[80px] text-balance">
          {lang === 'zh' ? src.name_zh : src.name}
        </div>
      </div>

      <div className="min-w-0">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted mb-2 flex gap-[10px] items-center">
          <span>{lang === 'zh' ? src.kind_label_zh : src.kind_label_en}</span>
          <span className="text-rule">·</span>
          <span>{fmtDateShort(item.published_at.slice(0, 10), lang)}</span>
        </div>
        <h2 className="font-serif font-semibold text-[26px] leading-[1.2] tracking-[-0.018em] m-0 mb-3 text-balance transition-colors duration-160 hover:text-accent-ink">
          {lang === 'zh' ? item.title_zh : item.title_en}
        </h2>
        <p className="font-serif text-[16.5px] leading-[1.55] text-ink-2 m-0 mb-3 text-pretty max-w-[56ch]">
          {lang === 'zh' ? item.summary_zh : item.summary_en}
        </p>
        <div className="flex gap-[14px] font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted">
          {cats.map((c) => (
            <span key={c}>
              <span className="opacity-50 mr-0.5">#</span>
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="font-mono text-[11px] text-muted flex flex-col gap-[6px] text-right pt-[6px] max-md:text-left max-md:pt-0 max-md:col-start-2">
        <div>{fmtTime(item.published_at, lang)}</div>
        <div className="text-muted-2">
          {item.original_language === 'zh' ? 'ZH' : 'EN'} → {lang.toUpperCase()}
        </div>
        <div className="font-sans text-[11.5px] text-accent mt-auto tracking-[0.06em] inline-flex items-center gap-[6px] transition-gap duration-160 group-hover:gap-[10px]">
          {lang === 'zh' ? '阅读全文' : 'Read in full'} →
        </div>
      </div>
    </li>
  )
}
