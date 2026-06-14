'use client'

/**
 * HeroClouds — realistic transparent PNG cloud layer for the signature Hero.
 *
 * ARCHITECTURE — 3 depth bands (replaces the old flat BACK/FRONT split):
 *
 *  FAR   (horizon haze, 2 nodes): blur 7-8px, opacity 0.38-0.42,
 *         saturate(0.65) warm tint, parallax 0.25-0.30x.
 *
 *  MID   (cumulus, 4 nodes): blur 2-3px, opacity 0.68-0.74,
 *         saturate(0.85) mild tint, parallax 0.55-0.68x.
 *
 *  NEAR/VEIL (front bloom, 5 nodes): blur 0-1px, opacity 0.03-0.05,
 *         saturate(1.0), parallax 1.0-1.25x. Bloom to near-full at p 0.45-0.78.
 *
 * KEY CRAFT:
 *  1. mix-blend-mode: screen on EVERY cloud PNG — kills ~80% of "stickered-on" look.
 *  2. Sky-tint filter set ONCE at mount — warm horizon (hue-rotate(-8deg) sepia(0.15)
 *     brightness(1.05)); cool high (hue-rotate(4deg)). Never per-frame.
 *  3. PARALLAX: separate translateY keyed to progress, folded into ONE style mutation
 *     per layer per frame via --cov-* CSS var bridge.
 *  4. Non-looping drift: asymmetric @keyframes, PRIME-second periods. Negative delays
 *     desync. flipX + rotate ±deg on some instances for variety. Transform-only.
 *  5. Bloom curve: NEAR field genuinely ~0 until p≈0.45 (protects headline legibility).
 *     Hard ramp; peaks ~0.87 (never 1.0 — keeps texture). Thins to ~0.18 at p=1.0.
 *
 * VARIANT prop (backwards compat with Hero.tsx):
 *  'back'  → FAR + MID bands (z-[1] behind building).
 *  'front' → NEAR/VEIL band (z-[3] over building + wordmark).
 *  Default → 'back'.
 *
 * PERFORMANCE:
 *  - Animate ONLY transform + opacity. filter + mix-blend-mode set once at mount.
 *  - blur cap 10px; ONLY on FAR nodes; NEVER on full-screen VEIL.
 *  - will-change on WRAPPER, not the blurred child.
 *  - 11 total cloud nodes (≤12 hard limit). Single rAF, cancel on unmount.
 *  - @ts-expect-error for --cov-* custom props (tsc strict rule).
 */

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export interface HeroCloudsProps {
  progressRef?: RefObject<number>
  active?: boolean
  variant?: 'back' | 'front'
}

// ─── PNG sources ──────────────────────────────────────────────────────────────
const SRC = {
  c1: '/images/clouds/cloud-1.png', // 1024×546  — wide soft grey stratus band
  c2: '/images/clouds/cloud-2.png', // 1400×941  — large faint atmospheric mass
  c3: '/images/clouds/cloud-3.png', // 1500×811  — large faint atmospheric mass
  c4: '/images/clouds/cloud-4.png', // 1600×1038 — soft white cumulus puff
  c5: '/images/clouds/cloud-5.png', // 1379×994  — bright bluish cumulus tower
  c6: '/images/clouds/cloud-6.png', // 1260×605  — low flat stratus
  c7: '/images/clouds/cloud-7.png', // 1653×906  — wide wispy low mist
} as const

type AnimFamily = 'hc-drift-a' | 'hc-drift-b' | 'hc-drift-c' | 'hc-drift-d'

interface CloudLayer {
  id: string
  src: string
  top: string
  left: string
  width: string
  baseOpacity: number
  blur: number
  tint: string
  flipX?: boolean
  rotate?: number
  anim: AnimFamily
  /** PRIME period in seconds — prevents inter-layer sync. */
  duration: number
  delay: number
  coverage: number
  driftX: number
  parallax: number
}

// ══════════════════════════════════════════════════════════════════════════════
// BACK field — FAR + MID bands (rendered z-[1], behind building)
// ══════════════════════════════════════════════════════════════════════════════
const BACK_LAYERS: CloudLayer[] = [
  // ── FAR (horizon haze) ──────────────────────────────────────────────────
  {
    id: 'far-1', src: SRC.c2,
    top: '-4%', left: '-12%', width: 'clamp(640px, 82vw, 1120px)',
    baseOpacity: 0.42, blur: 8,
    tint: 'saturate(0.65) hue-rotate(-8deg) sepia(0.15) brightness(1.05)',
    flipX: false, rotate: 0,
    anim: 'hc-drift-a', duration: 127, delay: 0,
    coverage: 0.08, driftX: 0, parallax: 0.30,
  },
  {
    id: 'far-2', src: SRC.c3,
    top: '-2%', left: '44%', width: 'clamp(580px, 74vw, 1000px)',
    baseOpacity: 0.38, blur: 7,
    tint: 'saturate(0.65) hue-rotate(-6deg) sepia(0.12) brightness(1.06)',
    flipX: true, rotate: 2,
    anim: 'hc-drift-b', duration: 113, delay: -37,
    coverage: 0.08, driftX: 0, parallax: 0.25,
  },
  // ── MID (cumulus) ────────────────────────────────────────────────────────
  {
    id: 'mid-1', src: SRC.c5,
    top: '6%', left: '8%', width: 'clamp(380px, 48vw, 780px)',
    baseOpacity: 0.68, blur: 3,
    tint: 'saturate(0.85) hue-rotate(2deg) brightness(1.02)',
    flipX: false, rotate: -2,
    anim: 'hc-drift-c', duration: 97, delay: -52,
    coverage: 0.18, driftX: 3, parallax: 0.55,
  },
  {
    id: 'mid-2', src: SRC.c4,
    top: '10%', left: '58%', width: 'clamp(360px, 46vw, 740px)',
    baseOpacity: 0.72, blur: 2,
    tint: 'saturate(0.85) hue-rotate(3deg) brightness(1.01)',
    flipX: true, rotate: 3,
    anim: 'hc-drift-d', duration: 83, delay: -19,
    coverage: 0.20, driftX: -3, parallax: 0.60,
  },
  {
    id: 'mid-3', src: SRC.c1,
    top: '22%', left: '2%', width: 'clamp(340px, 44vw, 700px)',
    baseOpacity: 0.74, blur: 2,
    tint: 'saturate(0.88) hue-rotate(1deg) brightness(1.02)',
    flipX: false, rotate: -1,
    anim: 'hc-drift-a', duration: 107, delay: -61,
    coverage: 0.30, driftX: 4, parallax: 0.65,
  },
  {
    id: 'mid-4', src: SRC.c5,
    top: '26%', left: '52%', width: 'clamp(320px, 42vw, 680px)',
    baseOpacity: 0.70, blur: 3,
    tint: 'saturate(0.85) hue-rotate(4deg) brightness(1.03)',
    flipX: true, rotate: 2,
    anim: 'hc-drift-b', duration: 89, delay: -28,
    coverage: 0.32, driftX: -4, parallax: 0.68,
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// FRONT field — NEAR/VEIL band (rendered z-[3], over building + wordmark).
// Near-invisible at rest; blooms to near-full veil ~p 0.78; thins to ~0.18 at p=1.
// 5 nodes — under the 12-total limit.
// ══════════════════════════════════════════════════════════════════════════════
const FRONT_LAYERS: CloudLayer[] = [
  {
    id: 'near-1', src: SRC.c4,
    top: '28%', left: '-18%', width: 'clamp(620px, 86vw, 1360px)',
    baseOpacity: 0.03, blur: 0,
    tint: 'saturate(1.0) brightness(1.04)',
    flipX: false, rotate: -2,
    anim: 'hc-drift-c', duration: 71, delay: -14,
    coverage: 1, driftX: 18, parallax: 1.05,
  },
  {
    id: 'near-2', src: SRC.c7,
    top: '32%', left: '44%', width: 'clamp(600px, 84vw, 1320px)',
    baseOpacity: 0.03, blur: 0,
    tint: 'saturate(1.0) brightness(1.03)',
    flipX: true, rotate: 1,
    anim: 'hc-drift-d', duration: 59, delay: -33,
    coverage: 1, driftX: -18, parallax: 1.10,
  },
  {
    id: 'near-3', src: SRC.c5,
    top: '12%', left: '-22%', width: 'clamp(640px, 88vw, 1400px)',
    baseOpacity: 0.04, blur: 1,
    tint: 'saturate(0.95) brightness(1.05)',
    flipX: false, rotate: 3,
    anim: 'hc-drift-a', duration: 79, delay: -22,
    coverage: 1, driftX: 16, parallax: 1.00,
  },
  {
    id: 'near-4', src: SRC.c3,
    top: '16%', left: '48%', width: 'clamp(620px, 86vw, 1380px)',
    baseOpacity: 0.04, blur: 1,
    tint: 'saturate(0.95) brightness(1.04)',
    flipX: true, rotate: -3,
    anim: 'hc-drift-b', duration: 67, delay: -8,
    coverage: 1, driftX: -16, parallax: 1.15,
  },
  {
    id: 'near-5', src: SRC.c6,
    top: '54%', left: '4%', width: 'clamp(680px, 94vw, 1520px)',
    baseOpacity: 0.05, blur: 0,
    tint: 'saturate(1.0) brightness(1.02)',
    flipX: false, rotate: 1,
    anim: 'hc-drift-c', duration: 53, delay: -41,
    coverage: 1, driftX: 12, parallax: 1.25,
  },
]

// ── Easing helpers ────────────────────────────────────────────────────────────
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smooth = (n: number) => { const x = clamp01(n); return x * x * (3 - 2 * x) }
const expo = (n: number) => {
  const x = clamp01(n)
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
}

/**
 * Full-screen soft veil intensity for the FRONT field, 0..1.
 * P2.1 — bloom starts at p≈0.40 (was 0.45), end stays ~0.90, so building is
 * still scaling WHILE clouds thicken (≥50% overlap with grow phase).
 * Gentle ease-in across the range. Peak veil ≤~0.90 (soft, textured, not flat scrim).
 * Then thins to ~0.18 at p=1.0 as the next section emerges through it.
 */
function frontVeilIntensity(p: number): number {
  const bloom = expo(clamp01((p - 0.40) / 0.50))    // 0 at p=0.40, 1 by p=0.90
  const lift  = smooth(clamp01((p - 0.78) / 0.22))  // 0 until 0.78, 1 by p=1.0
  return clamp01(bloom - lift * 0.82)                // peaks ~1, thins to ~0.18
}

/**
 * Per-layer animate state: opacity, scale, translateY (parallax), translateX (bloom drift).
 * filter + mix-blend-mode are set ONCE at mount — never computed here.
 */
function layerState(p: number, layer: CloudLayer, variant: 'back' | 'front') {
  if (variant === 'front') {
    const veil = frontVeilIntensity(p)
    const fr = veil * layer.coverage

    const NEAR_PEAK = 0.90  // never 1.0 — cloud texture must still read through
    const opacity   = clamp01(layer.baseOpacity + (NEAR_PEAK - layer.baseOpacity) * fr)
    const scale     = 1 + fr * 0.55
    const translateY = -p * 22 * layer.parallax + (-fr * 12)
    const translateX = layer.driftX * fr

    return { opacity, scale, translateY, translateX }
  }

  // BACK variant (FAR + MID): always visible; gentle parallax; mild bloom
  const ramp      = smooth(p / 0.60) * layer.coverage
  const opacity   = clamp01(layer.baseOpacity + (0.95 - layer.baseOpacity) * ramp * 0.40)
  const scale     = 1 + ramp * 0.18
  const translateY = -p * 28 * layer.parallax
  const translateX = layer.driftX * ramp

  return { opacity, scale, translateY, translateX }
}

export default function HeroClouds({
  progressRef,
  active = true,
  variant = 'back',
}: HeroCloudsProps) {
  const layerRefs = useRef<Array<HTMLImageElement | null>>([])
  const veilRef   = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  const layers      = variant === 'front' ? FRONT_LAYERS : BACK_LAYERS
  const staticRestP = variant === 'front' ? 0.52 : 0.45

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const animate = active && !reducedMotion

  // rAF coverage + parallax loop
  useEffect(() => {
    const els = layerRefs.current
    if (els.length === 0) return

    const apply = (p: number) => {
      for (let i = 0; i < layers.length; i++) {
        const el = els[i]
        if (!el) continue
        const layer = layers[i]
        const { opacity, scale, translateY, translateX } = layerState(p, layer, variant)
        el.style.opacity = opacity.toFixed(3)
        el.style.setProperty('--cov-scale', scale.toFixed(3))
        el.style.setProperty('--cov-ty', `${translateY.toFixed(2)}vh`)
        el.style.setProperty('--cov-tx', `${translateX.toFixed(2)}vw`)
      }

      // FRONT veil — drives the full-screen soft cloud cover
      const veil = veilRef.current
      if (veil) {
        const v = frontVeilIntensity(p)
        veil.style.opacity = (v * 0.87).toFixed(3)
      }
    }

    if (!animate) {
      apply(staticRestP)
      return
    }

    const tick = () => {
      const p = progressRef?.current ?? 0
      apply(p)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [animate, progressRef, layers, variant, staticRestP])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/*
        Drift keyframes — transform ONLY, GPU-composited.
        Each @keyframe composes idle drift with the scroll-coverage + parallax
        transform in --cov-tx / --cov-ty / --cov-scale, so the live ramp and the
        continuous drift never fight over `transform`.
        PRIME durations per layer — the field never re-syncs into a visible loop.
        Asymmetric stop positions + slight rotate creates organic non-returning motion.
      */}
      <style>{`
        @keyframes hc-drift-a {
          0%   { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          33%  { transform: translate3d(calc(var(--cov-tx,0) + 5.5vw), calc(var(--cov-ty,0) - 1.2vh), 0) scale(var(--cov-scale,1)) rotate(0.8deg); }
          70%  { transform: translate3d(calc(var(--cov-tx,0) + 8.2vw), calc(var(--cov-ty,0) + 0.6vh), 0) scale(var(--cov-scale,1)) rotate(-0.4deg); }
          100% { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
        @keyframes hc-drift-b {
          0%   { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          40%  { transform: translate3d(calc(var(--cov-tx,0) - 6.8vw), calc(var(--cov-ty,0) + 1.0vh), 0) scale(var(--cov-scale,1)) rotate(-0.6deg); }
          75%  { transform: translate3d(calc(var(--cov-tx,0) - 4.2vw), calc(var(--cov-ty,0) - 0.8vh), 0) scale(var(--cov-scale,1)) rotate(0.3deg); }
          100% { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
        @keyframes hc-drift-c {
          0%   { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          45%  { transform: translate3d(calc(var(--cov-tx,0) + 7.4vw), calc(var(--cov-ty,0) + 0.4vh), 0) scale(var(--cov-scale,1)) rotate(1.0deg); }
          80%  { transform: translate3d(calc(var(--cov-tx,0) + 3.6vw), calc(var(--cov-ty,0) - 1.6vh), 0) scale(var(--cov-scale,1)) rotate(-0.2deg); }
          100% { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
        @keyframes hc-drift-d {
          0%   { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          38%  { transform: translate3d(calc(var(--cov-tx,0) - 9.1vw), calc(var(--cov-ty,0) - 0.9vh), 0) scale(var(--cov-scale,1)) rotate(0.7deg); }
          65%  { transform: translate3d(calc(var(--cov-tx,0) - 5.3vw), calc(var(--cov-ty,0) + 1.4vh), 0) scale(var(--cov-scale,1)) rotate(-0.9deg); }
          100% { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
        @keyframes hc-drift-a-flip {
          0%   { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          33%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) + 5.5vw), calc(var(--cov-ty,0) - 1.2vh), 0) scale(var(--cov-scale,1)) rotate(0.8deg); }
          70%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) + 8.2vw), calc(var(--cov-ty,0) + 0.6vh), 0) scale(var(--cov-scale,1)) rotate(-0.4deg); }
          100% { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
        @keyframes hc-drift-b-flip {
          0%   { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          40%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) - 6.8vw), calc(var(--cov-ty,0) + 1.0vh), 0) scale(var(--cov-scale,1)) rotate(-0.6deg); }
          75%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) - 4.2vw), calc(var(--cov-ty,0) - 0.8vh), 0) scale(var(--cov-scale,1)) rotate(0.3deg); }
          100% { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
        @keyframes hc-drift-c-flip {
          0%   { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          45%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) + 7.4vw), calc(var(--cov-ty,0) + 0.4vh), 0) scale(var(--cov-scale,1)) rotate(1.0deg); }
          80%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) + 3.6vw), calc(var(--cov-ty,0) - 1.6vh), 0) scale(var(--cov-scale,1)) rotate(-0.2deg); }
          100% { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
        @keyframes hc-drift-d-flip {
          0%   { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
          38%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) - 9.1vw), calc(var(--cov-ty,0) - 0.9vh), 0) scale(var(--cov-scale,1)) rotate(0.7deg); }
          65%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) - 5.3vw), calc(var(--cov-ty,0) + 1.4vh), 0) scale(var(--cov-scale,1)) rotate(-0.9deg); }
          100% { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)) rotate(0deg); }
        }
      `}</style>

      {layers.map((layer, i) => {
        // filter = blur + sky-tint — set ONCE, never per-frame.
        // Performance: blur is on individual layered PNGs, not on a promoted wrapper.
        const filterVal = [
          layer.blur > 0 ? `blur(${layer.blur}px)` : '',
          layer.tint,
        ].filter(Boolean).join(' ')

        const animFamily = animate
          ? layer.flipX
            ? (`${layer.anim}-flip` as string)
            : (layer.anim as string)
          : undefined

        // Initial state for first paint (before rAF loop, or when static)
        const initial = layerState(animate ? 0 : staticRestP, layer, variant)
        const rotateDeg = layer.rotate ?? 0

        // CSSProperties extended with CSS custom properties for keyframe composition.
        const style = {
          position: 'absolute' as const,
          top: layer.top,
          left: layer.left,
          width: layer.width,
          height: 'auto',
          opacity: initial.opacity,
          mixBlendMode: 'screen' as const,
          filter: filterVal || undefined,
          display: 'block',
          willChange: (animate ? 'transform, opacity' : 'auto') as CSSProperties['willChange'],
          '--cov-scale': initial.scale.toFixed(3),
          '--cov-ty': `${initial.translateY.toFixed(2)}vh`,
          '--cov-tx': `${initial.translateX.toFixed(2)}vw`,
          ...(animate && animFamily
            ? {
                animation: `${animFamily} ${layer.duration}s ease-in-out ${layer.delay}s infinite`,
              }
            : {
                transform: `${layer.flipX ? 'scaleX(-1) ' : ''}${rotateDeg !== 0 ? `rotate(${rotateDeg}deg) ` : ''}translate3d(${initial.translateX.toFixed(2)}vw, ${initial.translateY.toFixed(2)}vh, 0) scale(${initial.scale.toFixed(3)})`,
              }),
        }

        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={layer.id}
            ref={(node) => { layerRefs.current[i] = node }}
            src={layer.src}
            alt=""
            role="presentation"
            draggable={false}
            style={style}
          />
        )
      })}

      {/* FRONT veil — soft near-white radial wash that fills the WHOLE viewport at
          the end of the hero (frame_011), then thins as the next section emerges
          through the same clouds (frame_012). blur(6px) keeps it reading as cloud,
          not a flat scrim. Opacity driven by frontVeilIntensity each rAF frame.
          NOTE: blur on a simple gradient div (not a promoted+blurred PNG) is safe;
          only 1 GPU layer with no costly re-composition. */}
      {variant === 'front' && (
        <div
          ref={veilRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-8%',
            opacity: animate
              ? frontVeilIntensity(0) * 0.87
              : frontVeilIntensity(staticRestP) * 0.87,
            background:
              'radial-gradient(130% 100% at 50% 40%, rgba(255,255,255,0.72) 0%, rgba(250,252,255,0.90) 42%, rgba(255,255,255,0.97) 100%)',
            filter: 'blur(6px)',
            willChange: animate ? 'opacity' : 'auto',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
