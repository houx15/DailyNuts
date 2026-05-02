import { render, screen, fireEvent } from '@testing-library/react'
import { SourceFilter } from './SourceFilter'
import { Item } from '@/lib/content'

const mockItems: Item[] = [
  {
    id: 'i1',
    source: 'openai_news',
    theme: 'agent',
    title_zh: '标题1',
    title_en: 'Title 1',
    summary_zh: '摘要1',
    summary_en: 'Summary 1',
    published_at: '2026-05-01T10:00:00Z',
    categories_zh: ['测试'],
    categories_en: ['Test'],
    url: 'https://example.com/1',
  },
  {
    id: 'i2',
    source: 'arxiv_cs_cl',
    theme: 'paper',
    title_zh: '标题2',
    title_en: 'Title 2',
    summary_zh: '摘要2',
    summary_en: 'Summary 2',
    published_at: '2026-05-01T11:00:00Z',
    categories_zh: ['论文'],
    categories_en: ['Paper'],
    url: 'https://example.com/2',
  },
]

const mockSources = {
  openai_news: { name: 'OpenAI', name_zh: 'OpenAI', kind: 'company_blog', kind_label_en: 'Blog', kind_label_zh: '博客', tone: 'blue', mono: 'OA' },
  arxiv_cs_cl: { name: 'arXiv', name_zh: 'arXiv', kind: 'paper', kind_label_en: 'Paper', kind_label_zh: '论文', tone: 'orange', mono: 'ar' },
}

describe('SourceFilter', () => {
  const mockOnFilterChange = jest.fn()

  const defaultProps = {
    lang: 'zh' as const,
    items: mockItems,
    sources: mockSources,
    onFilterChange: mockOnFilterChange,
  }

  beforeEach(() => {
    mockOnFilterChange.mockClear()
  })

  it('renders filter buttons', () => {
    render(<SourceFilter {...defaultProps} />)
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText('博客')).toBeInTheDocument()
    expect(screen.getByText('论文')).toBeInTheDocument()
  })

  it('renders filter buttons in English', () => {
    render(<SourceFilter {...defaultProps} lang="en" />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Blogs')).toBeInTheDocument()
    expect(screen.getByText('Papers')).toBeInTheDocument()
  })

  it('filters by category when clicked', () => {
    render(<SourceFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('博客'))
    expect(mockOnFilterChange).toHaveBeenCalledWith([mockItems[0]])
  })

  it('shows all items when "all" is clicked', () => {
    render(<SourceFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('博客'))
    mockOnFilterChange.mockClear()
    fireEvent.click(screen.getByText('全部'))
    expect(mockOnFilterChange).toHaveBeenCalledWith(mockItems)
  })

  it('renders source dropdown', () => {
    render(<SourceFilter {...defaultProps} />)
    expect(screen.getByText('来源')).toBeInTheDocument()
  })

  it('filters by source when selected', () => {
    render(<SourceFilter {...defaultProps} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'openai_news' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith([mockItems[0]])
  })
})
