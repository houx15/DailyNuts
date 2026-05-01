import { render, screen, fireEvent } from '@testing-library/react'
import { Masthead } from './Masthead'

describe('Masthead', () => {
  const mockSetLang = jest.fn()
  const mockSetRoute = jest.fn()

  const defaultProps = {
    lang: 'zh' as const,
    setLang: mockSetLang,
    route: 'today',
    setRoute: mockSetRoute,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title', () => {
    render(<Masthead {...defaultProps} />)
    expect(screen.getByText(/Daily/)).toBeInTheDocument()
    expect(screen.getByText(/Nuts/)).toBeInTheDocument()
  })

  it('renders tagline in Chinese when lang is zh', () => {
    render(<Masthead {...defaultProps} />)
    expect(screen.getByText('AI 学习每日简报')).toBeInTheDocument()
  })

  it('renders tagline in English when lang is en', () => {
    render(<Masthead {...defaultProps} lang="en" />)
    expect(screen.getByText('AI Learning · Daily Brief')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Masthead {...defaultProps} />)
    expect(screen.getByText('今日')).toBeInTheDocument()
    expect(screen.getByText('档案')).toBeInTheDocument()
  })

  it('calls setRoute when nav link clicked', () => {
    render(<Masthead {...defaultProps} />)
    fireEvent.click(screen.getByText('档案'))
    expect(mockSetRoute).toHaveBeenCalledWith('archive')
  })

  it('calls setLang when language button clicked', () => {
    render(<Masthead {...defaultProps} />)
    fireEvent.click(screen.getByText('EN'))
    expect(mockSetLang).toHaveBeenCalledWith('en')
  })

  it('shows active state for current route', () => {
    render(<Masthead {...defaultProps} route="archive" />)
    const archiveLink = screen.getByText('档案')
    expect(archiveLink).toHaveClass('text-ink')
  })
})
