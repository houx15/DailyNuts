import Image from "next/image";

import { getItems, getBrief, getAvailableDates, getSources } from '@/lib/content'
import type { Item, Brief } from '@/lib/content'
import { AppShell } from './AppShell'

export default function Home() {
  const availableDates = getAvailableDates()
  const latestDate = availableDates[0] || '2026-05-01'
  
  // Pre-load all dates' content so date switching works without re-fetching.
  const allItems: Record<string, Item[]> = {}
  const allBriefs: Record<string, Brief> = {}
  for (const date of availableDates) {
    try { allItems[date] = getItems(date).items } catch {}
    try { allBriefs[date] = getBrief(date) } catch {}
  }

  const itemsData = getItems(latestDate)
  const brief = getBrief(latestDate)
  const sources = getSources()

  return (
    <AppShell
      initialDate={latestDate}
      availableDates={availableDates}
      initialItems={itemsData.items}
      initialBrief={brief}
      allItems={allItems}
      allBriefs={allBriefs}
      sources={sources}
    />
  )
}
