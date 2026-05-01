import Image from "next/image";

import { getItems, getBrief, getAvailableDates, getSources } from '@/lib/content'
import { AppShell } from './AppShell'

export default function Home() {
  const availableDates = getAvailableDates()
  const latestDate = availableDates[0] || '2026-05-01'
  
  const itemsData = getItems(latestDate)
  const brief = getBrief(latestDate)
  const sources = getSources()

  return (
    <AppShell
      initialDate={latestDate}
      availableDates={availableDates}
      initialItems={itemsData.items}
      initialBrief={brief}
      sources={sources}
    />
  )
}
