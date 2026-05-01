'use client'

import { Lang, t } from '@/i18n'
import { Item } from '@/lib/content'
import { DatePicker } from './DatePicker'

interface SubBarProps {
  lang: Lang
  date: string
  items: Item[]
  route: string
  availableDates: string[]
  onPickDate: (date: string) => void
}

export function SubBar({ lang, date, items, route, availableDates, onPickDate }: SubBarProps) {
  const issueNum = availableDates.length - availableDates.indexOf(date)

  return (
    <div className="border-b border-rule py-[14px] flex items-center justify-between gap-6 font-mono text-[11px] text-muted tracking-[0.1em] uppercase">
      <div className="container-editorial flex items-center justify-between w-full">
        <div className="text-ink-2">
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent mr-[6px] align-[2px] animate-pulse"></span>
          {route === 'archive'
            ? lang === 'zh'
              ? `档案 · 共 ${availableDates.length} 期`
              : `Archive · ${availableDates.length} issues`
            : t(lang, 'vol', { n: String(issueNum) })}
          {route !== 'archive' && (
            <>
              <span className="mx-[14px] text-rule">/</span>
              <span className="normal-case tracking-[0.04em] text-muted">
                {items.length} {lang === 'zh' ? '项已收录' : 'items curated'}
              </span>
            </>
          )}
        </div>
        {route !== 'archive' && (
          <DatePicker
            date={date}
            available={availableDates}
            onPick={onPickDate}
            lang={lang}
          />
        )}
      </div>
    </div>
  )
}
