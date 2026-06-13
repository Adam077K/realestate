'use client'

import { cn } from '@/lib/utils'

/**
 * FIND_GLYPH_PATHS — path geometry for the "FIND" wordmark.
 *
 * The letterforms are drawn on a 200×60 viewBox:
 *   F  — 0-38
 *   I  — 44-62  (bold right-pointing chevron: ›)
 *   N  — 68-120
 *   D  — 126-182
 *
 * Re-use these paths in any <svg> with the same viewBox:
 *   import { FIND_GLYPH_PATHS } from '@/components/layout/Logo'
 *   <svg viewBox="0 0 200 60">
 *     {FIND_GLYPH_PATHS.map((p) => <path key={p.id} d={p.d} fill="currentColor"/>)}
 *   </svg>
 */
export const FIND_GLYPH_PATHS = [
  // F — vertical stem + two horizontal bars
  {
    id: 'glyph-F',
    d: 'M4 4 L4 56 L12 56 L12 34 L36 34 L36 26 L12 26 L12 12 L38 12 L38 4 Z',
  },
  // I — bold right-pointing chevron (›), cap height, centered in its slot
  // Points: left-top → apex-top → right-mid → apex-bottom → left-bottom
  {
    id: 'glyph-I-chevron',
    d: 'M44 4 L56 4 L70 30 L56 56 L44 56 L58 30 Z',
  },
  // N — vertical stems + diagonal
  {
    id: 'glyph-N',
    d: 'M76 4 L76 56 L84 56 L84 20 L110 56 L118 56 L118 4 L110 4 L110 40 L84 4 Z',
  },
  // D — left stem + rounded right side (approximated as bezier arc)
  {
    id: 'glyph-D',
    d: 'M126 4 L126 56 L152 56 C172 56 182 44 182 30 C182 16 172 4 152 4 Z M134 12 L150 12 C165 12 173 20 173 30 C173 40 165 48 150 48 L134 48 Z',
  },
] as const

export interface FindGlyphProps {
  className?: string
}

/** Renders only the "FIND" glyph paths. Use for clip-masks, footer, etc. */
export function FindGlyph({ className }: FindGlyphProps) {
  return (
    <svg
      viewBox="0 0 186 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {FIND_GLYPH_PATHS.map((p) => (
        <path key={p.id} d={p.d} fill="currentColor" fillRule="evenodd" />
      ))}
    </svg>
  )
}

export type LogoVariant = 'nav' | 'footer'

export interface LogoProps {
  variant?: LogoVariant
  className?: string
}

/**
 * FIND Real Estate logo.
 *
 * - variant="nav"    → compact wordmark, medium weight (default)
 * - variant="footer" → larger, white text
 *
 * Color is inherited via `currentColor` — set text color on parent.
 */
export default function Logo({ variant = 'nav', className }: LogoProps) {
  const isFooter = variant === 'footer'

  return (
    <div
      className={cn(
        'inline-flex flex-col items-start leading-none',
        isFooter ? 'text-[var(--color-paper)]' : 'text-[var(--color-ink)]',
        className
      )}
      aria-label="FIND Real Estate"
      role="img"
    >
      {/* Wordmark */}
      <FindGlyph
        className={cn(
          isFooter ? 'h-8 w-auto' : 'h-6 w-auto'
        )}
      />

      {/* Subline */}
      <span
        className={cn(
          'mt-0.5 font-[var(--font-body)] font-light tracking-[0.22em] uppercase',
          isFooter
            ? 'text-[0.45rem] text-[rgba(255,255,255,0.6)]'
            : 'text-[0.4rem] text-[var(--color-muted)]'
        )}
      >
        Real Estate
      </span>
    </div>
  )
}
