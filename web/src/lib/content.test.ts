import { getItems, getBrief, getAvailableDates, getSources } from './content'
import fs from 'fs'
import path from 'path'

// Mock fs module
jest.mock('fs')

const mockedFs = fs as jest.Mocked<typeof fs>

describe('content utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getItems', () => {
    it('reads and parses items JSON for a given date', () => {
      const mockItems = {
        date: '2026-05-01',
        items: [
          {
            id: 'm1',
            source: 'anthropic_research',
            theme: 'interp',
            title_zh: '测试标题',
            title_en: 'Test Title',
            summary_zh: '测试摘要',
            summary_en: 'Test summary',
            published_at: '2026-05-01T09:00:00Z',
            categories_zh: ['测试'],
            categories_en: ['Test'],
            url: 'https://example.com',
          },
        ],
      }

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockItems))

      const result = getItems('2026-05-01')

      expect(result).toEqual(mockItems)
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('items/2026-05-01.json'),
        'utf-8'
      )
    })

    it('throws error when items file is missing', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file')
      })

      expect(() => getItems('2026-01-01')).toThrow('Failed to load items for 2026-01-01')
    })

    it('throws error when items JSON is invalid', () => {
      mockedFs.readFileSync.mockReturnValue('not valid json')

      expect(() => getItems('2026-05-01')).toThrow('Failed to load items for 2026-05-01')
    })
  })

  describe('getBrief', () => {
    it('reads and parses brief JSON for a given date', () => {
      const mockBrief = {
        date: '2026-05-01',
        headline_en: 'Test Headline',
        headline_zh: '测试标题',
        lede_en: 'Test lede',
        lede_zh: '测试导语',
        sections_en: [{ title: 'Section', body: 'Body' }],
        sections_zh: [{ title: '章节', body: '内容' }],
        top_picks: ['m1'],
        item_count: 5,
        source_breakdown: { openai_news: 2 },
        generated_at: '2026-05-01T12:30:00Z',
      }

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockBrief))

      const result = getBrief('2026-05-01')

      expect(result).toEqual(mockBrief)
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('briefs/2026-05-01.json'),
        'utf-8'
      )
    })

    it('throws error when brief file is missing', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file')
      })

      expect(() => getBrief('2026-01-01')).toThrow('Failed to load brief for 2026-01-01')
    })
  })

  describe('getAvailableDates', () => {
    it('returns dates in reverse chronological order', () => {
      mockedFs.readdirSync.mockReturnValue([
        '2026-04-30.json',
        '2026-05-01.json',
        '2026-04-29.json',
      ] as unknown as Buffer) // Buffer type workaround

      const result = getAvailableDates()

      expect(result).toEqual(['2026-05-01', '2026-04-30', '2026-04-29'])
      expect(mockedFs.readdirSync).toHaveBeenCalledWith(
        expect.stringContaining('briefs')
      )
    })

    it('filters out non-JSON files', () => {
      mockedFs.readdirSync.mockReturnValue([
        '2026-05-01.json',
        'README.md',
        '.gitkeep',
      ] as unknown as Buffer)

      const result = getAvailableDates()

      expect(result).toEqual(['2026-05-01'])
    })

    it('returns empty array when no briefs exist', () => {
      mockedFs.readdirSync.mockReturnValue([] as unknown as Buffer)

      const result = getAvailableDates()

      expect(result).toEqual([])
    })
  })

  describe('getSources', () => {
    it('reads and parses sources metadata', () => {
      const mockSources = {
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

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSources))

      const result = getSources()

      expect(result).toEqual(mockSources)
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('sources.json'),
        'utf-8'
      )
    })

    it('throws error when sources file is missing', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file')
      })

      expect(() => getSources()).toThrow('Failed to load sources')
    })
  })
})
