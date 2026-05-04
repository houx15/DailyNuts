# DailyNuts — AI Learning Aggregator

> AI-powered daily digest of LLM/Agent research and news. Static site, bilingual (ZH/EN), auto-curated by GitHub Actions.

## Overview / 项目概览

**English:** DailyNuts automatically collects technical content from major AI companies and research sources, generates bilingual summaries, and publishes a curated daily brief as a static website. Every morning at 08:00 UTC, the pipeline runs unattended to bring you the latest in LLM/Agent research and industry news.

**中文：** DailyNuts 自动收集各大 AI 公司和研究源的技术内容，生成双语摘要，并以静态网站形式发布每日精选简报。每天上午 08:00 UTC，流水线自动运行，为您带来 LLM/Agent 领域的最新研究和行业动态。

## Features / 功能特性

| Feature | Description |
|---------|-------------|
| **Daily Brief** | AI-generated narrative summarizing the day's content by theme |
| **Bilingual** | All content available in both Chinese and English |
| **Multiple Sources** | RSS feeds, arXiv papers, GitHub releases, web scraping |
| **Static Site** | No runtime API calls, no database, no backend server |
| **Date Navigation** | Browse past daily briefs via calendar picker |
| **Source Filtering** | Filter items by category (Blogs, Papers, Releases) |
| **Mobile Responsive** | Optimized for both desktop and mobile reading |

## Architecture / 架构

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

## Tech Stack / 技术栈

- **Frontend:** Next.js 16+, Tailwind CSS, TypeScript
- **Pipeline:** Python 3.12, feedparser, requests, BeautifulSoup
- **Deployment:** Vercel (frontend), GitHub Actions (pipeline)
- **Content:** Static JSON files, version-controlled

## Sources / 内容源

### Working Sources / 正常工作的源

| Source | Type | Status |
|--------|------|--------|
| OpenAI News | RSS | ✅ Working |
| Hugging Face Papers | RSS | ✅ Working |
| Anthropic Research | RSS | ✅ Working (Olshansk) |
| Anthropic News | RSS | ✅ Working (Olshansk) |
| Anthropic Engineering | RSS | ✅ Working (Olshansk) |
| Meta AI Blog | RSS | ✅ Working (Olshansk) |
| arXiv cs.CL/AI/LG | API | ✅ Working |
| Moonshot AI Blog | Scraper | ✅ Working |

### Disabled Sources / 已禁用的源

| Source | Type | Reason |
|--------|------|--------|
| Google Research | RSS | ❌ Timeout (regional block) |
| DeepSeek Blog | Scraper | ❌ JS-rendered SPA |
| Qwen Blog | Scraper | ❌ JS-rendered SPA |
| Zhipu AI | Scraper | ❌ JS-rendered SPA |
| MiniMax News | Scraper | ❌ JS-rendered SPA |

### GitHub Releases / GitHub 发布

Requires `GITHUB_TOKEN` secret for API rate limits. Currently configured for:
- DeepSeek, Qwen, THUDM, Tencent Hunyuan, Moonshot

## Setup / 本地开发

### Frontend / 前端

```bash
cd web
npm install
npm run dev      # Development server at http://localhost:3000
npm run build    # Static export for production
npm test         # Run Jest tests
```

### Python Pipeline / Python 流水线

```bash
cd ingest
pip install -r requirements.txt
python main.py   # Run ingest manually
```

### Environment Variables / 环境变量

```bash
LLM_API_KEY      # For summarization/brief generation (OpenAI-compatible)
GITHUB_TOKEN     # For GitHub releases adapter rate limits
```

## Development Workflow / 开发流程

1. **Plan:** Create todo list for each task
2. **Test:** Write tests before implementation (TDD)
3. **Implement:** Follow existing codebase patterns
4. **Verify:** Run tests and check diagnostics
5. **Commit:** Atomic commits with clear messages
6. **Push:** Keep origin/main in sync

## Project Structure / 项目结构

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
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React components
│   │   ├── i18n/          # Bilingual strings
│   │   └── lib/           # Content loading utilities
│   └── package.json
└── content/               # Generated JSON artifacts
    ├── items/             # Daily items
    ├── briefs/            # Daily briefs
    └── sources.json       # Source metadata
```

## License / 许可

MIT License — feel free to use and modify for your own learning aggregator.

---

Built with ❤️ for the AI learning community.
