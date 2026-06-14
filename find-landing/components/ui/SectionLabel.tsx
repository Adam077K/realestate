'use client'

import { cn } from '@/lib/utils'

export interface SectionLabelProps {
  /** The label text - displayed uppercase, tracked */
  children: string
  /** Additional Tailwind classes */
  className?: string
  /** Light variant for dark backgrounds */
  variant?: 'dark' | 'light'
}

export default function SectionLabel({
  children,
  className,
  variant = 'dark',
}: SectionLabelProps) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-semibold uppercase tracking-[0.18em]',
        variant === 'dark'
          ? 'text-[var(--color-muted)]'
          : 'text-[rgba(255,255,255,0.55)]',
        className
      )}
    >
      {children}
    </span>
  )
}
