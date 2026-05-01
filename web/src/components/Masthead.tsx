'use client'

import { Lang, t } from '@/i18n'

interface MastheadProps {
  lang: Lang
  setLang: (lang: Lang) => void
  route: string
  setRoute: (route: string) => void
}

export function Masthead({ lang, setLang, route, setRoute }: MastheadProps) {
  return (
    <header className="border-b border-rule py-[22px] pb-[18px]">
      <div className="container-editorial">
        <div className="flex items-baseline justify-between gap-6">
          <div className="flex items-baseline gap-[18px]">
            <div className="font-serif font-bold text-[26px] tracking-[-0.01em] italic">
              Daily<span className="text-accent"></span> Nuts
              <span className="not-italic text-accent font-normal">.</span>
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
              {t(lang, 'masthead_tag')}
            </div>
          </div>
          <nav className="flex gap-[22px] items-center font-sans text-[13px] text-ink-2">
            <a
              className={`relative py-1 cursor-pointer transition-colors duration-160 hover:text-accent ${
                route === 'today' ? 'text-ink' : ''
              }`}
              onClick={() => setRoute('today')}
            >
              {t(lang, 'nav_today')}
              {route === 'today' && (
                <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-ink"></span>
              )}
            </a>
            <a
              className={`relative py-1 cursor-pointer transition-colors duration-160 hover:text-accent ${
                route === 'archive' ? 'text-ink' : ''
              }`}
              onClick={() => setRoute('archive')}
            >
              {t(lang, 'nav_archive')}
              {route === 'archive' && (
                <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-ink"></span>
              )}
            </a>
            <div className="inline-flex items-stretch border border-rule rounded-full overflow-hidden font-mono text-[10.5px] tracking-[0.14em] bg-white/30">
              <button
                className={`border-0 bg-transparent px-3 py-[6px] font-inherit cursor-pointer transition-colors duration-160 ${
                  lang === 'zh' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                }`}
                onClick={() => setLang('zh')}
              >
                中文
              </button>
              <button
                className={`border-0 bg-transparent px-3 py-[6px] font-inherit cursor-pointer transition-colors duration-160 ${
                  lang === 'en' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                }`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
