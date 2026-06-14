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
   * Set to 0 in the Hero "outline" phase — the outline shows, interiors are transparent.
   * GSAP tweens this to 1 for the fill phase.
   */
  fillImageOpacity?: number
  /**
   * Optional ref forwarded to a wrapper <g> that wraps ONLY the fill images.
   * GSAP uses this ref to tween opacity 0→1 without touching the outline group.
   */
  fillGroupRef?: React.RefObject<SVGGElement | null>
  /**
   * Optional ref forwarded to the outline <g> (wm-outline-group).
   * GSAP uses this to:
   *   1. Animate the clip-path wipe draw-in (reveal from right → left, RTL reading direction)
   *   2. Fade opacity 1→0 once interiors are filled (removes white rim cleanly)
   */
  outlineRef?: React.RefObject<SVGGElement | null>
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
 *
 * Outline draw animation:
 *   The `.wm-outline-group` uses a CSS clip-path wipe for the draw-in effect.
 *   GSAP animates `clipPath` on the group element from `inset(0 100% 0 0)` → `inset(0 0% 0 0)`,
 *   which reveals the stroked text from right to left — RTL reading-start direction.
 *   This is more reliable cross-browser than strokeDashoffset on text elements.
 *   After the fill phase, GSAP fades the outline group opacity 1→0.
 */
export function BrandWordmarkMask({ fillSrc, className, subWord, fillImageOpacity = 1, fillGroupRef, outlineRef }: BrandWordmarkMaskProps) {
  const rawId = useId()
  const safeId = rawId.replace(/[:]/g, '')
  const clipId = `brand-wordmark-clip-${safeId}`
  const clipIdSub = `brand-wordmark-sub-clip-${safeId}`

  const viewBoxH = subWord ? 285 : 175
  const mainY = subWord ? '38%' : '50%'

  // WebKit/iOS fix: WebKit does NOT honour Hebrew RTL bidi inside SVG <text>.
  // Bypass bidi entirely by reversing the glyph string and forcing LTR layout,
  // so both Chromium and WebKit render characters in the same (visual) order.
  const rtlText = (s: string) => [...s].reverse().join('')

  const MAIN_WORD = 'בונים עתיד'

  // Shared text attributes for the main word — outline and clipPath texts must match exactly.
  // direction/unicodeBidi: force LTR so WebKit places reversed glyphs left→right,
  // giving the same visual result as Chromium's native bidi handling.
  const mainTextAttrs = {
    x: '50%' as const,
    y: mainY,
    dominantBaseline: 'central' as const,
    textAnchor: 'middle' as const,
    fontFamily: 'var(--font-hebrew), system-ui, sans-serif',
    fontWeight: '800' as const,
    fontSize: '138' as const,
    letterSpacing: '-2' as const,
    style: { direction: 'ltr', unicodeBidi: 'bidi-override' } as const,
  }

  // Shared text attributes for the sub-word.
  const subTextAttrs = {
    x: '50%' as const,
    y: '80%' as const,
    dominantBaseline: 'central' as const,
    textAnchor: 'middle' as const,
    fontFamily: 'var(--font-hebrew), system-ui, sans-serif',
    fontWeight: '800' as const,
    fontSize: '69' as const,
    letterSpacing: '-1' as const,
    style: { direction: 'ltr', unicodeBidi: 'bidi-override' } as const,
  }

  return (
    <svg
      viewBox={`0 0 720 ${viewBoxH}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={subWord ? `בונים עתיד - ${subWord}` : 'בונים עתיד'}
      className={className}
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
      style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.22))' }}
    >
      <defs>
        {/* ClipPath for main word fill image — reversed+LTR for cross-browser bidi parity */}
        <clipPath id={clipId}>
          <text {...mainTextAttrs}>
            {rtlText(MAIN_WORD)}
          </text>
        </clipPath>
        {/* ClipPath for sub-word fill image */}
        {subWord && (
          <clipPath id={clipIdSub}>
            <text {...subTextAttrs}>
              {rtlText(subWord)}
            </text>
          </clipPath>
        )}
      </defs>

      {/*
        Paint order (critical — SVG document order = painter's algorithm):
          1. Outline group (hollow stroked text) — BEHIND the fill group.
             Initially hidden via clip-path wipe; GSAP reveals RTL then fades it out.
          2. Fill group (clipped image fill) — ABOVE the outline group.
             GSAP tweens opacity 0→1 during cross-dissolve.

        This stacking means:
          - Outline phase: fill opacity=0, outline strokes visible, building shows through.
          - Fill phase: fill floods interiors; outline fades away → clean image-filled letterforms.
      */}

      {/*
        1 — OUTLINE GROUP
        Stroked hollow text — fill:none so building shows through interiors.
        GSAP draws this in via clipPath wipe: inset(0 100% 0 0) → inset(0 0% 0 0)
        (reveals right-to-left = RTL reading direction start).
        Then GSAP fades opacity 1→0 once fillGroup is mostly visible.
        The overflow:visible on the SVG ensures the stroke isn't clipped at the SVG edge.
      */}
      <g
        ref={outlineRef as React.RefObject<SVGGElement>}
        aria-hidden="true"
        className="wm-outline-group"
        style={{
          // inset(top right bottom left):
          // inset(0 0 0 100%) clips entire left side → reveals right-to-left (RTL reading start).
          // GSAP animates to inset(0 0 0 0%) to sweep fully open.
          clipPath: 'inset(0 0 0 100%)',
        }}
      >
        {/* Main word — thin white hollow stroke; reversed+LTR for WebKit parity */}
        <text
          {...mainTextAttrs}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {rtlText(MAIN_WORD)}
        </text>
        {/* Sub-word — slightly thinner stroke at smaller scale */}
        {subWord && (
          <text
            {...subTextAttrs}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.9"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {rtlText(subWord)}
          </text>
        )}
      </g>

      {/*
        2 — UNIFIED FILL GROUP
        Wraps ALL interior fill images (main + sub).
        GSAP targets this single <g> to tween opacity 0→1:
          opacity 0 = "outline" phase — building shows through, outline strokes visible
          opacity 1 = "fill" phase — building image floods the letter interiors
        The outline group above never blocks this layer once it fades; clean separation.
      */}
      <g
        ref={fillGroupRef as React.RefObject<SVGGElement>}
        style={{ opacity: fillImageOpacity }}
        aria-hidden="true"
        className="wm-fill-group"
      >
        {/* Clipped image fills main word */}
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
        {/* Clipped image fills sub-word */}
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
