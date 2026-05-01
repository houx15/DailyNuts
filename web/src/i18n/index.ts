export type Lang = 'zh' | 'en'

export interface I18nStrings {
  masthead_tag: string
  nav_today: string
  nav_archive: string
  nav_about: string
  vol: string
  issue_date: string
  daily_kicker: string
  read_more: string
  today_picks: string
  items_title: string
  items_count: string
  filter_all: string
  filter_blog: string
  filter_paper: string
  filter_release: string
  archive_title: string
  archive_sub: string
  archive_count_label: string
  archive_go: string
  drawer_kind: string
  drawer_published: string
  drawer_source: string
  drawer_categories: string
  drawer_lang: string
  drawer_open: string
  foot_left: string
  foot_right: string
  weekday: string[]
  months: string[]
  today_label: string
  pick_label: string
  no_top_picks: string
}

export const I18N: Record<Lang, I18nStrings> = {
  zh: {
    masthead_tag: 'AI 学习每日简报',
    nav_today: '今日',
    nav_archive: '档案',
    nav_about: '关于',
    vol: '第 {n} 期',
    issue_date: '{date}',
    daily_kicker: '今日简报',
    read_more: '阅读全文',
    today_picks: '今日精选 · 编辑推荐',
    items_title: '今日条目',
    items_count: '{n} 项',
    filter_all: '全部',
    filter_blog: '博客',
    filter_paper: '论文',
    filter_release: '发布',
    archive_title: '历史档案',
    archive_sub: '过去 30 天的每日简报',
    archive_count_label: '条',
    archive_go: '查看 →',
    drawer_kind: '原文摘要',
    drawer_published: '发布时间',
    drawer_source: '来源',
    drawer_categories: '分类',
    drawer_lang: '原文语言',
    drawer_open: '打开原文',
    foot_left: '由 GitHub Actions 每日自动汇总',
    foot_right: '基于 Next.js · 部署于 Vercel',
    weekday: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    today_label: '回到今日',
    pick_label: '精选',
    no_top_picks: '今日无重点推荐',
  },
  en: {
    masthead_tag: 'AI Learning · Daily Brief',
    nav_today: 'Today',
    nav_archive: 'Archive',
    nav_about: 'About',
    vol: 'Issue No. {n}',
    issue_date: '{date}',
    daily_kicker: 'The Daily Brief',
    read_more: 'Read in full',
    today_picks: 'Editor\u2019s Picks',
    items_title: 'Today\u2019s Items',
    items_count: '{n} items',
    filter_all: 'All',
    filter_blog: 'Blogs',
    filter_paper: 'Papers',
    filter_release: 'Releases',
    archive_title: 'Archive',
    archive_sub: 'Daily briefs from the past 30 days',
    archive_count_label: 'items',
    archive_go: 'View →',
    drawer_kind: 'Summary',
    drawer_published: 'Published',
    drawer_source: 'Source',
    drawer_categories: 'Categories',
    drawer_lang: 'Original lang.',
    drawer_open: 'Open original',
    foot_left: 'Auto-curated daily by GitHub Actions',
    foot_right: 'Built with Next.js · Deployed on Vercel',
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    today_label: 'Back to today',
    pick_label: 'Pick',
    no_top_picks: 'No editor\u2019s picks today',
  },
}

export function t(lang: Lang, key: keyof I18nStrings, vars?: Record<string, string>): string {
  const value = I18N[lang][key]
  if (typeof value !== 'string') {
    return key as string
  }
  let result = value
  if (vars) {
    for (const k in vars) {
      result = result.replace('{' + k + '}', vars[k])
    }
  }
  return result
}

export function fmtDate(date: string, lang: Lang): string {
  const d = new Date(date + 'T00:00:00')
  const wd = I18N[lang].weekday[d.getDay()]
  const mo = I18N[lang].months[d.getMonth()]
  if (lang === 'zh') {
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${wd}`
  }
  return `${wd}, ${mo} ${d.getDate()}, ${d.getFullYear()}`
}

export function fmtDateShort(date: string, lang: Lang): string {
  const d = new Date(date + 'T00:00:00')
  const mo = I18N[lang].months[d.getMonth()]
  if (lang === 'zh') return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
  return `${mo.slice(0, 3)} ${d.getDate()}`
}

export function fmtTime(iso: string, lang: Lang): string {
  const d = new Date(iso)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm} UTC`
}
