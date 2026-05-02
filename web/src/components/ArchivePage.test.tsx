import { render, screen, fireEvent } from '@testing-library/react'
import { ArchivePage } from './ArchivePage'

describe('ArchivePage', () => {
  const mockDates = ['2026-05-01', '2026-04-30', '2026-04-29']
  const mockOnOpenDate = jest.fn()

  const defaultProps = {
    lang: 'zh' as const,
    availableDates: mockDates,
    sources: {},
    onOpenDate: mockOnOpenDate,
  }

  beforeEach(() => {
    mockOnOpenDate.mockClear()
  })

  it('renders archive title in Chinese', () => {
    render(<ArchivePage {...defaultProps} />)
    expect(screen.getByText((content) => content.includes('历史'))).toBeInTheDocument()
  })

  it('renders archive title in English', () => {
    render(<ArchivePage {...defaultProps} lang="en" />)
    expect(screen.getByText((content) => content.includes('Archive'))).toBeInTheDocument()
  })

  it('renders all dates', () => {
    render(<ArchivePage {...defaultProps} />)
    mockDates.forEach((d) => {
      expect(screen.getAllByText(d).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('calls onOpenDate when date clicked', () => {
    render(<ArchivePage {...defaultProps} />)
    const firstDate = screen.getAllByText('2026-05-01')[0]
    fireEvent.click(firstDate.closest('li')!)
    expect(mockOnOpenDate).toHaveBeenCalledWith('2026-05-01')
  })

  it('shows empty state when no dates', () => {
    render(<ArchivePage {...defaultProps} availableDates={[]} />)
    expect(screen.getByText('该日期暂无内容。')).toBeInTheDocument()
  })

  it('renders filter label', () => {
    render(<ArchivePage {...defaultProps} />)
    expect(screen.getByText('按日期筛选')).toBeInTheDocument()
  })

  it('renders filter label in English', () => {
    render(<ArchivePage {...defaultProps} lang="en" />)
    expect(screen.getByText('Filter by date')).toBeInTheDocument()
  })
})
