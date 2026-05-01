'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Lang, fmtDate, I18N } from '@/i18n'

interface DatePickerProps {
  date: string
  available: string[]
  onPick: (date: string) => void
  lang: Lang
}

export function DatePicker({ date, available, onPick, lang }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const d = new Date(date + 'T00:00:00')
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const availSet = useMemo(() => new Set(available), [available])
  const monthLabel = `${I18N[lang].months[view.m]} ${view.y}`

  const first = new Date(view.y, view.m, 1)
  const startDow = first.getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ d, iso, has: availSet.has(iso) })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="inline-flex items-baseline gap-3 border-0 bg-transparent p-0 cursor-pointer font-serif text-[13px] text-ink tracking-[0.04em]"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted">
          {lang === 'zh' ? '查阅日期' : 'Issue date'}
        </span>
        <span className="font-serif font-semibold text-[15px] tracking-[-0.01em]">
          {fmtDate(date, lang)}
        </span>
        <span
          className={`font-mono text-[10px] text-muted transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 bg-paper border border-ink shadow-[0_10px_32px_rgba(26,22,20,0.12)] p-[18px] z-30 w-[320px] font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center font-mono text-[11px] tracking-[0.14em] uppercase text-muted mb-[14px]">
            <button
              className="border-0 bg-transparent cursor-pointer font-inherit text-ink-2 p-1 hover:text-accent"
              onClick={() =>
                setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))
              }
            >
              ‹
            </button>
            <span>{monthLabel}</span>
            <button
              className="border-0 bg-transparent cursor-pointer font-inherit text-ink-2 p-1 hover:text-accent"
              onClick={() =>
                setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))
              }
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[2px]">
            {I18N[lang].weekday.map((d) => (
              <div key={d} className="font-mono text-[9.5px] tracking-[0.1em] text-muted-2 text-center py-[6px]">
                {d}
              </div>
            ))}
            {cells.map((c, i) => {
              if (!c)
                return <div key={i} className="aspect-square"></div>
              const isSelected = c.iso === date
              return (
                <div
                  key={c.iso}
                  className={`aspect-square grid place-items-center font-serif text-[14px] rounded-[2px] relative transition-colors duration-140 ${
                    c.has
                      ? 'text-ink-2 cursor-pointer hover:bg-paper-2'
                      : 'text-rule cursor-not-allowed'
                  } ${isSelected ? 'bg-ink text-paper' : ''}`}
                  onClick={() => {
                    if (c.has) {
                      onPick(c.iso)
                      setOpen(false)
                    }
                  }}
                >
                  {c.d}
                  {c.has && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"></span>
                  )}
                  {c.has && isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-paper"></span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="border-t border-rule pt-3 mt-3 flex justify-between font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted">
            <span className="flex items-center gap-[6px]">
              <span className="inline-block w-[5px] h-[5px] rounded-full bg-accent"></span>
              {lang === 'zh' ? '有内容' : 'Has content'}
            </span>
            <button
              className="border-0 bg-transparent font-inherit text-ink-2 cursor-pointer tracking-[0.14em] hover:text-accent"
              onClick={() => {
                onPick(available[0])
                setOpen(false)
              }}
            >
              {lang === 'zh' ? '回到今日' : 'Back to today'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
