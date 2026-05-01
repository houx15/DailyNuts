import { render, screen } from '@testing-library/react'
import { ItemsSection } from './ItemsSection'
import { Item, SourcesData } from '@/lib/content'

const mockSources: SourcesData = {
  openai_news: {
    mono: 'O',
    tone: '#1F8F6B',
    name: 'OpenAI News',
    name_zh: 'OpenAI 新闻',
    kind: 'company_blog',
    kind_label_en: 'News',
    kind_label_zh: '新闻',
  },
}

const mockItems: Item[] = [
  {
    id: 'm1',
    source: 'openai_news',
    theme: 'agent',
    title_zh: 'Agent 测试',
    title_en: 'Agent Test',
    summary_zh: '摘要 1',
    summary_en: 'Summary 1',
    published_at: '2026-05-01T10:00:00Z',
    categories_zh: ['Agent'],
    categories_en: ['Agents'],
    url: 'https://example.com',
  },
  {
    id: 'm2',
    source: 'openai_news',
    theme: 'arch',
    title_zh: '架构测试',
    title_en: 'Arch Test',
    summary_zh: '摘要 2',
    summary_en: 'Summary 2',
    published_at: '2026-05-01T11:00:00Z',
    categories_zh: ['架构'],
    categories_en: ['Architecture'],
    url: 'https://example.com',
  },
]

describe('ItemsSection', () => {
  const defaultProps = {
    lang: 'zh' as const,
    items: mockItems,
    sources: mockSources,
    onOpen: jest.fn(),
  }

  it('groups items by theme', () => {
    render(<ItemsSection {...defaultProps} />)
    expect(screen.getByText('Agent 工程')).toBeInTheDocument()
    expect(screen.getByText('模型架构与记忆')).toBeInTheDocument()
  })

  it('filters out empty themes', () => {
    render(<ItemsSection {...defaultProps} />)
    const sections = screen.getAllByText(/^(Agent 工程|模型架构与记忆|新模型发布|评估与基准|应用与产品|可解释性与对齐|其他)$/)
    expect(sections).toHaveLength(2)
  })

  it('renders section titles in correct language', () => {
    render(<ItemsSection {...defaultProps} lang="en" />)
    expect(screen.getByText('Agent Engineering')).toBeInTheDocument()
    expect(screen.getByText('Architecture & Memory')).toBeInTheDocument()
  })

  it('renders items within sections', () => {
    render(<ItemsSection {...defaultProps} />)
    expect(screen.getByText('Agent 测试')).toBeInTheDocument()
    expect(screen.getByText('架构测试')).toBeInTheDocument()
  })

  it('displays item count in header', () => {
    render(<ItemsSection {...defaultProps} />)
    expect(screen.getByText('2 项')).toBeInTheDocument()
  })
})
