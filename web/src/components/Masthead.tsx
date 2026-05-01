'use client'

import { useState } from 'react'
import { Lang, t } from '@/i18n'

interface MastheadProps {
  lang: Lang
  setLang: (lang: Lang) => void
  route: string
  setRoute: (route: string) => void
}

export function Masthead({ lang, setLang, route, setRoute }: MastheadProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-rule py-[22px] pb-[18px]">
      <div className="container-editorial">
        <div className="flex items-baseline justify-between gap-6">
          <div className="flex items-baseline gap-[18px]">
            <div className="font-serif font-bold text-[26px] tracking-[-0.01em] italic">
              Daily<span className="text-accent"></span> Nuts
              <span className="not-italic text-accent font-normal">.</span>
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted hidden md:block">
              {t(lang, 'masthead_tag')}
            </div>
          </div>

          <button
            className="md:hidden p-2 border-0 bg-transparent cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-ink mb-1 transition-transform"></div>
            <div className="w-5 h-0.5 bg-ink mb-1 transition-opacity"></div>
            <div className="w-5 h-0.5 bg-ink transition-transform"></div>
          </button>

          <nav className="hidden md:flex gap-[22px] items-center font-sans text-[13px] text-ink-2">
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

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-rule flex flex-col gap-4 font-sans text-[15px] text-ink-2">
            <a
              className={`py-2 cursor-pointer transition-colors hover:text-accent ${
                route === 'today' ? 'text-ink font-medium' : ''
              }`}
              onClick={() => { setRoute('today'); setMobileMenuOpen(false); }}
            >
              {t(lang, 'nav_today')}
            </a>
            <a
              className={`py-2 cursor-pointer transition-colors hover:text-accent ${
                route === 'archive' ? 'text-ink font-medium' : ''
              }`}
              onClick={() => { setRoute('archive'); setMobileMenuOpen(false); }}
            >
              {t(lang, 'nav_archive')}
            </a>
            <div className="flex gap-2 pt-2">
              <button
                className={`border border-rule rounded-full px-4 py-2 font-mono text-[12px] tracking-[0.14em] cursor-pointer transition-colors ${
                  lang === 'zh' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                }`}
                onClick={() => setLang('zh')}
              >
                中文
              </button>
              <button
                className={`border border-rule rounded-full px-4 py-2 font-mono text-[12px] tracking-[0.14em] cursor-pointer transition-colors ${
                  lang === 'en' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                }`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
