# DailyNuts — AI Learning Aggregator

[🇨🇳 中文](README.zh.md)

> AI-powered daily digest of LLM/Agent research and news. Static site, bilingual (ZH/EN), auto-curated by GitHub Actions.

## Overview

DailyNuts automatically collects technical content from major AI companies and research sources, generates bilingual summaries, and publishes a curated daily brief as a static website. Every morning at 08:00 UTC, the pipeline runs unattended to bring you the latest in LLM/Agent research and industry news.

## Features

- **Daily Brief** — AI-generated narrative summarizing the day's content by theme
- **Bilingual** — All content available in both Chinese and English
- **Multiple Sources** — RSS feeds, arXiv papers, GitHub releases, web scraping
- **Static Site** — No runtime API calls, no database, no backend server
- **Date Navigation** — Browse past daily briefs via calendar picker
- **Source Filtering** — Filter items by category (Blogs, Papers, Releases)
- **Mobile Responsive** — Optimized for both desktop and mobile reading

## Architecture

Two branches power the entire system — `main` is the source of truth, `gh-pages` is a disposable build artifact.

```
main branch                          gh-pages branch
(source of truth)                    (static site, force-pushed)

  DailyNuts/                           index.html
  ├── ingest/                          _next/
  │   ├── adapters/          ──build──►├── static/
  │   └── main.py            (once)    └── ...
  ├── content/
  │   ├── items/YYYY-MM-DD.json        ↑ served by
  │   ├── briefs/YYYY-MM-DD.json       GitHub Pages
  │   └── sources.json                 at digest.kookat.icu
  └── web/
      └── src/ (Next.js SSG)
```

**Data flows one way: main → build → gh-pages → live site.** Nothing ever flows back.

### How the workflow runs

One workflow (`daily-ingest.yml`), two sequential jobs:

```
08:00 UTC cron fires
  │
  ▼
┌─ ingest job ──────────────────────────────────────┐
│  1. checkout main                                  │
│  2. python ingest/main.py                          │
│     ├── fetch RSS/arXiv/scraper/GitHub releases    │
│     ├── LLM summarizes → bilingual                 │
│     └── save content/items/2026-05-06.json         │
│  3. git add content/ → git commit → git push main  │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌─ deploy job (needs: ingest) ───────────────────────┐
│  4. checkout main (picks up the fresh content)     │
│  5. npm run build → reads content/ → web/dist/     │
│  6. push web/dist/ to gh-pages branch              │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
         GitHub Pages serves gh-pages
            at digest.kookat.icu
```

No database, no backend server. The repo itself is the content store. Content files (`content/items/*.json`) are version-controlled alongside source code — every day's ingest is a git commit.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16+, Tailwind CSS, TypeScript |
| Pipeline | Python 3.12, feedparser, requests, BeautifulSoup |
| Deployment | GitHub Pages via `peaceiris/actions-gh-pages@v4` |
| Content | Static JSON files, version-controlled |

## Sources

### Working

| Source | Type |
|--------|------|
| OpenAI News | RSS |
| Hugging Face Papers | RSS |
| Anthropic Research | RSS (Olshansk) |
| Anthropic News | RSS (Olshansk) |
| Anthropic Engineering | RSS (Olshansk) |
| Meta AI Blog | RSS (Olshansk) |
| arXiv cs.CL/AI/LG | API |
| Moonshot AI Blog | Scraper |

### Disabled

| Source | Type | Reason |
|--------|------|--------|
| Google Research | RSS | Regional timeout |
| DeepSeek Blog | Scraper | JS-rendered SPA |
| Qwen Blog | Scraper | JS-rendered SPA |
| Zhipu AI | Scraper | JS-rendered SPA |
| MiniMax News | Scraper | JS-rendered SPA |

### GitHub Releases

Requires `GITHUB_TOKEN` secret for API rate limits. Configured for: DeepSeek, Qwen, THUDM, Tencent Hunyuan, Moonshot.

## Setup

### Frontend

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # Static export
npm test         # Run Jest tests
```

### Python Pipeline

```bash
cd ingest
pip install -r requirements.txt
python main.py   # Run ingest manually
```

### Environment Variables

```bash
LLM_API_KEY      # Summarization/brief generation (OpenAI-compatible)
GITHUB_TOKEN     # GitHub releases adapter rate limits
```

## Project Structure

```
DailyNuts/
├── .github/workflows/     # GitHub Actions
├── docs/                  # SPEC.md and design assets
├── ingest/                # Python pipeline
│   ├── adapters/          # RSS, scraper, arXiv, GitHub
│   ├── config.yml         # Source configuration
│   ├── main.py            # Pipeline entry point
│   └── test_adapters.py   # Unit tests
├── web/                   # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # React components
│   │   ├── i18n/          # Bilingual strings
│   │   └── lib/           # Content utilities
│   └── package.json
└── content/               # Generated JSON artifacts
    ├── items/             # Daily items
    ├── briefs/            # Daily briefs
    └── sources.json       # Source metadata
```

## Deployment

This project is deployed on GitHub Pages at [digest.kookat.icu](https://digest.kookat.icu). The `deploy` job in `daily-ingest.yml` publishes to the `gh-pages` branch automatically after each ingest run.

### Auto-trigger flow

```
GitHub Actions (daily @ 08:00 UTC)
    → ingests content, commits & pushes to main
    → builds Next.js static export
    → pushes web/dist/ to gh-pages
    → GitHub Pages serves fresh content
```

No manual intervention — the pipeline and deployment run fully unattended.

### First-time setup

1. Enable GitHub Pages in repo Settings → Pages → Source: "Deploy from a branch" → Branch: `gh-pages` (root)
2. Set custom domain: `digest.kookat.icu` (creates `web/public/CNAME`)
3. Go to repo Settings → Secrets and variables → Actions → add secrets:
   - `LLM_API_KEY` — OpenAI-compatible API key for LLM summarization
   - `LLM_BASE_URL` — API endpoint (if not using OpenAI's default)
   - `LLM_MODEL` — model name to use
   - `GITHUB_TOKEN` — auto-provided by GitHub Actions
4. Go to Actions tab → Daily Ingest → Run workflow to trigger the first deploy

## License

MIT License

---

Built with ❤️ for the AI learning community.
