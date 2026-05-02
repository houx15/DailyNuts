import { render, screen, fireEvent } from '@testing-library/react'
import { Drawer } from './Drawer'
import { Item } from '@/lib/content'

const mockItem: Item = {
  id: 'i1',
  source: 'openai_news',
  theme: 'agent',
  title_zh: '测试标题',
  title_en: 'Test Title',
  summary_zh: '测试摘要',
  summary_en: 'Test Summary',
  published_at: '2026-05-01T10:00:00Z',
  categories_zh: ['测试'],
  categories_en: ['Test'],
  url: 'https://example.com',
}

const mockSources = {
  openai_news: {
    name: 'OpenAI',
    name_zh: 'OpenAI',
    kind: 'company_blog',
    kind_label_en: 'Blog',
    kind_label_zh: '博客',
    tone: 'blue',
    mono: 'OA',
  },
}

describe('Drawer', () => {
  const mockOnClose = jest.fn()

  const defaultProps = {
    item: null as Item | null,
    lang: 'zh' as const,
    sources: mockSources,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('returns null when no item', () => {
    const { container } = render(<Drawer {...defaultProps} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders item details when open', () => {
    render(<Drawer {...defaultProps} item={mockItem} />)
    expect(screen.getByText((content) => content.includes('测试标题'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Test Title'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('测试摘要'))).toBeInTheDocument()
  })

  it('renders in English', () => {
    render(<Drawer {...defaultProps} item={mockItem} lang="en" />)
    expect(screen.getByText((content) => content.includes('Test Title'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('测试标题'))).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    render(<Drawer {...defaultProps} item={mockItem} />)
    fireEvent.click(screen.getByText('关闭 ✕'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay clicked', () => {
    render(<Drawer {...defaultProps} item={mockItem} />)
    const overlay = screen.getByText('关闭 ✕').closest('aside')?.previousElementSibling
    if (overlay) fireEvent.click(overlay)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('renders source info', () => {
    render(<Drawer {...defaultProps} item={mockItem} />)
    expect(screen.getAllByText('OpenAI')[0]).toBeInTheDocument()
  })

  it('renders categories', () => {
    render(<Drawer {...defaultProps} item={mockItem} />)
    expect(screen.getByText('测试')).toBeInTheDocument()
  })

  it('renders open link', () => {
    render(<Drawer {...defaultProps} item={mockItem} />)
    const link = screen.getByText((content) => content.includes('打开原文')).closest('a')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })
})
