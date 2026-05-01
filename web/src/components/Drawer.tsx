'use client'

import { useEffect, useState } from 'react'
import { Lang, fmtDate, t } from '@/i18n'
import { Item, SourcesData } from '@/lib/content'
import { MonoCircle } from './MonoCircle'

interface DrawerProps {
  item: Item | null
  lang: Lang
  sources: SourcesData
  onClose: () => void
}

export function Drawer({ item, lang, sources, onClose }: DrawerProps) {
  const open = !!item

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const [shown, setShown] = useState(item)
  useEffect(() => {
    if (item) setShown(item)
  }, [item])
  const display = item || shown

  if (!display) return null

  const src = sources[display.source]
  if (!src) return null

  const cats = lang === 'zh' ? display.categories_zh : display.categories_en

  return (
    <>
      <div
        className={`fixed inset-0 bg-ink/40 z-[80] transition-opacity duration-240 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[min(640px,100vw)] bg-paper border-l border-ink z-[90] transition-transform duration-[320ms] ease-[cubic-bezier(0.32,0.72,0.16,1)] overflow-y-auto flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center px-9 py-[18px] border-b border-rule font-mono text-[11px] tracking-[0.16em] uppercase text-muted max-md:px-[22px] max-md:py-3">
          <span>№ {display.id}</span>
          <button
            className="border-0 bg-transparent cursor-pointer font-inherit text-ink-2 p-1 hover:text-accent transition-colors duration-160"
            onClick={onClose}
          >
            {lang === 'zh' ? '关闭 ✕' : 'Close ✕'}
          </button>
        </div>

        <div className="px-12 pb-[60px] pt-10 max-md:px-[22px] max-md:pt-7">
          <div className="flex items-center gap-[14px] mb-[26px] font-sans text-[13px]">
            <MonoCircle source={src.name} tone={src.tone} mono={src.mono} size="small" />
            <div>
              <div className="font-medium text-ink tracking-[0.02em]">
                {lang === 'zh' ? src.name_zh : src.name}
              </div>
              <div className="font-mono text-[10.5px] text-muted tracking-[0.14em] uppercase">
                {lang === 'zh' ? src.kind_label_zh : src.kind_label_en} ·{' '}
                {fmtDate(display.published_at.slice(0, 10), lang)}
              </div>
            </div>
          </div>

          <h1 className="font-serif font-semibold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.02em] m-0 mb-[18px] text-balance">
            {lang === 'zh' ? display.title_zh : display.title_en}
          </h1>

          <p className="font-serif italic text-[16px] text-muted m-0 mb-[26px] pb-6 border-b border-rule">
            “{lang === 'zh' ? display.title_en : display.title_zh}”
          </p>

          <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-accent mb-3">
            {t(lang, 'drawer_kind')}
          </div>
          <p className="font-serif text-[19px] leading-[1.55] text-ink m-0 mb-8 text-pretty">
            {lang === 'zh' ? display.summary_zh : display.summary_en}
          </p>

          <div className="grid grid-cols-2 gap-0 border-t border-ink mb-8">
            <div className="py-[14px] border-b border-rule font-mono text-[11px] text-muted tracking-[0.08em] odd:pr-4 odd:border-r even:pl-4">
              <span className="text-[9.5px] uppercase tracking-[0.18em] text-muted-2 block mb-1">
                {t(lang, 'drawer_published')}
              </span>
              <span className="font-serif text-[15px] text-ink normal-case tracking-normal">
                {fmtDate(display.published_at.slice(0, 10), lang)}
              </span>
            </div>
            <div className="py-[14px] border-b border-rule font-mono text-[11px] text-muted tracking-[0.08em] odd:pr-4 odd:border-r even:pl-4">
              <span className="text-[9.5px] uppercase tracking-[0.18em] text-muted-2 block mb-1">
                {t(lang, 'drawer_source')}
              </span>
              <span className="font-serif text-[15px] text-ink normal-case tracking-normal">
                {lang === 'zh' ? src.name_zh : src.name}
              </span>
            </div>
            <div className="py-[14px] border-b border-rule font-mono text-[11px] text-muted tracking-[0.08em] odd:pr-4 odd:border-r even:pl-4">
              <span className="text-[9.5px] uppercase tracking-[0.18em] text-muted-2 block mb-1">
                {t(lang, 'drawer_categories')}
              </span>
              <span className="font-serif text-[15px] text-ink normal-case tracking-normal">
                {cats.join(' · ')}
              </span>
            </div>
            <div className="py-[14px] border-b border-rule font-mono text-[11px] text-muted tracking-[0.08em] odd:pr-4 odd:border-r even:pl-4">
              <span className="text-[9.5px] uppercase tracking-[0.18em] text-muted-2 block mb-1">
                {t(lang, 'drawer_lang')}
              </span>
              <span className="font-serif text-[15px] text-ink normal-case tracking-normal">
                {(display.original_language || 'en').toUpperCase()}
              </span>
            </div>
          </div>

          <a
            href={display.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[10px] border border-ink px-[22px] py-[14px] font-sans text-[13px] tracking-[0.04em] text-ink bg-transparent cursor-pointer transition-all duration-200 hover:bg-ink hover:text-paper hover:gap-[14px]"
          >
            <span>{t(lang, 'drawer_open')}</span>
            <span className="font-mono text-[13px]">↗</span>
          </a>
        </div>
      </aside>
    </>
  )
}
