import { render, screen } from '@testing-library/react'
import { SubBar } from './SubBar'
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
]

describe('SubBar', () => {
  const mockOnPickDate = jest.fn()

  const defaultProps = {
    lang: 'zh' as const,
    date: '2026-05-01',
    items: mockItems,
    route: 'home' as const,
    availableDates: ['2026-05-01', '2026-04-30'],
    onPickDate: mockOnPickDate,
  }

  it('renders issue number in Chinese', () => {
    render(<SubBar {...defaultProps} />)
    expect(screen.getByText((content) => content.includes('第'))).toBeInTheDocument()
  })

  it('renders issue number in English', () => {
    render(<SubBar {...defaultProps} lang="en" />)
    expect(screen.getAllByText((content) => content.includes('Issue'))[0]).toBeInTheDocument()
  })

  it('renders item count in Chinese', () => {
    render(<SubBar {...defaultProps} />)
    expect(screen.getByText((content) => content.includes('1') && content.includes('项'))).toBeInTheDocument()
  })

  it('renders item count in English', () => {
    render(<SubBar {...defaultProps} lang="en" />)
    expect(screen.getByText((content) => content.includes('1') && content.includes('items'))).toBeInTheDocument()
  })

  it('renders archive route text in Chinese', () => {
    render(<SubBar {...defaultProps} route="archive" />)
    expect(screen.getByText((content) => content.includes('档案'))).toBeInTheDocument()
  })

  it('renders archive route text in English', () => {
    render(<SubBar {...defaultProps} route="archive" lang="en" />)
    expect(screen.getByText((content) => content.includes('Archive'))).toBeInTheDocument()
  })
})
