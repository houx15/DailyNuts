'use client'

import { Lang } from '@/i18n'

interface MonoCircleProps {
  source: string
  tone: string
  mono: string
  size?: 'small' | 'tiny'
}

export function MonoCircle({ source, tone, mono, size }: MonoCircleProps) {
  const isTextMono = mono.length > 1
  const sizeClasses = {
    small: 'w-11 h-11 text-lg',
    tiny: 'w-6 h-6 text-[11px]',
    default: 'w-14 h-14 text-[22px]',
  }

  const sizeClass = sizeClasses[size || 'default']

  return (
    <div
      className={`rounded-full grid place-items-center font-serif font-semibold italic text-white tracking-[-0.01em] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] flex-shrink-0 ${sizeClass} ${
        isTextMono ? 'font-mono not-italic text-xs font-semibold' : ''
      }`}
      style={{ background: tone }}
      aria-label={source}
    >
      {mono}
    </div>
  )
}
