'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

// ════════════════════════════════════════════════════════════════════════════════
// בונים עתיד - primary brand mark
// ════════════════════════════════════════════════════════════════════════════════

export type LogoVariant = 'nav' | 'footer'

export interface LogoProps {
  variant?: LogoVariant
  className?: string
}

/**
 * Bonim Atid logo - renders the Hebrew wordmark "בונים עתיד".
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
// BrandWordmarkMask - building image clipped to the Hebrew letters "בונים עתיד"
// ════════════════════════════════════════════════════════════════════════════════

export interface BrandWordmarkMaskProps {
  /** Image used to FILL the letters (e.g. images.heroBuildingFill). */
  fillSrc: string
  className?: string
  /**
   * Optional sub-word rendered below the main wordmark at 50% scale.
   * When provided, the viewBox expands to 720×285 to accommodate both words.
   * Main word is positioned at ~38% height, sub-word at ~80%.
   * Hero uses subWord="וובינר"; CtaFooter omits it (single-word unchanged).
   */
  subWord?: string
  /**
   * Initial opacity of the interior fill images. Defaults to 1.
   * Set to 0 in the Hero "outline" phase — the white rim stays visible,
   * letters appear as hollow outlines. GSAP tweens this to 1 for the fill phase.
   * The white rim stays at opacity 1 throughout (no shift, no misalign).
   */
  fillImageOpacity?: number
  /**
   * Optional ref forwarded to a wrapper <g> that wraps ONLY the fill images.
   * GSAP uses this ref to tween opacity 0→1 without touching the white rim.
   */
  fillGroupRef?: React.RefObject<SVGGElement | null>
}

/**
 * Renders the Hebrew wordmark "בונים עתיד" as a clip-path over a building image,
 * so the photo fills every glyph. Used for the giant footer wordmark; Hero/footer
 * fully adopt it in the next wave.
 *
 * Implementation: an <image> is clipped by a <clipPath> whose shape is a bold
 * Hebrew <text> node. `useId()` keeps the clip-path id unique per instance so
 * multiple masks can coexist on the page.
 *
 * When subWord is provided, a second <text> at fontSize 69 (50% of 138) is added
 * below the main word. The viewBox height expands from 175 → 285 to fit both.
 */
export function BrandWordmarkMask({ fillSrc, className, subWord, fillImageOpacity = 1, fillGroupRef }: BrandWordmarkMaskProps) {
  const rawId = useId()
  const safeId = rawId.replace(/[:]/g, '')
  const clipId = `brand-wordmark-clip-${safeId}`
  const clipIdSub = `brand-wordmark-sub-clip-${safeId}`
  // Unique filter IDs for the dilate rim — one per word to allow different radii if needed
  const dilateId = `brand-wordmark-dilate-${safeId}`
  const dilateIdSub = `brand-wordmark-dilate-sub-${safeId}`

  const viewBoxH = subWord ? 285 : 175
  const mainY = subWord ? '38%' : '50%'

  return (
    <svg
      viewBox={`0 0 720 ${viewBoxH}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={subWord ? `בונים עתיד - ${subWord}` : 'בונים עתיד'}
      className={className}
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
      style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.28))' }}
    >
      <defs>
        {/* Dilate filter for main word rim — expands the white glyph outward */}
        <filter id={dilateId} x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology operator="dilate" radius="2.5" />
        </filter>
        {/* Dilate filter for sub-word rim */}
        {subWord && (
          <filter id={dilateIdSub} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology operator="dilate" radius="2" />
          </filter>
        )}
        <clipPath id={clipId}>
          <text
            x="50%"
            y={mainY}
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
        {subWord && (
          <clipPath id={clipIdSub}>
            <text
              x="50%"
              y="80%"
              dominantBaseline="central"
              textAnchor="middle"
              direction="rtl"
              fontFamily="var(--font-hebrew), system-ui, sans-serif"
              fontWeight="800"
              fontSize="69"
              letterSpacing="-1"
            >
              {subWord}
            </text>
          </clipPath>
        )}
      </defs>

      {/*
        Paint order (critical):
          1. White-dilated main text  — the outer rim halo, painted BEHIND the image
          2. Clipped image main       — covers glyph interior + counters → only rim peeks out
          3. White-dilated sub text   — same technique for the sub-word
          4. Clipped image sub        — covers sub-word interior

        Because each image is clipped to the SAME glyph shape as its white text,
        the image paints over the glyph interior (including counter holes like ם/ב),
        leaving only the dilated white border as a clean outer rim.
      */}

      {/* 1 — White dilated rim for main word (BEHIND image) */}
      <text
        x="50%"
        y={mainY}
        dominantBaseline="central"
        textAnchor="middle"
        direction="rtl"
        fontFamily="var(--font-hebrew), system-ui, sans-serif"
        fontWeight="800"
        fontSize="138"
        letterSpacing="-2"
        fill="#ffffff"
        filter={`url(#${dilateId})`}
        aria-hidden="true"
      >
        בונים עתיד
      </text>

      {/*
        Sub-word white rim must be rendered BEFORE the unified fill group,
        so it sits BEHIND the fill images (SVG paint order = document order).
        This keeps both rims (main + sub) always visible regardless of fill opacity.
      */}
      {subWord && (
        /* 3 — White dilated rim for sub-word (BEHIND sub fill image) */
        <text
          x="50%"
          y="80%"
          dominantBaseline="central"
          textAnchor="middle"
          direction="rtl"
          fontFamily="var(--font-hebrew), system-ui, sans-serif"
          fontWeight="800"
          fontSize="69"
          letterSpacing="-1"
          fill="#ffffff"
          filter={`url(#${dilateIdSub})`}
          aria-hidden="true"
        >
          {subWord}
        </text>
      )}

      {/*
        UNIFIED fill group — wraps ALL interior fill images (main + sub).
        GSAP targets this single <g> to tween opacity 0→1:
          opacity 0 = "outline" phase — white rims show, interiors are transparent
          opacity 1 = "fill" phase — building image floods the letter interiors
        The white rim texts above never change opacity, so there's no shift or
        misalignment during the cross-dissolve. One SVG, one transform. Always stable.
      */}
      <g
        ref={fillGroupRef as React.RefObject<SVGGElement>}
        style={{ opacity: fillImageOpacity }}
        aria-hidden="true"
        className="wm-fill-group"
      >
        {/* 2 — Clipped image fills main word */}
        <image
          href={fillSrc}
          x="0"
          y="0"
          width="720"
          height={viewBoxH}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
          className="wm-fill-image"
        />
        {/* 4 — Clipped image fills sub-word */}
        {subWord && (
          <image
            href={fillSrc}
            x="0"
            y="0"
            width="720"
            height={viewBoxH}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipIdSub})`}
            className="wm-fill-image"
          />
        )}
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// COMPAT - FIND glyph geometry (kept so Hero / CtaFooter still compile this wave).
// Removed once those sections migrate to the Bonim Atid mark.
// ════════════════════════════════════════════════════════════════════════════════

/**
 * FIND_GLYPH_PATHS - path geometry for the legacy "FIND" wordmark on a 200×60 viewBox.
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
