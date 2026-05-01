'use client'

import { useState } from 'react'
import { Lang, fmtDateShort, I18N } from '@/i18n'
import { SourcesData } from '@/lib/content'
import { DatePicker } from './DatePicker'

interface ArchivePageProps {
  lang: Lang
  availableDates: string[]
  sources: SourcesData
  onOpenDate: (date: string) => void
}

export function ArchivePage({ lang, availableDates, onOpenDate }: ArchivePageProps) {
  const [filterDate, setFilterDate] = useState<string | null>(null)
  const filtered = filterDate ? availableDates.filter((d) => d === filterDate) : availableDates

  return (
    <section className="py-14 pb-24">
      <div className="container-editorial">
        <div className="flex items-end justify-between gap-6 border-b border-ink pb-4 mb-0">
          <div>
            <h1 className="font-serif font-semibold text-[clamp(36px,4.5vw,56px)] tracking-[-0.022em] m-0">
              {lang === 'zh' ? (
                <>
                  历史<em className="text-accent">档案</em>
                </>
              ) : (
                <>
                  The <em className="text-accent">Archive</em>
                </>
              )}
            </h1>
          </div>
          <div className="font-sans text-[13px] text-muted tracking-[0.04em]">
            {lang === 'zh' ? '过去 30 天的每日简报' : 'Daily briefs from the past 30 days'}
          </div>
        </div>

        <div className="flex items-center justify-between gap-[18px] py-[18px] border-b border-rule flex-wrap">
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted">
            {lang === 'zh' ? '按日期筛选' : 'Filter by date'}
          </span>
          <div className="flex gap-[18px] items-center">
            {filterDate && (
              <button
                onClick={() => setFilterDate(null)}
                className="border-0 bg-transparent cursor-pointer font-inherit font-sans text-[12px] text-accent tracking-[0.06em] hover:underline"
              >
                {lang === 'zh' ? '清除筛选 ✕' : 'Clear ✕'}
              </button>
            )}
            <DatePicker
              date={filterDate || availableDates[0]}
              available={availableDates}
              onPick={(d) => setFilterDate(d)}
              lang={lang}
            />
          </div>
        </div>

        <ul className="list-none m-0 p-0">
          {filtered.map((d) => {
            const dateObj = new Date(d + 'T00:00:00')
            return (
              <li
                key={d}
                className="grid grid-cols-[100px_1fr_110px_100px] gap-8 py-[26px] border-b border-rule cursor-pointer transition-all duration-200 hover:bg-accent/[0.025] hover:pl-3 items-baseline max-md:grid-cols-[80px_1fr] max-md:gap-[14px]"
                onClick={() => onOpenDate(d)}
              >
                <div className="font-mono text-[12px] text-ink tracking-[0.06em]">
                  {fmtDateShort(d, lang)}
                  <span className="block text-[10px] text-muted mt-1 tracking-[0.14em] uppercase">
                    {I18N[lang].weekday[dateObj.getDay()]}
                  </span>
                </div>
                <h3 className="font-serif text-[22px] font-semibold leading-[1.25] tracking-[-0.014em] text-ink text-balance transition-colors duration-160 hover:text-accent-ink m-0">
                  {d}
                </h3>
                <div className="font-mono text-[11px] text-muted tracking-[0.1em] text-right max-md:hidden">
                  <strong className="font-serif italic text-[26px] text-ink font-semibold block mb-0.5">
                    {d}
                  </strong>
                  {lang === 'zh' ? '条' : 'items'}
                </div>
                <div className="font-sans text-[12px] text-muted text-right tracking-[0.06em] transition-colors duration-160 hover:text-accent max-md:hidden">
                  {lang === 'zh' ? '查看 →' : 'View →'}
                </div>
              </li>
            )
          })}
        </ul>

        {filtered.length === 0 && (
          <div className="py-12 text-center font-serif italic text-muted">
            {lang === 'zh' ? '该日期暂无内容。' : 'No issue on this date.'}
          </div>
        )}
      </div>
    </section>
  )
}
