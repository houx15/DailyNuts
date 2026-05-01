import { t, fmtDate, fmtDateShort, fmtTime, I18N } from './index'

describe('i18n utilities', () => {
  describe('t', () => {
    it('returns translated string for key', () => {
      expect(t('zh', 'nav_today')).toBe('今日')
      expect(t('en', 'nav_today')).toBe('Today')
    })

    it('interpolates variables', () => {
      expect(t('zh', 'vol', { n: '42' })).toBe('第 42 期')
      expect(t('en', 'vol', { n: '42' })).toBe('Issue No. 42')
    })

    it('returns key as fallback for missing translation', () => {
      expect(t('zh', 'nonexistent' as any)).toBe('nonexistent')
    })

    it('returns key for array values', () => {
      expect(t('zh', 'weekday' as any)).toBe('weekday')
    })
  })

  describe('fmtDate', () => {
    it('formats date in Chinese', () => {
      expect(fmtDate('2026-05-01', 'zh')).toBe('2026 年 5 月 1 日 · 周五')
    })

    it('formats date in English', () => {
      expect(fmtDate('2026-05-01', 'en')).toBe('Fri, May 1, 2026')
    })
  })

  describe('fmtDateShort', () => {
    it('formats short date in Chinese', () => {
      expect(fmtDateShort('2026-05-01', 'zh')).toBe('5 月 1 日')
    })

    it('formats short date in English', () => {
      expect(fmtDateShort('2026-05-01', 'en')).toBe('May 1')
    })
  })

  describe('fmtTime', () => {
    it('formats ISO time as UTC', () => {
      expect(fmtTime('2026-05-01T09:30:00Z', 'en')).toBe('09:30 UTC')
      expect(fmtTime('2026-05-01T14:05:00Z', 'zh')).toBe('14:05 UTC')
    })
  })

  describe('I18N data', () => {
    it('has matching keys for both languages', () => {
      const zhKeys = Object.keys(I18N.zh)
      const enKeys = Object.keys(I18N.en)
      expect(zhKeys.sort()).toEqual(enKeys.sort())
    })

    it('has 7 weekdays for both languages', () => {
      expect(I18N.zh.weekday).toHaveLength(7)
      expect(I18N.en.weekday).toHaveLength(7)
    })

    it('has 12 months for both languages', () => {
      expect(I18N.zh.months).toHaveLength(12)
      expect(I18N.en.months).toHaveLength(12)
    })
  })
})
