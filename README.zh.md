# DailyNuts — AI 学习聚合器

[🇺🇸 English](README.md)

> AI 驱动的每日 LLM/Agent 研究和新闻摘要。静态网站，中英双语，由 GitHub Actions 自动策展。

## 项目概览

DailyNuts 自动收集各大 AI 公司和研究源的技术内容，生成双语摘要，并以静态网站形式发布每日精选简报。每天上午 08:00 UTC，流水线自动运行，为您带来 LLM/Agent 领域的最新研究和行业动态。

## 功能特性

- **每日简报** — AI 生成的按主题分类的当日内容摘要
- **中英双语** — 所有内容均提供中文和英文版本
- **多源聚合** — RSS 订阅、arXiv 论文、GitHub 发布、网页抓取
- **纯静态网站** — 运行时无 API 调用、无数据库、无后端服务
- **日期导航** — 通过日历选择器浏览历史每日简报
- **来源筛选** — 按类别筛选（博客、论文、发布）
- **移动端适配** — 针对桌面和移动阅读优化

## 架构

```
GitHub Actions (每日定时 @ 08:00 UTC)
    ├── Python 采集流水线 (ingest/)
    │   ├── 适配器: RSS、网页抓取、arXiv、GitHub 发布
    │   ├── summarizer.py — LLM API 调用 (OpenAI 兼容)
    │   └── brief_generator.py — 每日简报生成
    ├── content/ — 提交到仓库的 JSON 数据
    │   ├── items/YYYY-MM-DD.json
    │   ├── briefs/YYYY-MM-DD.json
    │   └── sources.json
    └── Next.js 静态生成 (web/)
        ├── App Router，静态导出
        ├── 构建时读取 content/ JSON
        └── 部署至 Vercel
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16+, Tailwind CSS, TypeScript |
| 流水线 | Python 3.12, feedparser, requests, BeautifulSoup |
| 部署 | Vercel (前端), GitHub Actions (流水线) |
| 内容 | 静态 JSON 文件，版本控制 |

## 内容源

### 正常工作

| 来源 | 类型 |
|------|------|
| OpenAI 新闻 | RSS |
| Hugging Face 论文 | RSS |
| Anthropic 研究 | RSS (Olshansk) |
| Anthropic 新闻 | RSS (Olshansk) |
| Anthropic 工程 | RSS (Olshansk) |
| Meta AI 博客 | RSS (Olshansk) |
| arXiv cs.CL/AI/LG | API |
| 月之暗面博客 | 网页抓取 |

### 已禁用

| 来源 | 类型 | 原因 |
|------|------|------|
| Google Research | RSS | 区域超时 |
| DeepSeek 博客 | 网页抓取 | JS 渲染的单页应用 |
| Qwen 博客 | 网页抓取 | JS 渲染的单页应用 |
| 智谱 AI | 网页抓取 | JS 渲染的单页应用 |
| MiniMax 新闻 | 网页抓取 | JS 渲染的单页应用 |

### GitHub 发布

需要配置 `GITHUB_TOKEN` 密钥以突破 API 速率限制。当前配置：DeepSeek、Qwen、THUDM、腾讯混元、月之暗面。

## 本地开发

### 前端

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # 静态导出
npm test         # 运行 Jest 测试
```

### Python 流水线

```bash
cd ingest
pip install -r requirements.txt
python main.py   # 手动运行采集
```

### 环境变量

```bash
LLM_API_KEY      # 摘要/简报生成 (OpenAI 兼容接口)
GITHUB_TOKEN     # GitHub 发布适配器速率限制
```

## 项目结构

```
DailyNuts/
├── .github/workflows/     # GitHub Actions
├── docs/                  # SPEC.md 和设计资源
├── ingest/                # Python 采集流水线
│   ├── adapters/          # RSS、网页抓取、arXiv、GitHub
│   ├── config.yml         # 来源配置
│   ├── main.py            # 流水线入口
│   └── test_adapters.py   # 单元测试
├── web/                   # Next.js 前端
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # React 组件
│   │   ├── i18n/          # 双语字符串
│   │   └── lib/           # 内容工具
│   └── package.json
└── content/               # 生成的 JSON 数据
    ├── items/             # 每日条目
    ├── briefs/            # 每日简报
    └── sources.json       # 来源元数据
```

## 部署

### 推荐方案：Vercel

1. 将此仓库导入 [Vercel](https://vercel.com) — 自动识别 Next.js 项目
2. 无需配置环境变量（内容 JSON 存放在仓库中）
3. 完成。每次推送至 `main` 分支即自动重建

**自动触发流程：**

```
GitHub Actions（每日 08:00 UTC）
    → 采集内容，提交并推送至 main 分支
    → Vercel 检测到推送 → 自动使用最新内容重建网站
```

无需人工干预——流水线和部署完全自动化运行。

### 替代方案：GitHub Pages

如需零成本托管，`daily-ingest.yml` 中的 `deploy` 任务可在每次采集完成后自动发布到 GitHub Pages。

在仓库 Settings → Pages → Source 中选择 "Deploy from a branch"，分支选择 `gh-pages`（根目录）。
网站将部署在 `https://houx15.github.io/DailyNuts/`。

首次部署步骤：
1. 进入仓库 Settings → Secrets and variables → Actions，添加密钥：
   - `LLM_API_KEY` — OpenAI 兼容的 API 密钥，用于 LLM 摘要生成
   - `GITHUB_TOKEN` — 已通过 `${{ secrets.GITHUB_TOKEN }}` 自动提供
2. 进入 Actions 标签页 → Daily Ingest → Run workflow 手动触发首次部署

## 许可

MIT 许可证

---

为 AI 学习社区而构建 ❤️
