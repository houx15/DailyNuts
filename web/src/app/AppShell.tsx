'use client'

import { useState, useEffect } from 'react'
import { Lang } from '@/i18n'
import { Masthead } from '@/components/Masthead'
import { SubBar } from '@/components/SubBar'
import { Hero } from '@/components/Hero'
import { ItemsSection } from '@/components/ItemsSection'
import { ArchivePage } from '@/components/ArchivePage'
import { Drawer } from '@/components/Drawer'
import { Item, Brief, SourcesData } from '@/lib/content'

function emptyBrief(date: string): Brief {
  return {
    date,
    brief_en: '',
    brief_zh: '',
    headline_en: `No brief for ${date}`,
    headline_zh: `${date} 无简报`,
    lede_en: '',
    lede_zh: '',
    sections_en: [],
    sections_zh: [],
    top_picks: [],
    item_count: 0,
    source_breakdown: {},
    generated_at: '',
  }
}

interface AppShellProps {
  initialDate: string
  availableDates: string[]
  initialItems: Item[]
  initialBrief: Brief
  allItems: Record<string, Item[]>
  allBriefs: Record<string, Brief>
  sources: SourcesData
}

export function AppShell({
  initialDate,
  availableDates,
  initialItems,
  initialBrief,
  allItems,
  allBriefs,
  sources,
}: AppShellProps) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lang') as Lang) || 'zh'
    }
    return 'zh'
  })
  const [route, setRoute] = useState('today')
  const [date, setDate] = useState(initialDate)
  const [items, setItems] = useState(initialItems)
  const [brief, setBrief] = useState(initialBrief)
  const [openItem, setOpenItem] = useState<Item | null>(null)

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  function pickDate(d: string) {
    setDate(d)
    setItems(allItems[d] || [])
    setBrief(allBriefs[d] || emptyBrief(d))
    setRoute('today')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-paper text-ink relative">
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.018) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />
      <div className="relative z-10">
        <Masthead
          lang={lang}
          setLang={setLang}
          route={route}
          setRoute={setRoute}
        />
        <SubBar
          lang={lang}
          date={date}
          items={items}
          route={route}
          availableDates={availableDates}
          onPickDate={pickDate}
        />

        {route === 'today' ? (
          <main className="animate-fade-up" key={`today-${date}-${lang}`}>
            <Hero
              lang={lang}
              date={date}
              brief={brief}
              items={items}
              onOpen={setOpenItem}
            />
            <ItemsSection
              lang={lang}
              items={items}
              sources={sources}
              onOpen={setOpenItem}
            />
          </main>
        ) : (
          <main className="animate-fade-up" key={`archive-${lang}`}>
            <ArchivePage
              lang={lang}
              availableDates={availableDates}
              sources={sources}
              onOpenDate={pickDate}
            />
          </main>
        )}

        <footer className="border-t border-rule py-8 pb-12">
          <div className="container-editorial">
            <div className="flex justify-between gap-6 flex-wrap font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted">
              <span>{lang === 'zh' ? '由 GitHub Actions 每日自动汇总' : 'Auto-curated daily by GitHub Actions'}</span>
              <span>{lang === 'zh' ? '基于 Next.js · 部署于 Vercel' : 'Built with Next.js · Deployed on Vercel'}</span>
            </div>
          </div>
        </footer>

        <Drawer
          item={openItem}
          lang={lang}
          sources={sources}
          onClose={() => setOpenItem(null)}
        />
      </div>
    </div>
  )
}
