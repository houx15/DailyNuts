import fs from 'fs'
import path from 'path'

export interface Item {
  id: string
  source: string
  theme: string
  title_zh: string
  title_en: string
  summary_zh: string
  summary_en: string
  published_at: string
  original_language?: string
  categories_zh: string[]
  categories_en: string[]
  url: string
}

export interface ItemsData {
  date: string
  items: Item[]
}

export interface BriefSection {
  title: string
  body: string
}

export interface Brief {
  date: string
  brief_en: string
  brief_zh: string
  headline_en: string
  headline_zh: string
  lede_en: string
  lede_zh: string
  sections_en: BriefSection[]
  sections_zh: BriefSection[]
  top_picks: string[]
  item_count: number
  source_breakdown: Record<string, number>
  generated_at: string
}

export interface Source {
  mono: string
  tone: string
  name: string
  name_zh: string
  kind: string
  kind_label_en: string
  kind_label_zh: string
}

export interface SourcesData {
  [key: string]: Source
}

const CONTENT_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'content')

export function getItems(date: string): ItemsData {
  try {
    const filePath = path.join(CONTENT_DIR, 'items', `${date}.json`)
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as ItemsData
  } catch (error) {
    throw new Error(`Failed to load items for ${date}`)
  }
}

export function getBrief(date: string): Brief {
  try {
    const filePath = path.join(CONTENT_DIR, 'briefs', `${date}.json`)
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as Brief
  } catch (error) {
    throw new Error(`Failed to load brief for ${date}`)
  }
}

export function getAvailableDates(): string[] {
  try {
    const briefsDir = path.join(CONTENT_DIR, 'briefs')
    const files = fs.readdirSync(briefsDir)
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort()
      .reverse()
  } catch (error) {
    return []
  }
}

export function getSources(): SourcesData {
  try {
    const filePath = path.join(CONTENT_DIR, 'sources.json')
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as SourcesData
  } catch (error) {
    throw new Error('Failed to load sources')
  }
}
