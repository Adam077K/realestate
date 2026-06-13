'use client'

/**
 * HeroClouds — realistic transparent PNG cloud layer for the signature Hero.
 *
 * Visual layer: 13 <img> layers built from SEVEN soft-edged transparent cloud
 * PNGs (cloud-1 … cloud-7) at varied sizes (~280px → ~1000px), positions spread
 * across the FULL sky (upper, mid, and a denser bank along the lower horizon /
 * building base), opacities 0.78–1.0 (clearly visible — these are real PNGs, not
 * gradients), with depth cues: far masses are bigger, softer, slightly blurred;
 * near puffs are crisp. scaleX flips add variety without extra assets.
 *
 * A dedicated LOW CLOUD BANK (cloud-6 / cloud-7 stratus) sits along the bottom so
 * the building reads as rising THROUGH the clouds, like the reference frames
 * (mist at the base, clouds wrapping the wordmark beat).
 *
 * Motion:
 *  - Continuous slow horizontal DRIFT via CSS @keyframes — desynced per layer
 *    (varied speed + negative delay) so the field is alive even when scroll idles.
 *  - Scroll parallax driven by `progressRef`: a rAF loop reads progressRef.current
 *    and gently lifts the whole field UP. Clouds stay clearly VISIBLE through the
 *    ENTIRE pin — the FIND wordmark beat floats IN the clouds — with only a slight
 *    thinning past p > 0.95 as the pin releases (never a fade-to-nothing).
 *  - Reduced motion / !active: clouds render STATICALLY (still fully visible).
 *
 * Performance: transform / opacity / filter only; will-change:transform on
 * drifting layers; pointer-events:none; aria-hidden. No layout thrash.
 */

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export interface HeroCloudsProps {
  /** Shared scroll progress over the hero pin, 0 -> 1. Drives parallax + slight thin. */
  progressRef?: RefObject<number>
  /** Master gate — when false the clouds render statically (no drift / parallax). */
  active?: boolean
}

// ─── PNG sources (served from /public) — all SEVEN realistic clouds ───────────
const SRC = {
  c1: '/images/clouds/cloud-1.png', // 1024×546  — wide soft grey stratus band
  c2: '/images/clouds/cloud-2.png', // 1400×941  — large faint atmospheric mass
  c3: '/images/clouds/cloud-3.png', // 1500×811  — large faint atmospheric mass
  c4: '/images/clouds/cloud-4.png', // 1600×1038 — soft white cumulus puff
  c5: '/images/clouds/cloud-5.png', // 1379×994  — bright bluish cumulus tower
  c6: '/images/clouds/cloud-6.png', // 1260×605  — low flat stratus
  c7: '/images/clouds/cloud-7.png', // 1653×906  — wide wispy low mist (bluish)
} as const

// ─── Cloud layer definitions ──────────────────────────────────────────────────
// Layout logic:
//  - top/left: position relative to the hero viewport
//  - width: CSS clamp string for the <img> element (~280px → ~1000px range)
//  - opacity: 0.78–1.0 — real pngs, clearly visible (not faint)
//  - blur: 0 (foreground / crisp) or 2–5px (far background masses only)
//  - flipX: true = scaleX(-1) for variety without extra assets
//  - anim: keyframe family (a = drifts right-and-up, b = drifts left-and-down,
//          c = wider slow lateral drift) — varied speeds for parallax-of-speed feel
//  - delay: negative delay to start mid-cycle (desync between layers)

type AnimFamily = 'find-cloud-drift-a' | 'find-cloud-drift-b' | 'find-cloud-drift-c'

interface CloudLayer {
  id: string
  src: string
  top: string
  left: string
  width: string
  opacity: number
  blur: number
  flipX?: boolean
  anim: AnimFamily
  duration: number
  delay: number
}

const LAYERS: CloudLayer[] = [
  // ════════ FAR BACK BAND (upper) — biggest, softest, slightly blurred ════════
  {
    id: 'far-1',
    src: SRC.c2,
    top: '-8%',
    left: '-16%',
    width: 'clamp(560px, 74vw, 1000px)',
    opacity: 0.82,
    blur: 5,
    flipX: false,
    anim: 'find-cloud-drift-a',
    duration: 118,
    delay: 0,
  },
  {
    id: 'far-2',
    src: SRC.c3,
    top: '-6%',
    left: '46%',
    width: 'clamp(520px, 66vw, 940px)',
    opacity: 0.8,
    blur: 4,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 132,
    delay: -34,
  },

  // ════════ UPPER SKY — large soft cumulus, light blur for mid-depth ══════════
  {
    id: 'up-1',
    src: SRC.c5,
    top: '0%',
    left: '12%',
    width: 'clamp(360px, 46vw, 760px)',
    opacity: 0.86,
    blur: 2,
    flipX: false,
    anim: 'find-cloud-drift-c',
    duration: 104,
    delay: -52,
  },
  {
    id: 'up-2',
    src: SRC.c1,
    top: '6%',
    left: '60%',
    width: 'clamp(340px, 44vw, 720px)',
    opacity: 0.84,
    blur: 2,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 112,
    delay: -18,
  },

  // ════════ MID SKY — crisp foreground puffs (the wordmark-beat zone) ═════════
  {
    id: 'mid-1',
    src: SRC.c4,
    top: '20%',
    left: '-8%',
    width: 'clamp(320px, 42vw, 680px)',
    opacity: 0.92,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-b',
    duration: 86,
    delay: -40,
  },
  {
    id: 'mid-2',
    src: SRC.c5,
    top: '24%',
    left: '56%',
    width: 'clamp(320px, 42vw, 660px)',
    opacity: 0.9,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 92,
    delay: -12,
  },
  {
    id: 'mid-3',
    src: SRC.c4,
    top: '36%',
    left: '24%',
    width: 'clamp(300px, 38vw, 600px)',
    opacity: 0.88,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-c',
    duration: 76,
    delay: -58,
  },
  {
    id: 'mid-4',
    src: SRC.c6,
    top: '30%',
    left: '78%',
    width: 'clamp(280px, 30vw, 460px)',
    opacity: 0.9,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 80,
    delay: -26,
  },

  // ════════ LOWER HORIZON — billowy masses framing building shoulders ═════════
  {
    id: 'low-1',
    src: SRC.c2,
    top: '54%',
    left: '-10%',
    width: 'clamp(440px, 60vw, 880px)',
    opacity: 0.94,
    blur: 1,
    flipX: false,
    anim: 'find-cloud-drift-a',
    duration: 70,
    delay: -8,
  },
  {
    id: 'low-2',
    src: SRC.c3,
    top: '58%',
    left: '50%',
    width: 'clamp(420px, 56vw, 820px)',
    opacity: 0.92,
    blur: 1,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 66,
    delay: -46,
  },

  // ════════ LOW CLOUD BANK — building base rises THROUGH this mist ════════════
  {
    id: 'bank-1',
    src: SRC.c6,
    top: '74%',
    left: '-6%',
    width: 'clamp(460px, 64vw, 960px)',
    opacity: 0.98,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-c',
    duration: 62,
    delay: -30,
  },
  {
    id: 'bank-2',
    src: SRC.c7,
    top: '78%',
    left: '34%',
    width: 'clamp(500px, 70vw, 1000px)',
    opacity: 1.0,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 58,
    delay: -16,
  },
  {
    id: 'bank-3',
    src: SRC.c7,
    top: '84%',
    left: '4%',
    width: 'clamp(480px, 66vw, 940px)',
    opacity: 1.0,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-b',
    duration: 54,
    delay: -42,
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

  // Scroll parallax loop: the whole field lifts gently as hero progress 0 -> 1.
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
      // Clouds stay VISIBLE through the ENTIRE hero pin — the wordmark beat floats
      // IN the clouds (reference frames 8-11). They drift/parallax gently UP as the
      // building rises and the wordmark forms, but never fade to nothing mid-scroll.
      const parallaxLift = p * 10 // vh, gentle steady rise across the pin
      const exitLift = Math.max(0, (p - 0.86) / 0.14) * 14 // vh, only at the very end
      const liftVh = parallaxLift + exitLift

      // Opacity: hold FULL visibility through the build AND the wordmark beat. Only a
      // very slight thinning past p>0.95 (never a fade-to-nothing earlier).
      const fade = 1 - Math.max(0, (p - 0.95) / 0.05) * 0.4
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
      {/* Drift keyframes — transform-only, GPU-composited. Three families + flips. */}
      <style>{`
        @keyframes find-cloud-drift-a {
          0%   { transform: translate3d(0, 0, 0); }
          50%  { transform: translate3d(7vw, -1.4vh, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-b {
          0%   { transform: translate3d(0, 0, 0); }
          50%  { transform: translate3d(-6vw, 1.2vh, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-c {
          0%   { transform: translate3d(0, 0, 0); }
          50%  { transform: translate3d(9vw, 0.6vh, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-a-flip {
          0%   { transform: scaleX(-1) translate3d(0, 0, 0); }
          50%  { transform: scaleX(-1) translate3d(7vw, -1.4vh, 0); }
          100% { transform: scaleX(-1) translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-b-flip {
          0%   { transform: scaleX(-1) translate3d(0, 0, 0); }
          50%  { transform: scaleX(-1) translate3d(-6vw, 1.2vh, 0); }
          100% { transform: scaleX(-1) translate3d(0, 0, 0); }
        }
        @keyframes find-cloud-drift-c-flip {
          0%   { transform: scaleX(-1) translate3d(0, 0, 0); }
          50%  { transform: scaleX(-1) translate3d(9vw, 0.6vh, 0); }
          100% { transform: scaleX(-1) translate3d(0, 0, 0); }
        }
      `}</style>

      {LAYERS.map((layer) => {
        // Build filter string — only blur on far/atmospheric layers; foreground crisp.
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
