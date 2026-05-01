/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ---------- i18n ----------
const I18N = {
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
    weekday: ['日','一','二','三','四','五','六'],
    months: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
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
    today_picks: 'Editor’s Picks',
    items_title: 'Today’s Items',
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
    weekday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    today_label: 'Back to today',
    pick_label: 'Pick',
    no_top_picks: 'No editor’s picks today',
  }
};

function t(lang, key, vars) {
  let s = I18N[lang][key] || key;
  if (vars) for (const k in vars) s = s.replace('{'+k+'}', vars[k]);
  return s;
}

function fmtDate(date, lang) {
  const d = new Date(date + 'T00:00:00');
  const wd = I18N[lang].weekday[d.getDay()];
  const mo = I18N[lang].months[d.getMonth()];
  if (lang === 'zh') {
    return `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日 · 周${wd}`;
  }
  return `${wd}, ${mo} ${d.getDate()}, ${d.getFullYear()}`;
}
function fmtDateShort(date, lang) {
  const d = new Date(date + 'T00:00:00');
  const mo = I18N[lang].months[d.getMonth()];
  if (lang === 'zh') return `${d.getMonth()+1} 月 ${d.getDate()} 日`;
  return `${mo.slice(0,3)} ${d.getDate()}`;
}
function fmtTime(iso, lang) {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2,'0');
  const mm = String(d.getUTCMinutes()).padStart(2,'0');
  return `${hh}:${mm} UTC`;
}

// ---------- Source monogram circle ----------
function MonoCircle({ source, size }) {
  const s = window.AGG_DATA.SOURCES[source];
  if (!s) return null;
  const cls = 'mono-circle' + (size ? ' ' + size : '') + (s.mono.length > 1 ? ' text-mono' : '');
  return (
    <div className={cls} style={{ background: s.tone }} aria-label={s.name}>
      {s.mono}
    </div>
  );
}

// ---------- Date Picker ----------
function DatePicker({ date, available, onPick, lang }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const d = new Date(date + 'T00:00:00');
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const availSet = useMemo(() => new Set(available), [available]);
  const monthLabel = `${I18N[lang].months[view.m]} ${view.y}`;

  // build cells
  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${view.y}-${String(view.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ d, iso, has: availSet.has(iso) });
  }

  return (
    <div className="datepicker-wrap" ref={ref}>
      <button className={'date-trigger' + (open ? ' open' : '')} onClick={() => setOpen(o => !o)}>
        <span style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)'}}>
          {lang === 'zh' ? '查阅日期' : 'Issue date'}
        </span>
        <span style={{fontFamily:'var(--serif)', fontWeight:600, fontSize:15, letterSpacing:'-0.01em'}}>
          {fmtDate(date, lang)}
        </span>
        <span className="arr">▾</span>
      </button>
      {open && (
        <div className="date-popover" onClick={e => e.stopPropagation()}>
          <div className="date-popover-head">
            <button onClick={() => setView(v => v.m === 0 ? {y: v.y-1, m: 11} : {y: v.y, m: v.m-1})}>‹</button>
            <span>{monthLabel}</span>
            <button onClick={() => setView(v => v.m === 11 ? {y: v.y+1, m: 0} : {y: v.y, m: v.m+1})}>›</button>
          </div>
          <div className="date-grid">
            {I18N[lang].weekday.map(d => <div key={d} className="dow">{d}</div>)}
            {cells.map((c, i) => {
              if (!c) return <div key={i} className="date-cell empty" />;
              const isSelected = c.iso === date;
              const cls = 'date-cell' + (c.has ? ' has' : ' disabled') + (isSelected ? ' selected' : '');
              return (
                <div
                  key={c.iso}
                  className={cls}
                  onClick={() => { if (c.has) { onPick(c.iso); setOpen(false); } }}
                >{c.d}</div>
              );
            })}
          </div>
          <div style={{borderTop:'1px solid var(--rule)', paddingTop:12, marginTop:12, display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted)'}}>
            <span><span style={{display:'inline-block',width:5,height:5,borderRadius:'50%',background:'var(--accent)',marginRight:6, verticalAlign:2}}/>{lang === 'zh' ? '有内容' : 'Has content'}</span>
            <button style={{border:0, background:'transparent', font:'inherit', color:'var(--ink-2)', cursor:'pointer', letterSpacing:'0.14em'}} onClick={() => { onPick(window.AGG_DATA.AVAILABLE_DATES[0]); setOpen(false); }}>
              {t(lang, 'today_label')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Masthead ----------
function Masthead({ lang, setLang, route, setRoute, date, setDate }) {
  return (
    <header className="masthead">
      <div className="container">
        <div className="mast-row">
          <div className="mast-left">
            <div className="mast-title">Daily<span className="amp"> </span>Nuts<span style={{fontStyle:'normal', color:'var(--accent)', fontWeight:400}}>.</span></div>
            <div className="mast-tag">AI 学习每日简报</div>
          </div>
          <nav className="mast-nav">
            <a className={route === 'today' ? 'active' : ''} onClick={() => setRoute('today')}>{t(lang, 'nav_today')}</a>
            <a className={route === 'archive' ? 'active' : ''} onClick={() => setRoute('archive')}>{t(lang, 'nav_archive')}</a>
            <div className="lang-toggle">
              <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>中文</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

// ---------- Sub-bar (issue meta) ----------
function SubBar({ lang, date, items, route, setDate }) {
  const issueNum = window.AGG_DATA.AVAILABLE_DATES.length - window.AGG_DATA.AVAILABLE_DATES.indexOf(date);
  return (
    <div className="subbar">
      <div className="container" style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
        <div className="vol">
          <span className="live-dot" />
          {route === 'archive'
            ? (lang === 'zh' ? '档案 · 共 ' + window.AGG_DATA.AVAILABLE_DATES.length + ' 期' : 'Archive · ' + window.AGG_DATA.AVAILABLE_DATES.length + ' issues')
            : t(lang, 'vol', { n: issueNum })}
          {route !== 'archive' && <span style={{margin:'0 14px', color:'var(--rule)'}}>/</span>}
          {route !== 'archive' && <span style={{textTransform:'none', letterSpacing:'0.04em', color:'var(--muted)'}}>{items.length} {lang === 'zh' ? '项已收录' : 'items curated'}</span>}
        </div>
        {route !== 'archive' && (
          <DatePicker date={date} available={window.AGG_DATA.AVAILABLE_DATES} onPick={setDate} lang={lang} />
        )}
      </div>
    </div>
  );
}

// ---------- Hero / Daily Brief ----------
function Hero({ lang, date, brief, items, onOpen }) {
  const headline = lang === 'zh' ? brief.headline_zh : brief.headline_en;
  const lede = lang === 'zh' ? brief.lede_zh : brief.lede_en;
  const sections = lang === 'zh' ? brief.sections_zh : brief.sections_en;
  const picks = (brief.top_picks || []).map(id => items.find(i => i.id === id)).filter(Boolean);

  // split headline into halves to italicize the second half for editorial feel
  const words = headline.split(lang === 'zh' ? '，' : ';');
  const renderHeadline = words.length > 1
    ? <>{words[0]}{lang === 'zh' ? '，' : ';'} <em>{words.slice(1).join(lang === 'zh' ? '，' : ';').trim()}</em></>
    : headline;

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-kicker">
          <span className="dash" />
          {t(lang, 'daily_kicker')}
          <span style={{color:'var(--muted)', letterSpacing:'0.16em'}}>· {fmtDate(date, lang)}</span>
        </div>
        <h1 className="hero-headline">{renderHeadline}</h1>
        <div className="hero-byline">
          <span>{lang === 'zh' ? '由 AI 自动整理' : 'AI-summarised'}</span>
          <span className="sep">·</span>
          <span>{items.length} {lang === 'zh' ? '项条目' : 'items'}</span>
          <span className="sep">·</span>
          <span>{lang === 'zh' ? '约 4 分钟阅读' : 'About a 4-min read'}</span>
        </div>

        <div className="hero-body">
          <p className="lede">{lede}</p>
          <div className="brief-sections">
            {sections.length > 0 ? sections.map((s, i) => (
              <div key={i} className="brief-section">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            )) : (
              <div className="brief-section">
                <h3>{lang === 'zh' ? '本期无分主题展开' : 'No themed breakdown this issue'}</h3>
                <p style={{color:'var(--muted)'}}>{lang === 'zh' ? '请向下查看条目列表。' : 'Browse the items below.'}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

// ---------- Item row ----------
function ItemRow({ item, lang, onOpen }) {
  const src = window.AGG_DATA.SOURCES[item.source];
  const cats = lang === 'zh' ? item.categories_zh : item.categories_en;
  return (
    <li className="item" onClick={() => onOpen(item)}>
      <div className="item-source">
        <MonoCircle source={item.source} />
        <div className="item-source-name">{lang === 'zh' ? src.name_zh : src.name}</div>
      </div>
      <div className="item-body">
        <div className="item-kicker">
          <span>{lang === 'zh' ? src.kind_label_zh : src.kind_label_en}</span>
          <span style={{color:'var(--rule)'}}>·</span>
          <span>{fmtDateShort(item.published_at.slice(0,10), lang)}</span>
        </div>
        <h2 className="item-title">{lang === 'zh' ? item.title_zh : item.title_en}</h2>
        <p className="item-summary">{lang === 'zh' ? item.summary_zh : item.summary_en}</p>
        <div className="item-tags">
          {cats.map(c => <span key={c} className="tag">{c}</span>)}
        </div>
      </div>
      <div className="item-meta-col">
        <div>{fmtTime(item.published_at, lang)}</div>
        <div style={{color:'var(--muted-2)'}}>{item.original_language === 'zh' ? 'ZH' : 'EN'} → {lang.toUpperCase()}</div>
        <div className="read">{t(lang, 'read_more')} →</div>
      </div>
    </li>
  );
}

// Theme definitions for grouping today's items
const THEMES = [
  { id: 'interp',  zh: '可解释性与对齐',  en: 'Interpretability & Alignment' },
  { id: 'arch',    zh: '模型架构与记忆',  en: 'Architecture & Memory' },
  { id: 'agent',   zh: 'Agent 工程',       en: 'Agent Engineering' },
  { id: 'release', zh: '新模型发布',       en: 'Model Releases' },
  { id: 'evals',   zh: '评估与基准',       en: 'Evals & Benchmarks' },
  { id: 'apps',    zh: '应用与产品',       en: 'Applications & Product' },
  { id: 'other',   zh: '其他',             en: 'Other' },
];

// ---------- Items section ----------
function ItemsSection({ lang, items, onOpen }) {
  const grouped = useMemo(() => {
    const buckets = new Map(THEMES.map(th => [th.id, []]));
    for (const it of items) {
      const id = it.theme && buckets.has(it.theme) ? it.theme : 'other';
      buckets.get(id).push(it);
    }
    return THEMES.map(th => ({ ...th, items: buckets.get(th.id) })).filter(th => th.items.length > 0);
  }, [items]);

  return (
    <section className="items-section">
      <div className="container">
        <div className="items-head">
          <h2 className="items-title">
            {t(lang, 'items_title')}
            <span className="count">{t(lang, 'items_count', { n: items.length })}</span>
          </h2>
          <div className="items-filter" style={{fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)'}}>
            {lang === 'zh' ? '按主题归类 · ' : 'Grouped by theme · '}{grouped.length} {lang === 'zh' ? '类' : 'sections'}
          </div>
        </div>
        {grouped.map((th, gi) => (
          <div key={th.id} style={{marginTop: gi === 0 ? 8 : 48}}>
            <div style={{display:'flex', alignItems:'baseline', gap:16, padding:'18px 0 10px', borderBottom:'1px solid var(--rule-soft)'}}>
              <span style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'var(--accent)', letterSpacing:'0.04em'}}>§ 0{gi+1}</span>
              <h3 style={{fontFamily:'var(--serif)', fontWeight:600, fontSize:22, letterSpacing:'-0.014em', margin:0, color:'var(--ink)'}}>
                {lang === 'zh' ? th.zh : th.en}
              </h3>
              <span style={{fontFamily:'var(--mono)', fontSize:10.5, color:'var(--muted)', letterSpacing:'0.14em', marginLeft:'auto'}}>
                {th.items.length} {lang === 'zh' ? '项' : 'items'}
              </span>
            </div>
            <ul className="item-list">
              {th.items.map(it => <ItemRow key={it.id} item={it} lang={lang} onOpen={onOpen} />)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Archive page ----------
function ArchivePage({ lang, onOpenDate }) {
  const dates = window.AGG_DATA.AVAILABLE_DATES;
  const [filterDate, setFilterDate] = useState(null);
  const filtered = filterDate ? dates.filter(d => d === filterDate) : dates;

  return (
    <section className="archive page">
      <div className="container">
        <div className="archive-head">
          <div>
            <h1 className="archive-title">{lang === 'zh' ? <>历史<em>档案</em></> : <>The <em>Archive</em></>}</h1>
          </div>
          <div className="archive-sub">{t(lang, 'archive_sub')}</div>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:18, padding:'18px 0', borderBottom:'1px solid var(--rule)', flexWrap:'wrap'}}>
          <span style={{fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)'}}>
            {lang === 'zh' ? '按日期筛选' : 'Filter by date'}
          </span>
          <div style={{display:'flex', gap:18, alignItems:'center'}}>
            {filterDate && (
              <button
                onClick={() => setFilterDate(null)}
                style={{border:0, background:'transparent', cursor:'pointer', font:'inherit', fontFamily:'var(--sans)', fontSize:12, color:'var(--accent)', letterSpacing:'0.06em'}}
              >
                {lang === 'zh' ? '清除筛选 ✕' : 'Clear ✕'}
              </button>
            )}
            <DatePicker
              date={filterDate || dates[0]}
              available={dates}
              onPick={(d) => setFilterDate(d)}
              lang={lang}
            />
          </div>
        </div>
        <ul className="archive-list">
          {filtered.map(d => {
            const meta = window.AGG_DATA.ARCHIVE_META[d] || { count: window.AGG_DATA.ITEMS[d]?.length || 0, headline_zh: '', headline_en: '' };
            const dateObj = new Date(d + 'T00:00:00');
            return (
              <li key={d} className="archive-row" onClick={() => onOpenDate(d)}>
                <div className="archive-date">
                  {fmtDateShort(d, lang)}
                  <span className="dow">{I18N[lang].weekday[dateObj.getDay()]}</span>
                </div>
                <h3 className="archive-headline">{lang === 'zh' ? meta.headline_zh : meta.headline_en}</h3>
                <div className="archive-count">
                  <strong>{meta.count}</strong>
                  {t(lang, 'archive_count_label')}
                </div>
                <div className="archive-go">{t(lang, 'archive_go')}</div>
              </li>
            );
          })}
        </ul>
        {filtered.length === 0 && (
          <div style={{padding:'48px 0', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--muted)'}}>
            {lang === 'zh' ? '该日期暂无内容。' : 'No issue on this date.'}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- Detail Drawer ----------
function Drawer({ item, lang, onClose }) {
  const open = !!item;
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // keep last item visible during exit animation
  const [shown, setShown] = useState(item);
  useEffect(() => { if (item) setShown(item); }, [item]);
  const display = item || shown;

  return (
    <>
      <div className={'drawer-scrim' + (open ? ' open' : '')} onClick={onClose} />
      <aside className={'drawer' + (open ? ' open' : '')}>
        {display && (() => {
          const src = window.AGG_DATA.SOURCES[display.source];
          const cats = lang === 'zh' ? display.categories_zh : display.categories_en;
          return (
            <>
              <div className="drawer-head">
                <span>№ {display.id}</span>
                <button className="drawer-close" onClick={onClose}>{lang === 'zh' ? '关闭 ✕' : 'Close ✕'}</button>
              </div>
              <div className="drawer-body">
                <div className="drawer-source">
                  <MonoCircle source={display.source} size="small" />
                  <div>
                    <div className="drawer-source-name">{lang === 'zh' ? src.name_zh : src.name}</div>
                    <div className="drawer-source-kind">{lang === 'zh' ? src.kind_label_zh : src.kind_label_en} · {fmtDateShort(display.published_at.slice(0,10), lang)}</div>
                  </div>
                </div>
                <h1 className="drawer-title">{lang === 'zh' ? display.title_zh : display.title_en}</h1>
                <p className="drawer-orig">“{lang === 'zh' ? display.title_en : display.title_zh}”</p>
                <div className="drawer-section-label">{t(lang, 'drawer_kind')}</div>
                <p className="drawer-summary">{lang === 'zh' ? display.summary_zh : display.summary_en}</p>

                <div className="drawer-meta-grid">
                  <div className="drawer-meta-cell">
                    <span className="label">{t(lang, 'drawer_published')}</span>
                    <span className="value">{fmtDate(display.published_at.slice(0,10), lang)}</span>
                  </div>
                  <div className="drawer-meta-cell">
                    <span className="label">{t(lang, 'drawer_source')}</span>
                    <span className="value">{lang === 'zh' ? src.name_zh : src.name}</span>
                  </div>
                  <div className="drawer-meta-cell">
                    <span className="label">{t(lang, 'drawer_categories')}</span>
                    <span className="value">{cats.join(' · ')}</span>
                  </div>
                  <div className="drawer-meta-cell">
                    <span className="label">{t(lang, 'drawer_lang')}</span>
                    <span className="value">{(display.original_language || 'en').toUpperCase()}</span>
                  </div>
                </div>

                <button className="drawer-link">
                  <span>{t(lang, 'drawer_open')}</span>
                  <span className="arr">↗</span>
                </button>
              </div>
            </>
          );
        })()}
      </aside>
    </>
  );
}

// ---------- App ----------
function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'zh');
  const [route, setRoute] = useState('today');
  const [navContext, setNavContext] = useState('today'); // which nav item to highlight
  const [date, setDate] = useState(window.AGG_DATA.AVAILABLE_DATES[0]);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => { localStorage.setItem('lang', lang); document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; }, [lang]);

  const items = window.AGG_DATA.ITEMS[date] || [];
  const brief = window.AGG_DATA.BRIEFS[date];

  function pickDate(d, fromArchive) {
    setDate(d);
    setRoute('today');
    if (!fromArchive) setNavContext('today');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function goRoute(r) { setRoute(r); setNavContext(r); }

  return (
    <div className="shell">
      <Masthead lang={lang} setLang={setLang} route={navContext} setRoute={goRoute} date={date} setDate={pickDate} />
      <SubBar lang={lang} date={date} items={items} route={route} setDate={pickDate} />

      {route === 'today' ? (
        <main className="page" key={'today-'+date+'-'+lang} data-screen-label="01 Today">
          <Hero lang={lang} date={date} brief={brief} items={items} onOpen={setOpenItem} />
          <ItemsSection lang={lang} items={items} onOpen={setOpenItem} />
        </main>
      ) : (
        <main key={'archive-'+lang} data-screen-label="02 Archive">
          <ArchivePage lang={lang} onOpenDate={(d) => pickDate(d, true)} />
        </main>
      )}

      <footer className="foot">
        <div className="container">
          <div className="foot-row">
            <span>{t(lang, 'foot_left')}</span>
            <span>{t(lang, 'foot_right')}</span>
          </div>
        </div>
      </footer>

      <Drawer item={openItem} lang={lang} onClose={() => setOpenItem(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
