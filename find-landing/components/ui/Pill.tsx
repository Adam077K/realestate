'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface PillProps {
  /** Visual style of the pill */
  variant?: 'dark' | 'light' | 'ghost'
  /** Text or elements inside the pill */
  children: ReactNode
  /** If provided, renders as an anchor tag */
  href?: string
  /** Click handler (used when no href) */
  onClick?: () => void
  /** Trailing → arrow that nudges right on hover */
  withArrow?: boolean
  /** Additional Tailwind classes */
  className?: string
  /** Accessible label override */
  'aria-label'?: string
  /** Disable the pill */
  disabled?: boolean
  /** Button type (when not rendered as link) */
  type?: 'button' | 'submit' | 'reset'
}

const variantClasses: Record<NonNullable<PillProps['variant']>, string> = {
  dark: [
    'bg-[var(--color-ink)] text-[var(--color-paper)]',
    'hover:bg-[var(--color-dark)]',
    'focus-visible:ring-[var(--color-ink)]',
  ].join(' '),
  light: [
    'bg-transparent text-[var(--color-ink)]',
    'border border-[var(--color-ink)]',
    'hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]',
    'focus-visible:ring-[var(--color-ink)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-ink)]',
    'border border-transparent',
    'hover:border-[var(--color-ink)]',
    'focus-visible:ring-[var(--color-ink)]',
  ].join(' '),
}

const baseClasses = [
  'group inline-flex items-center gap-2',
  'rounded-full px-6 py-3',
  'text-sm font-medium tracking-tight',
  'transition-all duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-40',
  'select-none cursor-pointer',
  'min-h-[44px]', // touch target
].join(' ')

export default function Pill({
  variant = 'dark',
  children,
  href,
  onClick,
  withArrow = false,
  className,
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
}: PillProps) {
  const classes = cn(baseClasses, variantClasses[variant], className)

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
