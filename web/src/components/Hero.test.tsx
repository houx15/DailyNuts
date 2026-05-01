import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { Brief, Item } from '@/lib/content'

const mockBrief: Brief = {
  date: '2026-05-01',
  brief_en: 'Test brief en',
  brief_zh: '测试简报',
  headline_en: 'Test Headline; Second Part',
  headline_zh: '测试标题，第二部分',
  lede_en: 'Test lede content.',
  lede_zh: '测试导语内容。',
  sections_en: [
    { title: 'Section 1', body: 'Body 1' },
    { title: 'Section 2', body: 'Body 2' },
  ],
  sections_zh: [
    { title: '章节 1', body: '内容 1' },
    { title: '章节 2', body: '内容 2' },
  ],
  top_picks: ['m1'],
  item_count: 5,
  source_breakdown: {},
  generated_at: '2026-05-01T12:30:00Z',
}

const mockItems: Item[] = [
  {
    id: 'm1',
    source: 'openai_news',
    theme: 'agent',
    title_zh: '测试标题',
    title_en: 'Test Title',
    summary_zh: '测试摘要',
    summary_en: 'Test summary',
    published_at: '2026-05-01T10:00:00Z',
    categories_zh: ['测试'],
    categories_en: ['Test'],
    url: 'https://example.com',
  },
]

describe('Hero', () => {
  const defaultProps = {
    lang: 'zh' as const,
    date: '2026-05-01',
    brief: mockBrief,
    items: mockItems,
    onOpen: jest.fn(),
  }

  it('renders headline in Chinese', () => {
    render(<Hero {...defaultProps} />)
    expect(screen.getByText((content) => content.includes('测试标题'))).toBeInTheDocument()
  })

  it('renders headline in English', () => {
    render(<Hero {...defaultProps} lang="en" />)
    expect(screen.getByText((content) => content.includes('Test Headline'))).toBeInTheDocument()
  })

  it('renders lede', () => {
    render(<Hero {...defaultProps} />)
    expect(screen.getByText((content) => content.includes('试导语内容'))).toBeInTheDocument()
  })

  it('renders sections', () => {
    render(<Hero {...defaultProps} />)
    expect(screen.getByText('章节 1')).toBeInTheDocument()
    expect(screen.getByText('内容 1')).toBeInTheDocument()
  })

  it('shows fallback when no sections', () => {
    const briefNoSections = { ...mockBrief, sections_zh: [], sections_en: [] }
    render(<Hero {...defaultProps} brief={briefNoSections} />)
    expect(screen.getByText('本期无分主题展开')).toBeInTheDocument()
  })

  it('displays item count', () => {
    render(<Hero {...defaultProps} />)
    expect(screen.getByText('1 项条目')).toBeInTheDocument()
  })
})
