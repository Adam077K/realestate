'use client'

/**
 * HeroClouds — real transparent PNG cloud layer for the signature Hero.
 *
 * Visual layer: 8 <img> layers reusing three soft-edged transparent cloud PNGs
 * at varied sizes, positions, opacities, and scaleX flips — clearly visible
 * against the pale-blue sky (0.7–1.0 opacity; no heavy blur on foreground clouds).
 * Far-back clouds get a tiny blur(2–4px) for depth; near clouds are crisp.
 *
 * Motion (unchanged from previous version):
 *  - Continuous slow horizontal DRIFT via CSS @keyframes (different speed/range
 *    per cloud layer) — alive even when scroll is idle.
 *  - Scroll parallax driven by `progressRef`: a rAF loop reads progressRef.current
 *    and translates the whole field UP + fades it as progress 0->1, fully lifted
 *    by p ~= 0.85 (hand-off to the FIND wordmark beat).
 *  - Reduced motion / !active: clouds render STATICALLY (still fully visible).
 *
 * Performance: transform / opacity / filter only; will-change:transform on
 * drifting layers; pointer-events:none; aria-hidden. No layout thrash.
 */

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export interface HeroCloudsProps {
  /** Shared scroll progress over the hero pin, 0 -> 1. Drives parallax + dissolve. */
  progressRef?: RefObject<number>
  /** Master gate — when false the clouds render statically (no drift / parallax). */
  active?: boolean
}

// ─── PNG sources (served from /public) ───────────────────────────────────────
const SRC = {
  c1: '/images/clouds/cloud-1.png', // 1024×546
  c2: '/images/clouds/cloud-2.png', // 1400×941
  c3: '/images/clouds/cloud-3.png', // 1500×811
} as const

// ─── Cloud layer definitions ──────────────────────────────────────────────────
// Layout logic:
//  - top/left: position relative to the hero viewport
//  - width: CSS clamp string for the <img> element
//  - opacity: 0.7–1.0 — these are REAL pngs, not gradients; must be clearly visible
//  - blur: 0 (foreground) or 2–4px (far background only)
//  - flipX: true = scaleX(-1) for variety without extra assets
//  - anim: keyframe name + duration (varied for parallax-of-speed feel)
//  - delay: negative delay to start mid-cycle (desync between layers)

interface CloudLayer {
  id: string
  src: string
  top: string
  left: string
  width: string
  opacity: number
  blur: number
  flipX?: boolean
  anim: string
  duration: number
  delay: number
}

const LAYERS: CloudLayer[] = [
  // ── Far upper-left back band — biggest, slightly blurred, lowest opacity ──
  {
    id: 'cl1',
    src: SRC.c3,
    top: '-4%',
    left: '-14%',
    width: 'clamp(480px, 70vw, 900px)',
    opacity: 0.72,
    blur: 4,
    flipX: false,
    anim: 'find-cloud-drift-a',
    duration: 95,
    delay: 0,
  },
  // ── Far upper-right — mirrored for variety ─────────────────────────────────
  {
    id: 'cl2',
    src: SRC.c1,
    top: '2%',
    left: '48%',
    width: 'clamp(360px, 52vw, 720px)',
    opacity: 0.7,
    blur: 3,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 112,
    delay: -28,
  },
  // ── Mid-sky left — crisp foreground puff ──────────────────────────────────
  {
    id: 'cl3',
    src: SRC.c2,
    top: '18%',
    left: '-6%',
    width: 'clamp(380px, 48vw, 680px)',
    opacity: 0.9,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-a',
    duration: 78,
    delay: -38,
  },
  // ── Mid-sky right — prominent, no blur ────────────────────────────────────
  {
    id: 'cl4',
    src: SRC.c3,
    top: '22%',
    left: '54%',
    width: 'clamp(340px, 44vw, 640px)',
    opacity: 0.88,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 86,
    delay: -14,
  },
  // ── Mid-sky centre-left — slight overlap with building zone ───────────────
  {
    id: 'cl5',
    src: SRC.c1,
    top: '38%',
    left: '8%',
    width: 'clamp(320px, 40vw, 580px)',
    opacity: 0.85,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-a',
    duration: 70,
    delay: -52,
  },
  // ── Lower horizon left — warm-base billowy mass (frame_001 / frame_006) ───
  {
    id: 'cl6',
    src: SRC.c2,
    top: '60%',
    left: '-4%',
    width: 'clamp(420px, 58vw, 820px)',
    opacity: 0.95,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-b',
    duration: 66,
    delay: -10,
  },
  // ── Lower horizon right ────────────────────────────────────────────────────
  {
    id: 'cl7',
    src: SRC.c3,
    top: '66%',
    left: '44%',
    width: 'clamp(400px, 54vw, 760px)',
    opacity: 0.92,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 62,
    delay: -44,
  },
  // ── Bottom-most foreground — wraps the building base (frame_006 look) ─────
  {
    id: 'cl8',
    src: SRC.c1,
    top: '78%',
    left: '18%',
    width: 'clamp(440px, 62vw, 860px)',
    opacity: 1.0,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-b',
    duration: 58,
    delay: -32,
  },
]

export default function HeroClouds({ progressRef, active = true }: HeroCloudsProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  // Resolve reduced-motion only on the client to avoid an SSR mismatch.
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const animate = active && !reducedMotion

  // Scroll parallax loop: the whole field lifts up + fades as hero progress 0 -> 1.
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return

    if (!animate) {
      // Static fallback — clouds sit at rest, fully visible.
      el.style.transform = 'translate3d(0, 0, 0)'
      el.style.opacity = '1'
      return
    }

    const tick = () => {
      const p = progressRef?.current ?? 0
      // Gentle continuous lift, then accelerated exit:
      //   parallax: clouds part + rise as the building ascends (p 0 -> 0.55)
      //   exit:     fully drift up + out by p ~= 0.85 for the FIND hand-off
      const parallaxLift = p * 9 // vh
      const exitLift = Math.max(0, (p - 0.55) / 0.3) * 26 // vh, kicks in late
      const liftVh = parallaxLift + exitLift

      // Fade: hold full opacity through the build, dissolve across p 0.6 -> 0.85.
      const fade = 1 - Math.max(0, (p - 0.6) / 0.25)
      const opacity = Math.max(0, Math.min(1, fade))

      el.style.transform = `translate3d(0, ${-liftVh}vh, 0)`
      el.style.opacity = opacity.toFixed(3)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [animate, progressRef])

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ willChange: animate ? 'transform, opacity' : 'auto' }}
    >
      {/* Drift keyframes — transform-only, GPU-composited. */}
      <style>{`
        @keyframes find-cloud-drift-a {
          0%   { transform: translate3d(0, 0, 0); }
          50%  { transform: translate3d(7vw, -1.2vh, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-b {
          0%   { transform: translate3d(0, 0, 0); }
          50%  { transform: translate3d(-6vw, 1vh, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-a-flip {
          0%   { transform: scaleX(-1) translate3d(0, 0, 0); }
          50%  { transform: scaleX(-1) translate3d(7vw, -1.2vh, 0); }
          100% { transform: scaleX(-1) translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-b-flip {
          0%   { transform: scaleX(-1) translate3d(0, 0, 0); }
          50%  { transform: scaleX(-1) translate3d(-6vw, 1vh, 0); }
          100% { transform: scaleX(-1) translate3d(0, 0, 0); }
        }
      `}</style>

      {LAYERS.map((layer) => {
        // Build filter string — only blur on far layers; no filter on crisp foreground.
        const filterVal = layer.blur > 0 ? `blur(${layer.blur}px)` : 'none'

        // For flipped layers: use dedicated flip keyframes so scaleX(-1) stays
        // combined with the translate (avoids a wrapper element).
        const animName = animate
          ? layer.flipX
            ? `${layer.anim}-flip`
            : layer.anim
          : undefined

        const style: CSSProperties = {
          position: 'absolute',
          top: layer.top,
          left: layer.left,
          width: layer.width,
          height: 'auto',
          opacity: layer.opacity,
          filter: filterVal,
          display: 'block',
          willChange: animate ? 'transform' : 'auto',
          // Static flip when not animating (reduced-motion)
          ...(!animate && layer.flipX ? { transform: 'scaleX(-1)' } : {}),
          ...(animate && animName
            ? {
                animation: `${animName} ${layer.duration}s ease-in-out ${layer.delay}s infinite`,
              }
            : {}),
        }

        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={layer.id}
            src={layer.src}
            alt=""
            role="presentation"
            draggable={false}
            style={style}
          />
        )
      })}
    </div>
  )
}
