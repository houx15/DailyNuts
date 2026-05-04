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

```
GitHub Actions (daily cron @ 08:00 UTC)
    ├── Python ingest pipeline (ingest/)
    │   ├── adapters: RSS, scraper, arXiv, GitHub releases
    │   ├── summarizer.py — LLM API calls (OpenAI-compatible)
    │   └── brief_generator.py — daily brief generation
    ├── content/ — JSON artifacts committed to repo
    │   ├── items/YYYY-MM-DD.json
    │   ├── briefs/YYYY-MM-DD.json
    │   └── sources.json
    └── Next.js SSG (web/)
        ├── App Router, static export
        ├── Reads content/ JSON at build time
        └── Deployed to Vercel
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16+, Tailwind CSS, TypeScript |
| Pipeline | Python 3.12, feedparser, requests, BeautifulSoup |
| Deployment | Vercel (frontend), GitHub Actions (pipeline) |
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

## License

MIT License

---

Built with ❤️ for the AI learning community.
