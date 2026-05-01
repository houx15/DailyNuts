'use client'

import { Lang, t, fmtDate } from '@/i18n'
import { Item, Brief } from '@/lib/content'

interface HeroProps {
  lang: Lang
  date: string
  brief: Brief
  items: Item[]
  onOpen: (item: Item) => void
}

export function Hero({ lang, date, brief, items }: HeroProps) {
  const headline = lang === 'zh' ? brief.headline_zh : brief.headline_en
  const lede = lang === 'zh' ? brief.lede_zh : brief.lede_en
  const sections = lang === 'zh' ? brief.sections_zh : brief.sections_en

  const splitChar = lang === 'zh' ? '，' : ';'
  const words = headline.split(splitChar)
  const renderHeadline =
    words.length > 1 ? (
      <>
        {words[0]}
        {splitChar}{' '}
        <em className="text-accent">{words.slice(1).join(splitChar).trim()}</em>
      </>
    ) : (
      headline
    )

  return (
    <section className="py-14 pb-12">
      <div className="container-editorial">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-[18px] flex items-center gap-[14px]">
          <span className="w-7 h-px bg-accent inline-block"></span>
          {t(lang, 'daily_kicker')}
          <span className="text-muted tracking-[0.16em]">· {fmtDate(date, lang)}</span>
        </div>

        <h1 className="font-serif font-semibold text-[clamp(40px,6vw,76px)] leading-[1.02] tracking-[-0.025em] m-0 text-balance max-w-[1100px]">
          {renderHeadline}
        </h1>

        <div className="font-sans text-[12px] tracking-[0.06em] text-muted mb-[30px] flex gap-4 items-center flex-wrap">
          <span>{lang === 'zh' ? '由 AI 自动整理' : 'AI-summarised'}</span>
          <span className="text-rule">·</span>
          <span>
            {items.length} {lang === 'zh' ? '项条目' : 'items'}
          </span>
          <span className="text-rule">·</span>
          <span>{lang === 'zh' ? '约 4 分钟阅读' : 'About a 4-min read'}</span>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-14 items-start pt-7 border-t border-ink max-md:grid-cols-1 max-md:gap-9">
          <p className="font-serif text-[clamp(20px,1.9vw,24px)] leading-[1.5] text-ink-2 text-pretty">
            <span className="text-[3.4em] float-left leading-[0.9] mt-[6px] mr-[10px] ml-[-2px] font-bold text-accent">
              {lede.charAt(0)}
            </span>
            {lede.slice(1)}
          </p>

          <div className="flex flex-col gap-7">
            {sections.length > 0 ? (
              sections.map((s, i) => (
                <div key={i} className="border-l-2 border-ink pl-[18px]">
                  <h3 className="font-sans text-[11px] tracking-[0.18em] uppercase text-ink m-0 mb-[10px] font-semibold">
                    {s.title}
                  </h3>
                  <p className="font-serif text-[16px] leading-[1.6] text-ink-2 m-0 text-pretty">{s.body}</p>
                </div>
              ))
            ) : (
              <div className="border-l-2 border-ink pl-[18px]">
                <h3 className="font-sans text-[11px] tracking-[0.18em] uppercase text-ink m-0 mb-[10px] font-semibold">
                  {lang === 'zh' ? '本期无分主题展开' : 'No themed breakdown this issue'}
                </h3>
                <p className="font-serif text-[16px] leading-[1.6] text-muted m-0">
                  {lang === 'zh' ? '请向下查看条目列表。' : 'Browse the items below.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
