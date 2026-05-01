# AI Learning Aggregator - Product Specification

## 1. Overview

A personal AI-powered learning aggregator that automatically collects technical blog posts and research papers from major LLM/Agent companies, generates bilingual (Chinese/English) summaries and a daily brief, and serves them as a static website for daily learning.

### 1.1 Core Value Proposition

One place to stay current on the entire LLM/Agent field. Every morning, a curated, AI-summarized daily brief is ready, organized by category and importance, in both Chinese and English.

### 1.2 Non-Goals (v1)

- No user accounts or authentication
- No backend server or database at runtime
- No bookmarks, read status, or notes (may be added in future iterations)
- No full-text storage of original articles
- No personalized ranking based on user behavior (may be added later)

---

## 2. User Experience

### 2.1 Daily Flow

1. User opens the website
2. Lands on today's Daily Brief: an AI-generated overview that categorizes all new content and highlights what matters most
3. Below the brief, individual items are listed with their summaries
4. User can switch the entire interface and content between Chinese and English
5. User can navigate to previous days via a date selector
6. Clicking any item opens the original article/paper in a new tab

### 2.2 Pages

#### Home / Daily Brief Page

- Date selector (defaults to today)
- Daily Brief section: AI-generated narrative summarizing the day's content, organized by theme/category
- Content list: all items for the selected date, each showing:
  - Source (e.g., "Anthropic Blog", "arXiv", "Qwen Blog")
  - Title (original language + translated if applicable)
  - AI-generated summary (2-3 sentences)
  - Publication date
  - Link to original
- Language toggle (ZH / EN) affecting both UI text and AI-generated content
- Source filter (optional): filter items by source or category

#### Archive Page (optional, low priority)

- Calendar or list view of past daily briefs

### 2.3 Design Principles

- Clean, reading-focused UI. No clutter.
- Fast load times (static site, no runtime API calls)
- Mobile responsive
- Minimal JavaScript, content-first

---

## 3. Architecture

### 3.1 High-Level Architecture

```
                      GitHub Actions (daily cron)
                               |
                    +----------+----------+
                    |                     |
              Python Scripts         LLM API
              (ingest + process)   (summaries + brief)
                    |                     |
                    +----------+----------+
                               |
                          JSON files
                          (committed to repo)
                               |
                         Next.js SSG
                         (static build)
                               |
                      Vercel / GitHub Pages
                         (deployment)
```

### 3.2 Data Pipeline

The daily pipeline runs as a single GitHub Actions workflow:

**Step 1: Ingest**
- Run all source adapters in parallel where possible
- Each adapter fetches new content from its source (RSS, web scraping, API)
- Output: raw items (title, url, date, original_summary/abstract, source_id, language)
- Deduplication by URL against existing items

**Step 2: Summarize**
- For each new item, call the configured LLM API to generate:
  - Chinese summary (2-3 sentences)
  - English summary (2-3 sentences)
- Rate limiting and retry logic for API calls
- Cost control: skip items that already have summaries

**Step 3: Generate Daily Brief**
- Collect all items for today
- Call LLM API with all summaries + a system prompt containing the user's interest profile
- Generate a structured daily brief in both Chinese and English
- The brief should: categorize items by theme, highlight the most important items, provide a narrative overview

**Step 4: Commit & Deploy**
- Write results to JSON files in the repository
- Commit and push
- Trigger Next.js rebuild and deployment

### 3.3 Repository Structure

```
/
├── .github/
│   └── workflows/
│       └── daily-ingest.yml        # Cron workflow
├── ingest/
│   ├── config.yml                  # Source definitions + LLM API config
│   ├── main.py                     # Pipeline orchestrator
│   ├── adapters/
│   │   ├── base.py                 # Base adapter interface
│   │   ├── rss.py                  # Generic RSS adapter
│   │   ├── scraper.py              # Generic web scraper adapter
│   │   ├── arxiv.py                # arXiv API adapter
│   │   ├── github_releases.py      # GitHub releases monitor
│   │   └── huggingface_papers.py   # HF daily papers adapter
│   ├── summarizer.py               # LLM summarization module
│   ├── brief_generator.py          # Daily brief generation
│   └── requirements.txt
├── content/
│   ├── items/
│   │   ├── 2026-05-01.json         # All items for a given date
│   │   ├── 2026-05-02.json
│   │   └── ...
│   ├── briefs/
│   │   ├── 2026-05-01.json         # Daily brief for a given date
│   │   └── ...
│   └── sources.json                # Source metadata for UI display
├── web/                            # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home / daily brief page
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── DailyBrief.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── DateSelector.tsx
│   │   │   ├── LanguageToggle.tsx
│   │   │   └── SourceFilter.tsx
│   │   ├── lib/
│   │   │   └── content.ts          # Read JSON files at build time
│   │   └── i18n/
│   │       ├── zh.json             # Chinese UI strings
│   │       └── en.json             # English UI strings
│   ├── next.config.js
│   └── package.json
└── README.md
```

### 3.4 Data Schemas

#### Item (content/items/YYYY-MM-DD.json)

```json
{
  "date": "2026-05-01",
  "items": [
    {
      "id": "sha256-hash-of-url",
      "url": "https://www.anthropic.com/research/some-post",
      "title": "Original Title Here",
      "source_id": "anthropic_research",
      "source_name": "Anthropic Research",
      "published_at": "2026-05-01T10:00:00Z",
      "original_language": "en",
      "original_summary": "First paragraph or abstract from the source...",
      "summary_en": "AI-generated English summary...",
      "summary_zh": "AI 生成的中文摘要...",
      "categories": ["alignment", "interpretability"],
      "ingested_at": "2026-05-01T12:00:00Z"
    }
  ]
}
```

#### Daily Brief (content/briefs/YYYY-MM-DD.json)

```json
{
  "date": "2026-05-01",
  "brief_en": "## Today's Highlights\n\nAnthropic published a new...\n\n## By Category\n\n### Model Architecture\n...\n\n### Agent Systems\n...",
  "brief_zh": "## 今日要点\n\nAnthropic 发布了...\n\n## 分类浏览\n\n### 模型架构\n...\n\n### Agent 系统\n...",
  "item_count": 15,
  "source_breakdown": {
    "anthropic_research": 2,
    "openai_news": 1,
    "arxiv": 8,
    "hf_papers": 4
  },
  "generated_at": "2026-05-01T12:30:00Z"
}
```

### 3.5 Configuration (ingest/config.yml)

```yaml
llm:
  base_url: "https://api.openai.com/v1"
  model: "gpt-4o-mini"
  api_key: "${LLM_API_KEY}"       # From GitHub Actions secrets
  max_tokens: 500
  temperature: 0.3

languages:
  - en
  - zh

schedule:
  cron: "0 8 * * *"               # Daily at 8:00 UTC

sources:
  # --- RSS-based sources ---
  - id: openai_news
    name: "OpenAI News"
    name_zh: "OpenAI 新闻"
    type: rss
    url: "https://openai.com/news/rss.xml"
    category: company_blog

  - id: google_research
    name: "Google Research Blog"
    name_zh: "Google Research 博客"
    type: rss
    url: "https://research.google/blog/rss"
    category: company_blog

  - id: arxiv_cs_cl
    name: "arXiv cs.CL"
    name_zh: "arXiv 计算语言学"
    type: arxiv
    categories: ["cs.CL", "cs.AI", "cs.LG"]
    keywords: ["large language model", "LLM", "agent", "reasoning",
               "alignment", "RLHF", "instruction tuning", "RAG",
               "multi-agent", "tool use", "code generation",
               "chain of thought", "transformer"]
    max_results_per_day: 30
    category: paper

  - id: hf_papers
    name: "Hugging Face Daily Papers"
    name_zh: "Hugging Face 每日论文"
    type: rss
    url: "https://papers.takara.ai/api/feed"
    category: paper

  # --- Third-party generated RSS ---
  - id: anthropic_research
    name: "Anthropic Research"
    name_zh: "Anthropic 研究"
    type: rss
    url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/refs/heads/main/feeds/anthropic/research/feed.xml"
    category: company_blog

  - id: anthropic_news
    name: "Anthropic News"
    name_zh: "Anthropic 新闻"
    type: rss
    url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/refs/heads/main/feeds/anthropic/news/feed.xml"
    category: company_blog

  - id: anthropic_engineering
    name: "Anthropic Engineering"
    name_zh: "Anthropic 工程"
    type: rss
    url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/refs/heads/main/feeds/anthropic/engineering/feed.xml"
    category: company_blog

  - id: meta_ai
    name: "Meta AI Blog"
    name_zh: "Meta AI 博客"
    type: rss
    url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/refs/heads/main/feeds/meta/ai/feed.xml"
    category: company_blog

  - id: deepmind_blog
    name: "Google DeepMind Blog"
    name_zh: "Google DeepMind 博客"
    type: rss
    url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/refs/heads/main/feeds/deepmind/blog/feed.xml"
    category: company_blog

  # --- Web scraper sources ---
  - id: deepseek_blog
    name: "DeepSeek Blog"
    name_zh: "DeepSeek 博客"
    type: scraper
    url: "https://www.deepseek.com/blog"
    category: company_blog

  - id: qwen_blog
    name: "Qwen Blog"
    name_zh: "通义千问博客"
    type: scraper
    url: "https://qwen.ai/blog"
    category: company_blog

  - id: zhipu_news
    name: "Zhipu AI"
    name_zh: "智谱 AI"
    type: scraper
    url: "https://www.zhipuai.cn/"
    category: company_blog

  - id: moonshot_blog
    name: "Moonshot AI Blog"
    name_zh: "月之暗面博客"
    type: scraper
    url: "https://platform.moonshot.cn/blog"
    category: company_blog

  - id: minimax_news
    name: "MiniMax News"
    name_zh: "MiniMax 新闻"
    type: scraper
    url: "https://www.minimaxi.com/news"
    category: company_blog

  # --- GitHub releases ---
  - id: deepseek_github
    name: "DeepSeek GitHub"
    name_zh: "DeepSeek GitHub"
    type: github_releases
    repo: "deepseek-ai"
    category: release

  - id: qwen_github
    name: "Qwen GitHub"
    name_zh: "Qwen GitHub"
    type: github_releases
    repo: "QwenLM"
    category: release

  - id: thudm_github
    name: "THUDM GitHub (ChatGLM)"
    name_zh: "THUDM GitHub (ChatGLM)"
    type: github_releases
    repo: "THUDM"
    category: release

  - id: hunyuan_github
    name: "Tencent Hunyuan GitHub"
    name_zh: "腾讯混元 GitHub"
    type: github_releases
    repo: "Tencent-Hunyuan"
    category: release

  - id: moonshot_github
    name: "Moonshot AI GitHub"
    name_zh: "Moonshot AI GitHub"
    type: github_releases
    repo: "MoonshotAI"
    category: release
```

---

## 4. Source Catalog

### 4.1 International Sources

| Source | Type | Method | Update Frequency | Priority |
|--------|------|--------|-----------------|----------|
| Anthropic Research | Blog | Third-party RSS (Olshansk) | Weekly | High |
| Anthropic News | Blog | Third-party RSS (Olshansk) | Weekly | High |
| Anthropic Engineering | Blog | Third-party RSS (Olshansk) | Weekly | High |
| OpenAI News | Blog | Official RSS | 2-5/week | High |
| Google Research | Blog | Official RSS | 3-5/week | High |
| Google DeepMind | Blog | Third-party RSS (Olshansk) | 2-3/week | High |
| Meta AI | Blog | Third-party RSS (Olshansk) | 1-2/week | High |
| Hugging Face Daily Papers | Papers | Third-party RSS | Daily | High |
| arXiv (cs.CL + cs.AI + cs.LG) | Papers | arXiv API + keyword filter | Daily | High |

### 4.2 Chinese Sources

| Source | Type | Method | Update Frequency | Priority |
|--------|------|--------|-----------------|----------|
| DeepSeek Blog | Blog | Web scraper | Monthly | High |
| Qwen Blog | Blog | Web scraper | Weekly-Monthly | High |
| Zhipu AI (GLM) | Blog | Web scraper | Monthly | Medium |
| Moonshot AI (Kimi) | Blog | Web scraper | 1-3/month | Medium |
| MiniMax | Blog | Web scraper | Monthly | Medium |
| Tencent Hunyuan | Releases | GitHub API | Low frequency | Medium |

### 4.3 GitHub Release Monitoring

| Organization | Repo | Notable Projects |
|-------------|------|-----------------|
| deepseek-ai | All repos | DeepSeek models |
| QwenLM | All repos | Qwen models |
| THUDM | All repos | ChatGLM, GLM series |
| Tencent-Hunyuan | All repos | Hunyuan models |
| MoonshotAI | All repos | Moonshot/Kimi models |

### 4.4 Adapter Types

**RSS Adapter (`rss.py`)**
- Input: RSS/Atom feed URL
- Parser: feedparser library
- Handles: title, link, published date, description/summary
- Used for: OpenAI, Google Research, Anthropic (via Olshansk), Meta AI, HF Papers

**Web Scraper Adapter (`scraper.py`)**
- Input: Blog listing page URL + CSS selectors (configured per source)
- Parser: requests + BeautifulSoup
- Handles: extracting article links, titles, dates from listing pages
- Needs per-source selector config in config.yml
- Anti-scraping considerations: reasonable delays, user-agent headers
- Used for: DeepSeek, Qwen, Zhipu, Moonshot, MiniMax

**arXiv Adapter (`arxiv.py`)**
- Input: arXiv categories + keyword list
- Parser: arXiv API (Atom feed) or arxiv Python package
- Handles: filtering by keywords against title + abstract
- Returns: title, abstract, authors, arxiv_id, pdf_url
- Used for: arXiv papers

**GitHub Releases Adapter (`github_releases.py`)**
- Input: GitHub organization name
- Parser: GitHub REST API (unauthenticated or with token for rate limits)
- Handles: listing repos, checking for new releases/tags
- Used for: Chinese company model releases

**Hugging Face Papers Adapter (`huggingface_papers.py`)**
- Input: HF papers page or third-party RSS
- Can reuse RSS adapter with the takara.ai feed
- Fallback: scrape huggingface.co/papers directly

---

## 5. AI Components

### 5.1 LLM API Configuration

All LLM calls use OpenAI-compatible API format:

```python
import openai

client = openai.OpenAI(
    base_url=config["llm"]["base_url"],
    api_key=config["llm"]["api_key"]
)
```

This allows using any compatible provider: OpenAI, DeepSeek, Qwen, local models via Ollama, etc.

### 5.2 Item Summarization

**Input:** Item title + original summary/abstract (or first few paragraphs if scraped)

**System Prompt:**

```
You are a technical content summarizer for an AI/ML researcher.
Generate a concise summary (2-3 sentences) of the following article/paper.
Focus on: what problem it addresses, the key approach or finding, and why it matters.
Output in {language}.
```

**Output:** A 2-3 sentence summary in the requested language.

**Called:** Once per new item, per language (2 calls per item for ZH + EN).

### 5.3 Daily Brief Generation

**Input:** All item summaries for the day

**System Prompt:**

```
You are an AI research analyst preparing a daily intelligence brief.

Given today's {item_count} new articles and papers from across the AI/LLM field,
create a structured daily brief that:

1. Opens with a 2-3 sentence executive summary of the day's most important developments
2. Groups items into thematic categories (e.g., "Model Architecture", "Agent Systems",
   "Alignment & Safety", "Industry News", "Open Source Releases")
3. Within each category, briefly describes what happened and why it matters
4. Highlights the top 3-5 most important items with a sentence on why they stand out

Output in {language}. Use Markdown formatting.
Keep the total brief under 1000 words.

Today's items:
{items_json}
```

**Output:** A Markdown-formatted daily brief.

**Called:** Once per day, per language (2 calls total).

---

## 6. Frontend Specification

### 6.1 Tech Stack

- **Framework:** Next.js (App Router, SSG via `generateStaticParams`)
- **Styling:** Tailwind CSS
- **i18n:** Simple context-based language switching (no i18n library needed for v1)
- **Deployment:** Vercel (auto-deploy on push)

### 6.2 Build Process

At build time, Next.js reads all JSON files from `content/` and generates static HTML pages. No runtime API calls, no server-side rendering.

```typescript
// lib/content.ts
import fs from 'fs';
import path from 'path';

export function getDailyBrief(date: string, lang: 'en' | 'zh') {
  const brief = JSON.parse(
    fs.readFileSync(`content/briefs/${date}.json`, 'utf-8')
  );
  return lang === 'zh' ? brief.brief_zh : brief.brief_en;
}

export function getItems(date: string) {
  return JSON.parse(
    fs.readFileSync(`content/items/${date}.json`, 'utf-8')
  );
}

export function getAvailableDates(): string[] {
  return fs.readdirSync('content/briefs')
    .map(f => f.replace('.json', ''))
    .sort()
    .reverse();
}
```

### 6.3 Component Breakdown

| Component | Responsibility |
|-----------|---------------|
| `DateSelector` | Calendar or dropdown to pick a date, defaults to latest available date |
| `LanguageToggle` | Switch between ZH and EN, persisted in localStorage |
| `DailyBrief` | Renders the AI-generated daily brief in Markdown |
| `ItemCard` | Displays one item: source badge, title, summary, link |
| `SourceFilter` | Filter items by source or category |
| `Layout` | Navigation, header, footer, language context provider |

### 6.4 Responsive Design

- Desktop: two-column layout (brief on left, item list on right) or single column with brief on top
- Mobile: single column, brief first, items below
- Reading-optimized typography

---

## 7. GitHub Actions Workflow

### 7.1 Workflow Definition

```yaml
name: Daily Ingest

on:
  schedule:
    - cron: '0 8 * * *'    # 8:00 UTC daily
  workflow_dispatch:         # Manual trigger

jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install -r ingest/requirements.txt

      - name: Run ingest pipeline
        env:
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: python ingest/main.py

      - name: Commit new content
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add content/
          git diff --cached --quiet || git commit -m "Daily ingest: $(date -u +%Y-%m-%d)"
          git push

  deploy:
    needs: ingest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build Next.js
        working-directory: web
        run: |
          npm ci
          npm run build

      # Deployment step depends on hosting choice
      # Option A: Vercel (auto-deploys on push, no step needed)
      # Option B: GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: web/out
```

### 7.2 Error Handling

- Individual source failures should not block the entire pipeline
- Failed sources are logged and skipped
- LLM API failures: retry up to 3 times with exponential backoff
- If all sources fail, the workflow should still commit a brief noting "no new content today"
- GitHub Actions notifications on workflow failure

---

## 8. Implementation Phases

### Phase 1: Foundation (MVP)

- [ ] Set up repository structure
- [ ] Implement RSS adapter (covers ~60% of sources)
- [ ] Implement basic web scraper adapter (1-2 Chinese sources)
- [ ] Implement LLM summarization (single language first)
- [ ] Generate daily brief
- [ ] Basic Next.js frontend: date selector + brief + item list
- [ ] GitHub Actions workflow
- [ ] Deploy to Vercel

### Phase 2: Full Coverage

- [ ] Add all scraper sources (remaining Chinese company blogs)
- [ ] Add arXiv adapter with keyword filtering
- [ ] Add GitHub releases adapter
- [ ] Add bilingual support (ZH + EN summaries and briefs)
- [ ] Add language toggle to frontend
- [ ] Add source filter to frontend

### Phase 3: Polish

- [ ] Improve scraper resilience (error handling, anti-scraping)
- [ ] Add Archive page
- [ ] Mobile UI optimization
- [ ] Daily brief quality tuning (prompt engineering)
- [ ] Cost monitoring for LLM API usage

### Phase 4: Future Enhancements (out of scope for v1)

- [ ] User state: bookmarks, read status, notes (requires backend)
- [ ] Dynamic interest profile based on reading behavior
- [ ] Email/Telegram/WeChat daily brief delivery
- [ ] Full-text reading within the site
- [ ] Search across historical content

---

## 9. Appendix

### 9.1 Key Dependencies (Python)

```
feedparser        # RSS/Atom parsing
requests          # HTTP requests
beautifulsoup4    # HTML parsing
openai            # LLM API client (OpenAI-compatible)
pyyaml            # Config file parsing
arxiv             # arXiv API client (optional, can use feedparser)
```

### 9.2 Key Dependencies (Frontend)

```
next              # Framework
tailwindcss       # Styling
react-markdown    # Render AI-generated Markdown briefs
date-fns          # Date utilities
```

### 9.3 Cost Estimates

Assuming ~30-50 new items per day, using a cost-effective model (e.g., GPT-4o-mini, DeepSeek):

| Operation | Calls/day | Est. tokens/call | Est. daily cost |
|-----------|-----------|-------------------|-----------------|
| Item summary (x2 languages) | 60-100 | ~500 | < $0.05 |
| Daily brief (x2 languages) | 2 | ~3000 | < $0.02 |
| **Total** | | | **< $0.10/day** |

GitHub Actions: ~5 min/day of compute, well within free tier (2000 min/month).

### 9.4 Olshansk RSS Feed URLs

Reference repository: https://github.com/Olshansk/rss-feeds

Base URL pattern: `https://raw.githubusercontent.com/Olshansk/rss-feeds/refs/heads/main/feeds/{company}/{feed}/feed.xml`

Available feeds relevant to this project:
- `anthropic/research`
- `anthropic/news`
- `anthropic/engineering`
- `meta/ai`
- `deepmind/blog`
- `mistral/news` (bonus source)
- `groq/news` (bonus source)
