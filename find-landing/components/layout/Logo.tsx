'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

// ════════════════════════════════════════════════════════════════════════════════
// בונים עתיד — primary brand mark
// ════════════════════════════════════════════════════════════════════════════════

export type LogoVariant = 'nav' | 'footer'

export interface LogoProps {
  variant?: LogoVariant
  className?: string
}

/**
 * Bonim Atid logo — renders the Hebrew wordmark "בונים עתיד".
 *
 * The brand name stays in Hebrew in BOTH languages (it is the company's real name).
 * Color inherits via `currentColor`; set text color on the parent.
 *
 * - variant="nav"    → compact wordmark (default)
 * - variant="footer" → larger, on a dark surface
 */
export default function Logo({ variant = 'nav', className }: LogoProps) {
  const isFooter = variant === 'footer'

  return (
    <span
      dir="rtl"
      className={cn(
        'inline-flex items-baseline leading-none font-[var(--font-hebrew)] font-extrabold tracking-tight',
        isFooter
          ? 'text-[var(--color-paper)] text-2xl'
          : 'text-[var(--color-ink)] text-xl md:text-2xl',
        className
      )}
      aria-label="בונים עתיד"
      role="img"
    >
      בונים עתיד
    </span>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// BrandWordmarkMask — building image clipped to the Hebrew letters "בונים עתיד"
// ════════════════════════════════════════════════════════════════════════════════

export interface BrandWordmarkMaskProps {
  /** Image used to FILL the letters (e.g. images.heroBuildingFill). */
  fillSrc: string
  className?: string
}

/**
 * Renders the Hebrew wordmark "בונים עתיד" as a clip-path over a building image,
 * so the photo fills every glyph. Used for the giant footer wordmark; Hero/footer
 * fully adopt it in the next wave.
 *
 * Implementation: an <image> is clipped by a <clipPath> whose shape is a bold
 * Hebrew <text> node. `useId()` keeps the clip-path id unique per instance so
 * multiple masks can coexist on the page.
 */
export function BrandWordmarkMask({ fillSrc, className }: BrandWordmarkMaskProps) {
  const rawId = useId()
  const clipId = `brand-wordmark-clip-${rawId.replace(/[:]/g, '')}`

  return (
    <svg
      viewBox="0 0 720 175"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="בונים עתיד"
      className={className}
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            direction="rtl"
            fontFamily="var(--font-hebrew), system-ui, sans-serif"
            fontWeight="800"
            fontSize="138"
            letterSpacing="-2"
          >
            בונים עתיד
          </text>
        </clipPath>
      </defs>
      <image
        href={fillSrc}
        x="0"
        y="0"
        width="720"
        height="175"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// COMPAT — FIND glyph geometry (kept so Hero / CtaFooter still compile this wave).
// Removed once those sections migrate to the Bonim Atid mark.
// ════════════════════════════════════════════════════════════════════════════════

/**
 * FIND_GLYPH_PATHS — path geometry for the legacy "FIND" wordmark on a 200×60 viewBox.
 * @deprecated Use <Logo /> / <BrandWordmarkMask />. Retained for Hero/CtaFooter compat.
 */
export const FIND_GLYPH_PATHS = [
  {
    id: 'glyph-F',
    d: 'M4 4 L4 56 L12 56 L12 34 L36 34 L36 26 L12 26 L12 12 L38 12 L38 4 Z',
  },
  {
    id: 'glyph-I-chevron',
    d: 'M44 4 L56 4 L70 30 L56 56 L44 56 L58 30 Z',
  },
  {
    id: 'glyph-N',
    d: 'M76 4 L76 56 L84 56 L84 20 L110 56 L118 56 L118 4 L110 4 L110 40 L84 4 Z',
  },
  {
    id: 'glyph-D',
    d: 'M126 4 L126 56 L152 56 C172 56 182 44 182 30 C182 16 172 4 152 4 Z M134 12 L150 12 C165 12 173 20 173 30 C173 40 165 48 150 48 L134 48 Z',
  },
] as const

export interface FindGlyphProps {
  className?: string
}

/**
 * Renders only the legacy "FIND" glyph paths.
 * @deprecated Compat shim for Hero/CtaFooter; replaced by <Logo /> next wave.
 */
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
