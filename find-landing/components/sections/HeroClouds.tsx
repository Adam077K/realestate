'use client'

/**
 * HeroClouds — realistic transparent PNG cloud layer for the signature Hero.
 *
 * Visual layer: layered <img> elements built from SEVEN soft-edged transparent
 * cloud PNGs (cloud-1 … cloud-7) at varied sizes, spread across the FULL sky
 * (upper, mid, a denser bank along the lower horizon / building base) plus a set
 * of dedicated FOREGROUND coverage layers near the centre-bottom. Opacities are
 * clearly visible (these are real PNGs, not gradients) with depth cues: far masses
 * are bigger, softer, slightly blurred; near puffs are crisp. scaleX flips add
 * variety without extra assets.
 *
 * Scroll-driven COVERAGE (the fix):
 *  - As hero progress increases — especially the morph + wordmark beat
 *    (p 0.45 → 1.0) — MORE clouds are pulled INTO the foreground and DRIFT
 *    inward / UPWARD, increasingly covering and enveloping the building base and
 *    the lower wordmark. Foreground coverage layers ramp their opacity + scale +
 *    inward drift UP with progress (they do NOT fade out). By the wordmark beat
 *    the scene sits nestled in dense soft clouds (reference frames 7 / 9 / 10).
 *  - Each layer carries a `coverage` weight (0 = pure background, always visible;
 *    1 = foreground enveloper that blooms in on scroll). The rAF loop reads
 *    progressRef.current and, per layer, raises opacity, scale and an upward +
 *    inward translate proportional to its coverage weight and to progress.
 *  - Background clouds stay clearly VISIBLE the entire pin (they never fade out).
 *
 * Idle motion:
 *  - Continuous slow horizontal DRIFT via CSS @keyframes — desynced per layer
 *    (varied speed + negative delay) so the field is alive even when scroll idles.
 *  - Reduced motion / !active: clouds render STATICALLY at a mid-coverage rest
 *    state (still fully visible, building/wordmark already nestled in cloud).
 *
 * Performance: transform / opacity / filter only; will-change:transform on
 * drifting/coverage layers; pointer-events:none; aria-hidden. No layout thrash.
 *
 * z-index note: the parent (Hero.tsx) mounts this field at z-[1] which creates its
 * own stacking context BEHIND the z-10 wordmark, so coverage layers cannot paint
 * over the very top of the wordmark from here. They are concentrated at the
 * centre-bottom and bloom UP — matching the reference, where the densest cloud
 * mass rises from the lower edge to envelop the building base + lower wordmark.
 */

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export interface HeroCloudsProps {
  /** Shared scroll progress over the hero pin, 0 -> 1. Drives coverage ramp + drift. */
  progressRef?: RefObject<number>
  /** Master gate — when false the clouds render statically (no drift / live ramp). */
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
//  - width: CSS clamp string for the <img> element
//  - baseOpacity: opacity at rest (p = 0)
//  - blur: 0 (foreground / crisp) or 2–5px (far background masses only)
//  - flipX: true = scaleX(-1) for variety without extra assets
//  - anim: keyframe family (a = drifts right-and-up, b = left-and-down,
//          c = wider slow lateral drift) — varied speeds for parallax-of-speed feel
//  - duration / delay: idle drift tempo + desync
//  - coverage: 0..1 — how strongly this layer responds to scroll progress.
//      0  -> background, holds its position + full visibility the whole pin.
//      1  -> foreground enveloper: blooms in (opacity↑, scale↑, drifts up+inward)
//            as progress rises, peaking through the morph + wordmark beat.
//  - driftX: signed inward-drift bias (vw) applied at full coverage — negative
//      pulls toward centre from the right, positive from the left.

type AnimFamily = 'find-cloud-drift-a' | 'find-cloud-drift-b' | 'find-cloud-drift-c'

interface CloudLayer {
  id: string
  src: string
  top: string
  left: string
  width: string
  baseOpacity: number
  blur: number
  flipX?: boolean
  anim: AnimFamily
  duration: number
  delay: number
  coverage: number
  driftX: number
}

const LAYERS: CloudLayer[] = [
  // ════════ FAR BACK BAND (upper) — biggest, softest, slightly blurred ════════
  // Pure background: always visible, barely reacts to scroll.
  {
    id: 'far-1',
    src: SRC.c2,
    top: '-8%',
    left: '-16%',
    width: 'clamp(560px, 74vw, 1000px)',
    baseOpacity: 0.82,
    blur: 5,
    flipX: false,
    anim: 'find-cloud-drift-a',
    duration: 118,
    delay: 0,
    coverage: 0.06,
    driftX: 0,
  },
  {
    id: 'far-2',
    src: SRC.c3,
    top: '-6%',
    left: '46%',
    width: 'clamp(520px, 66vw, 940px)',
    baseOpacity: 0.8,
    blur: 4,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 132,
    delay: -34,
    coverage: 0.06,
    driftX: 0,
  },

  // ════════ UPPER SKY — large soft cumulus, light blur for mid-depth ══════════
  {
    id: 'up-1',
    src: SRC.c5,
    top: '0%',
    left: '12%',
    width: 'clamp(360px, 46vw, 760px)',
    baseOpacity: 0.86,
    blur: 2,
    flipX: false,
    anim: 'find-cloud-drift-c',
    duration: 104,
    delay: -52,
    coverage: 0.12,
    driftX: 1.5,
  },
  {
    id: 'up-2',
    src: SRC.c1,
    top: '6%',
    left: '60%',
    width: 'clamp(340px, 44vw, 720px)',
    baseOpacity: 0.84,
    blur: 2,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 112,
    delay: -18,
    coverage: 0.12,
    driftX: -1.5,
  },

  // ════════ MID SKY — crisp puffs that move IN toward the wordmark on scroll ═══
  {
    id: 'mid-1',
    src: SRC.c4,
    top: '20%',
    left: '-8%',
    width: 'clamp(320px, 42vw, 680px)',
    baseOpacity: 0.9,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-b',
    duration: 86,
    delay: -40,
    coverage: 0.34,
    driftX: 6,
  },
  {
    id: 'mid-2',
    src: SRC.c5,
    top: '24%',
    left: '56%',
    width: 'clamp(320px, 42vw, 660px)',
    baseOpacity: 0.88,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 92,
    delay: -12,
    coverage: 0.34,
    driftX: -6,
  },
  {
    id: 'mid-3',
    src: SRC.c4,
    top: '36%',
    left: '24%',
    width: 'clamp(300px, 38vw, 600px)',
    baseOpacity: 0.86,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-c',
    duration: 76,
    delay: -58,
    coverage: 0.4,
    driftX: 4,
  },
  {
    id: 'mid-4',
    src: SRC.c6,
    top: '30%',
    left: '78%',
    width: 'clamp(280px, 30vw, 460px)',
    baseOpacity: 0.88,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 80,
    delay: -26,
    coverage: 0.4,
    driftX: -5,
  },

  // ════════ LOWER HORIZON — billowy masses framing building shoulders ═════════
  // Strong coverage: these sweep up + inward to wrap the building shoulders.
  {
    id: 'low-1',
    src: SRC.c2,
    top: '54%',
    left: '-10%',
    width: 'clamp(440px, 60vw, 880px)',
    baseOpacity: 0.92,
    blur: 1,
    flipX: false,
    anim: 'find-cloud-drift-a',
    duration: 70,
    delay: -8,
    coverage: 0.62,
    driftX: 7,
  },
  {
    id: 'low-2',
    src: SRC.c3,
    top: '58%',
    left: '50%',
    width: 'clamp(420px, 56vw, 820px)',
    baseOpacity: 0.9,
    blur: 1,
    flipX: true,
    anim: 'find-cloud-drift-b',
    duration: 66,
    delay: -46,
    coverage: 0.62,
    driftX: -7,
  },

  // ════════ LOW CLOUD BANK — building base rises THROUGH this mist ════════════
  // Always near-solid; coverage rises so the bank thickens through the wordmark beat.
  {
    id: 'bank-1',
    src: SRC.c6,
    top: '74%',
    left: '-6%',
    width: 'clamp(460px, 64vw, 960px)',
    baseOpacity: 0.96,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-c',
    duration: 62,
    delay: -30,
    coverage: 0.74,
    driftX: 5,
  },
  {
    id: 'bank-2',
    src: SRC.c7,
    top: '78%',
    left: '34%',
    width: 'clamp(500px, 70vw, 1000px)',
    baseOpacity: 0.98,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 58,
    delay: -16,
    coverage: 0.74,
    driftX: -4,
  },
  {
    id: 'bank-3',
    src: SRC.c7,
    top: '84%',
    left: '4%',
    width: 'clamp(480px, 66vw, 940px)',
    baseOpacity: 1.0,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-b',
    duration: 54,
    delay: -42,
    coverage: 0.8,
    driftX: 3,
  },

  // ════════ FOREGROUND ENVELOPERS — bloom IN over the build + wordmark beat ════
  // At rest these sit low & faint (a thin mist along the bottom). As progress rises
  // (esp. p 0.45→1.0) they grow, brighten and drift UP + inward to roll over the
  // building base and the lower wordmark — the wordmark ends nestled in soft cloud
  // (reference frames 7 / 9 / 10). They are the densest, largest, crispest layers.
  {
    id: 'fg-1',
    src: SRC.c4,
    top: '60%',
    left: '-14%',
    width: 'clamp(560px, 78vw, 1180px)',
    baseOpacity: 0.16,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-c',
    duration: 64,
    delay: -20,
    coverage: 1,
    driftX: 9,
  },
  {
    id: 'fg-2',
    src: SRC.c5,
    top: '64%',
    left: '40%',
    width: 'clamp(540px, 74vw, 1120px)',
    baseOpacity: 0.16,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-a',
    duration: 60,
    delay: -38,
    coverage: 1,
    driftX: -9,
  },
  {
    id: 'fg-3',
    src: SRC.c7,
    top: '70%',
    left: '8%',
    width: 'clamp(620px, 86vw, 1320px)',
    baseOpacity: 0.2,
    blur: 0,
    flipX: false,
    anim: 'find-cloud-drift-b',
    duration: 56,
    delay: -10,
    coverage: 1,
    driftX: 6,
  },
  {
    id: 'fg-4',
    src: SRC.c4,
    top: '68%',
    left: '52%',
    width: 'clamp(520px, 72vw, 1080px)',
    baseOpacity: 0.18,
    blur: 0,
    flipX: true,
    anim: 'find-cloud-drift-c',
    duration: 52,
    delay: -28,
    coverage: 1,
    driftX: -6,
  },
]

// ── easing helpers (pure, transform/opacity only output) ──────────────────────
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
// smoothstep — soft ease-in-out, no overshoot
const smooth = (n: number) => {
  const x = clamp01(n)
  return x * x * (3 - 2 * x)
}

/**
 * Coverage ramp for a layer at a given scroll progress.
 * Returns opacity / scale / translateY(vh) / translateX(vw) deltas to layer on
 * top of the layer's base position. Higher `coverage` => stronger response, and
 * the response accelerates through the morph + wordmark beat (p 0.45 → 1.0).
 */
function coverageState(p: number, layer: CloudLayer) {
  // Early build (0 → 0.45): gentle warm-up so the field is already alive.
  const early = smooth(p / 0.45) // 0..1 by p=0.45
  // Main envelop beat (0.45 → 1.0): the bloom that covers the wordmark.
  const beat = smooth(clamp01((p - 0.45) / 0.55)) // 0..1 across 0.45..1.0

  // Combined progress for this layer, weighted by its coverage role.
  // Foreground layers (coverage~1) are dominated by the beat; background layers
  // (coverage~0) barely move at all.
  const ramp = clamp01(early * 0.28 + beat * 0.85) * layer.coverage

  // Opacity grows toward full as coverage ramps (capped at 1).
  const opacity = clamp01(layer.baseOpacity + (1 - layer.baseOpacity) * ramp)

  // Scale: foreground / billowy layers swell as they roll in.
  const scale = 1 + ramp * 0.42

  // Vertical: foreground/bank layers rise UP into the scene; faint background
  // layers stay put. Up to ~24vh of upward travel at full coverage.
  const translateY = -ramp * 24

  // Horizontal: inward drift toward centre (driftX is the signed bias).
  const translateX = layer.driftX * ramp

  return { opacity, scale, translateY, translateX }
}

export default function HeroClouds({ progressRef, active = true }: HeroCloudsProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<Array<HTMLImageElement | null>>([])
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

  // Coverage loop: per-layer opacity + scale + inward/upward drift ramp UP with
  // hero progress so clouds increasingly ENVELOP the building base + lower wordmark.
  useEffect(() => {
    const els = layerRefs.current
    if (els.length === 0) return

    // The per-layer coverage transform is written to CSS custom properties that
    // the keyframes read, so the idle drift animation (which owns `transform`)
    // and the scroll coverage can coexist without one clobbering the other.
    const apply = (p: number) => {
      for (let i = 0; i < LAYERS.length; i++) {
        const el = els[i]
        if (!el) continue
        const layer = LAYERS[i]
        const { opacity, scale, translateY, translateX } = coverageState(p, layer)
        el.style.opacity = opacity.toFixed(3)
        el.style.setProperty('--cov-scale', scale.toFixed(3))
        el.style.setProperty('--cov-ty', `${translateY.toFixed(2)}vh`)
        el.style.setProperty('--cov-tx', `${translateX.toFixed(2)}vw`)
      }
    }

    if (!animate) {
      // Static fallback — render at a mid-coverage rest state: clouds already
      // nestle the wordmark (matches the composed end-state), no live ramp.
      apply(0.62)
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
  }, [animate, progressRef])

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/*
        Drift keyframes — transform-only, GPU-composited. Three families + flips.
        Each keyframe COMPOSES the idle drift with the scroll-coverage transform
        carried by CSS vars (--cov-tx / --cov-ty / --cov-scale), so the live
        coverage ramp and the continuous drift never fight over `transform`.
        Defaults keep static (reduced-motion / pre-paint) layers at coverage rest.
      */}
      <style>{`
        @keyframes find-cloud-drift-a {
          0%   { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
          50%  { transform: translate3d(calc(var(--cov-tx,0) + 7vw), calc(var(--cov-ty,0) - 1.4vh), 0) scale(var(--cov-scale,1)); }
          100% { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
        }
        @keyframes find-cloud-drift-b {
          0%   { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
          50%  { transform: translate3d(calc(var(--cov-tx,0) - 6vw), calc(var(--cov-ty,0) + 1.2vh), 0) scale(var(--cov-scale,1)); }
          100% { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
        }
        @keyframes find-cloud-drift-c {
          0%   { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
          50%  { transform: translate3d(calc(var(--cov-tx,0) + 9vw), calc(var(--cov-ty,0) + 0.6vh), 0) scale(var(--cov-scale,1)); }
          100% { transform: translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
        }
        @keyframes find-cloud-drift-a-flip {
          0%   { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
          50%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) + 7vw), calc(var(--cov-ty,0) - 1.4vh), 0) scale(var(--cov-scale,1)); }
          100% { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
        }
        @keyframes find-cloud-drift-b-flip {
          0%   { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
          50%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) - 6vw), calc(var(--cov-ty,0) + 1.2vh), 0) scale(var(--cov-scale,1)); }
          100% { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
        }
        @keyframes find-cloud-drift-c-flip {
          0%   { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
          50%  { transform: scaleX(-1) translate3d(calc(var(--cov-tx,0) + 9vw), calc(var(--cov-ty,0) + 0.6vh), 0) scale(var(--cov-scale,1)); }
          100% { transform: scaleX(-1) translate3d(var(--cov-tx,0), var(--cov-ty,0), 0) scale(var(--cov-scale,1)); }
        }
      `}</style>

      {LAYERS.map((layer, i) => {
        // Build filter string — only blur on far/atmospheric layers; foreground crisp.
        const filterVal = layer.blur > 0 ? `blur(${layer.blur}px)` : 'none'

        // For flipped layers: use dedicated flip keyframes so scaleX(-1) stays
        // combined with the coverage transform (avoids a wrapper element).
        const animName = animate
          ? layer.flipX
            ? `${layer.anim}-flip`
            : layer.anim
          : undefined

        // Initial coverage rest values so the very first paint (before the rAF
        // loop runs / when static) already shows the field nestling the scene.
        const initial = coverageState(animate ? 0 : 0.62, layer)

        const style: CSSProperties = {
          position: 'absolute',
          top: layer.top,
          left: layer.left,
          width: layer.width,
          height: 'auto',
          // opacity is driven imperatively by the rAF loop; seed it here.
          opacity: initial.opacity,
          filter: filterVal,
          display: 'block',
          willChange: animate ? 'transform, opacity' : 'auto',
          // Seed the coverage CSS vars consumed by the keyframes (and the static
          // transform below).
          // @ts-expect-error — CSS custom properties are valid inline styles.
          '--cov-scale': initial.scale.toFixed(3),
          '--cov-ty': `${initial.translateY.toFixed(2)}vh`,
          '--cov-tx': `${initial.translateX.toFixed(2)}vw`,
          ...(animate && animName
            ? {
                animation: `${animName} ${layer.duration}s ease-in-out ${layer.delay}s infinite`,
              }
            : {
                // Static (reduced-motion): compose flip + coverage rest transform.
                transform: `${layer.flipX ? 'scaleX(-1) ' : ''}translate3d(${initial.translateX.toFixed(2)}vw, ${initial.translateY.toFixed(2)}vh, 0) scale(${initial.scale.toFixed(3)})`,
              }),
        }

        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={layer.id}
            ref={(node) => {
              layerRefs.current[i] = node
            }}
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
