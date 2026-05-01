# DailyNuts — AI Learning Aggregator

> AI-powered daily digest of LLM/Agent research and news. Static site, bilingual (ZH/EN), auto-curated by GitHub Actions.

## Current State (Early)

This repo is in **pre-implementation phase**. What exists:
- `docs/SPEC.md` — full product spec (architecture, data schemas, pipeline, phases)
- `docs/portofolio/project/` — **design handoff bundle** from Claude Design (HTML/CSS/JS prototype)
  - `AI Learning Aggregator.html` — main design file (read this first for UI intent)
  - `app.jsx`, `data.js`, `styles.css` — prototype components and styling
- `.git/` — fresh repo, no commits yet

**Not yet implemented**: No `package.json`, no Python code, no GitHub Actions, no content. You are likely scaffolding from zero.

## Architecture (Planned)

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

**Tech Stack**
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, TypeScript
- **Backend/Pipeline**: Python 3.12, feedparser, requests, BeautifulSoup, openai client
- **Deployment**: Vercel (frontend), GitHub Actions (pipeline)
- **Content**: Static JSON files, version-controlled

## Design System

The visual design lives in `docs/portofolio/project/`. Key characteristics:
- **Editorial/magazine aesthetic**: warm paper background (`#F5EFE4`), serif typography
- **Fonts**: Source Serif 4, Noto Serif SC (ZH), Inter, JetBrains Mono
- **Accent**: vermilion (`#B8341F`)
- **Layout**: clean, reading-focused, minimal JS
- **Responsive**: desktop two-column → mobile single column

When implementing the frontend, read the prototype files to match the visual intent. Do not copy the prototype's internal structure verbatim — recreate it in Next.js + Tailwind.

## Content Schema

Items (`content/items/YYYY-MM-DD.json`):
```json
{
  "id": "sha256-of-url",
  "url": "...",
  "title": "Original Title",
  "title_zh": "中文标题",
  "source_id": "anthropic_research",
  "published_at": "2026-05-01T10:00:00Z",
  "original_language": "en",
  "summary_en": "AI-generated English summary...",
  "summary_zh": "AI 生成的中文摘要...",
  "categories_en": ["Interpretability", "Alignment"],
  "categories_zh": ["可解释性", "对齐"],
  "theme": "interp"
}
```

Briefs (`content/briefs/YYYY-MM-DD.json`):
```json
{
  "headline_en": "...",
  "headline_zh": "...",
  "lede_en": "...",
  "lede_zh": "...",
  "sections_en": [{"title": "...", "body": "..."}],
  "sections_zh": [{"title": "...", "body": "..."}],
  "top_picks": ["item-id-1", "item-id-2"]
}
```

## Development Commands (Expected)

Once scaffolded:
```bash
# Frontend (web/)
cd web && npm install && npm run dev      # Development server
npm run build                             # Static export for Vercel

# Python pipeline (ingest/)
pip install -r ingest/requirements.txt
python ingest/main.py                     # Run ingest manually
```

## Key Constraints

- **Static site only**: No runtime API calls, no backend server, no database
- **No user accounts/auth** (v1)
- **No full-text storage**: Only summaries and metadata
- **Bilingual by default**: Every item and brief has ZH + EN versions
- **Daily automated pipeline**: Everything must work unattended in GitHub Actions

## Source Types

| Type | Adapter | Sources |
|------|---------|---------|
| RSS | `rss.py` | OpenAI, Google Research, Anthropic (Olshansk feeds), Meta, HF Papers |
| Scraper | `scraper.py` | DeepSeek, Qwen, Zhipu, Moonshot, MiniMax |
| arXiv | `arxiv.py` | cs.CL + cs.AI + cs.LG with keyword filter |
| GitHub Releases | `github_releases.py` | deepseek-ai, QwenLM, THUDM, Tencent-Hunyuan, MoonshotAI |

## Environment Variables

```bash
LLM_API_KEY      # For summarization/brief generation (any OpenAI-compatible provider)
GITHUB_TOKEN     # For GitHub releases adapter rate limits
```

## Implementation Phases (from SPEC.md)

1. **Foundation**: RSS adapter, basic scraper, single-language summarization, Next.js frontend, GitHub Actions
2. **Full Coverage**: All scrapers, arXiv, GitHub releases, bilingual support
3. **Polish**: Scraper resilience, archive page, mobile optimization, prompt tuning

## When Implementing

- **Match the design prototype** — the editorial aesthetic is intentional and should be preserved
- **Follow SPEC.md** for data schemas, pipeline flow, and source configurations
- **Static site generation** — all content reads happen at build time via `fs.readFileSync`
- **Language toggle** — persisted in `localStorage`, affects both UI text and AI-generated content
- **Date navigation** — calendar picker with content availability indicators

## Questions?

If something is ambiguous and not covered by SPEC.md or the design prototype, ask before implementing. This is early-stage; scope clarifications are expected.
