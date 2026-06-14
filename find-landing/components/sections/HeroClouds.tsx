'use client'

/**
 * HeroClouds — realistic transparent PNG cloud layer for the signature Hero.
 *
 * TWO variants, selected by the `variant` prop:
 *
 *  • variant="back" (default) — the original full-sky field. Layered <img> elements
 *    built from SEVEN soft-edged transparent cloud PNGs (cloud-1 … cloud-7) at varied
 *    sizes, spread across the FULL sky (upper, mid, a denser bank along the lower
 *    horizon / building base) plus a set of dedicated FOREGROUND coverage layers near
 *    the centre-bottom. Mounted at z-[1] BEHIND the building/wordmark, so it envelops
 *    the scene from behind / below. Unchanged from before.
 *
 *  • variant="front" — ONLY a set of soft, semi-transparent FOREGROUND drifting cloud
 *    layers (the larger realistic cloud PNGs), transparent everywhere else. This field
 *    is mounted ABOVE the building (z-[2]) and the wordmark (z-[3]) by Hero.tsx, so its
 *    clouds visibly drift IN FRONT of the building and over/around the wordmark. At rest
 *    (p≈0) it is nearly invisible (so it never blocks the headline); its opacity, scale
 *    and cross-screen inward drift RAMP UP with progress — especially p 0.45→1.0 — so
 *    soft cloud sweeps across the centre, increasingly covering the building/wordmark and
 *    nestling it in mist by the wordmark beat (reference frames 7 / 9 / 10).
 *
 * Opacities are clearly visible (these are real PNGs, not gradients) with depth cues:
 * far masses are bigger, softer, slightly blurred; near puffs are crisp. scaleX flips
 * add variety without extra assets.
 *
 * Scroll-driven COVERAGE (the fix):
 *  - As hero progress increases — especially the morph + wordmark beat (p 0.45 → 1.0) —
 *    MORE clouds are pulled INTO the foreground and DRIFT inward / UPWARD, increasingly
 *    covering and enveloping the scene. Foreground coverage layers ramp their opacity +
 *    scale + inward drift UP with progress (they do NOT fade out). By the wordmark beat
 *    the scene sits nestled in dense soft clouds (reference frames 7 / 9 / 10).
 *  - Each layer carries a `coverage` weight (0 = pure background, always visible;
 *    1 = foreground enveloper that blooms in on scroll). The rAF loop reads
 *    progressRef.current and, per layer, raises opacity, scale and an upward + inward
 *    translate proportional to its coverage weight and to progress.
 *  - 'back' background clouds stay clearly VISIBLE the entire pin (they never fade out).
 *  - 'front' layers START near-invisible (so the headline is readable at rest) and bloom
 *    in only as the user scrolls.
 *
 * Idle motion:
 *  - Continuous slow horizontal DRIFT via CSS @keyframes — desynced per layer
 *    (varied speed + negative delay) so the field is alive even when scroll idles.
 *  - Reduced motion / !active:
 *      back  -> renders STATICALLY at a mid-coverage rest state (still fully visible).
 *      front -> renders a LIGHT static veil (low opacity, not fully blocking) so the
 *               scene still reads as nestled-in-cloud without obscuring the headline.
 *
 * Performance: transform / opacity / filter only; will-change:transform on
 * drifting/coverage layers; pointer-events:none; aria-hidden. No layout thrash.
 */

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export interface HeroCloudsProps {
  /** Shared scroll progress over the hero pin, 0 -> 1. Drives coverage ramp + drift. */
  progressRef?: RefObject<number>
  /** Master gate — when false the clouds render statically (no drift / live ramp). */
  active?: boolean
  /**
   * Which cloud field to render.
   *  - 'back'  (default) — the original full background + bottom-envelope field.
   *      Mounted BEHIND the building/wordmark; envelops the scene from behind/below.
   *  - 'front' — ONLY a set of soft foreground drifting clouds, transparent everywhere
   *      else. Mounted ABOVE the building + wordmark so it visibly drifts IN FRONT of
   *      them. Near-invisible at rest; opacity + scale + cross-screen drift RAMP UP with
   *      progress (esp. p 0.45→1.0) so it sweeps over the centre, nestling the
   *      building/wordmark in mist by the wordmark beat (reference frames 7/9/10).
   */
  variant?: 'back' | 'front'
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

// ════════════════════════════════════════════════════════════════════════════
// BACK field — the original full-sky + bottom-envelope layers (unchanged look).
// ════════════════════════════════════════════════════════════════════════════
const BACK_LAYERS: CloudLayer[] = [
  // FAR BACK BAND (upper) — biggest, softest, slightly blurred. Pure background.
  { id: 'far-1', src: SRC.c2, top: '-8%', left: '-16%', width: 'clamp(560px, 74vw, 1000px)', baseOpacity: 0.82, blur: 5, flipX: false, anim: 'find-cloud-drift-a', duration: 118, delay: 0, coverage: 0.06, driftX: 0 },
  { id: 'far-2', src: SRC.c3, top: '-6%', left: '46%', width: 'clamp(520px, 66vw, 940px)', baseOpacity: 0.8, blur: 4, flipX: true, anim: 'find-cloud-drift-b', duration: 132, delay: -34, coverage: 0.06, driftX: 0 },
  // UPPER SKY — large soft cumulus, light blur for mid-depth.
  { id: 'up-1', src: SRC.c5, top: '0%', left: '12%', width: 'clamp(360px, 46vw, 760px)', baseOpacity: 0.86, blur: 2, flipX: false, anim: 'find-cloud-drift-c', duration: 104, delay: -52, coverage: 0.12, driftX: 1.5 },
  { id: 'up-2', src: SRC.c1, top: '6%', left: '60%', width: 'clamp(340px, 44vw, 720px)', baseOpacity: 0.84, blur: 2, flipX: true, anim: 'find-cloud-drift-a', duration: 112, delay: -18, coverage: 0.12, driftX: -1.5 },
  // MID SKY — crisp puffs that move IN toward the wordmark on scroll.
  { id: 'mid-1', src: SRC.c4, top: '20%', left: '-8%', width: 'clamp(320px, 42vw, 680px)', baseOpacity: 0.9, blur: 0, flipX: false, anim: 'find-cloud-drift-b', duration: 86, delay: -40, coverage: 0.34, driftX: 6 },
  { id: 'mid-2', src: SRC.c5, top: '24%', left: '56%', width: 'clamp(320px, 42vw, 660px)', baseOpacity: 0.88, blur: 0, flipX: true, anim: 'find-cloud-drift-a', duration: 92, delay: -12, coverage: 0.34, driftX: -6 },
  { id: 'mid-3', src: SRC.c4, top: '36%', left: '24%', width: 'clamp(300px, 38vw, 600px)', baseOpacity: 0.86, blur: 0, flipX: false, anim: 'find-cloud-drift-c', duration: 76, delay: -58, coverage: 0.4, driftX: 4 },
  { id: 'mid-4', src: SRC.c6, top: '30%', left: '78%', width: 'clamp(280px, 30vw, 460px)', baseOpacity: 0.88, blur: 0, flipX: true, anim: 'find-cloud-drift-b', duration: 80, delay: -26, coverage: 0.4, driftX: -5 },
  // LOWER HORIZON — billowy masses framing building shoulders.
  { id: 'low-1', src: SRC.c2, top: '54%', left: '-10%', width: 'clamp(440px, 60vw, 880px)', baseOpacity: 0.92, blur: 1, flipX: false, anim: 'find-cloud-drift-a', duration: 70, delay: -8, coverage: 0.62, driftX: 7 },
  { id: 'low-2', src: SRC.c3, top: '58%', left: '50%', width: 'clamp(420px, 56vw, 820px)', baseOpacity: 0.9, blur: 1, flipX: true, anim: 'find-cloud-drift-b', duration: 66, delay: -46, coverage: 0.62, driftX: -7 },
  // LOW CLOUD BANK — building base rises THROUGH this mist.
  { id: 'bank-1', src: SRC.c6, top: '74%', left: '-6%', width: 'clamp(460px, 64vw, 960px)', baseOpacity: 0.96, blur: 0, flipX: false, anim: 'find-cloud-drift-c', duration: 62, delay: -30, coverage: 0.74, driftX: 5 },
  { id: 'bank-2', src: SRC.c7, top: '78%', left: '34%', width: 'clamp(500px, 70vw, 1000px)', baseOpacity: 0.98, blur: 0, flipX: true, anim: 'find-cloud-drift-a', duration: 58, delay: -16, coverage: 0.74, driftX: -4 },
  { id: 'bank-3', src: SRC.c7, top: '84%', left: '4%', width: 'clamp(480px, 66vw, 940px)', baseOpacity: 1.0, blur: 0, flipX: false, anim: 'find-cloud-drift-b', duration: 54, delay: -42, coverage: 0.8, driftX: 3 },
  // FOREGROUND ENVELOPERS — bloom IN over the build + wordmark beat.
  { id: 'fg-1', src: SRC.c4, top: '60%', left: '-14%', width: 'clamp(560px, 78vw, 1180px)', baseOpacity: 0.16, blur: 0, flipX: false, anim: 'find-cloud-drift-c', duration: 64, delay: -20, coverage: 1, driftX: 9 },
  { id: 'fg-2', src: SRC.c5, top: '64%', left: '40%', width: 'clamp(540px, 74vw, 1120px)', baseOpacity: 0.16, blur: 0, flipX: true, anim: 'find-cloud-drift-a', duration: 60, delay: -38, coverage: 1, driftX: -9 },
  { id: 'fg-3', src: SRC.c7, top: '70%', left: '8%', width: 'clamp(620px, 86vw, 1320px)', baseOpacity: 0.2, blur: 0, flipX: false, anim: 'find-cloud-drift-b', duration: 56, delay: -10, coverage: 1, driftX: 6 },
  { id: 'fg-4', src: SRC.c4, top: '68%', left: '52%', width: 'clamp(520px, 72vw, 1080px)', baseOpacity: 0.18, blur: 0, flipX: true, anim: 'find-cloud-drift-c', duration: 52, delay: -28, coverage: 1, driftX: -6 },
]

// ════════════════════════════════════════════════════════════════════════════
// FRONT field — soft foreground clouds that drift IN FRONT of the building +
// wordmark. Near-transparent at rest (very low baseOpacity), all coverage≈1 so
// they bloom in on scroll and sweep ACROSS / OVER the centre. Larger realistic
// cloud PNGs, soft (slight blur), crossing the full width and drifting inward
// from both edges so the centre fills with mist (the "moving across" look in the
// reference). At rest the headline is fully readable; by the wordmark beat soft
// cloud passes in front of the building and nestles the wordmark (frames 7/9/10).
// ════════════════════════════════════════════════════════════════════════════
const FRONT_LAYERS: CloudLayer[] = [
  // Wisps that sweep across the UPPER-MID, drifting toward centre.
  { id: 'fr-mid-l', src: SRC.c7, top: '14%', left: '-26%', width: 'clamp(560px, 80vw, 1240px)', baseOpacity: 0.04, blur: 3, flipX: false, anim: 'find-cloud-drift-a', duration: 74, delay: -12, coverage: 1, driftX: 16 },
  { id: 'fr-mid-r', src: SRC.c3, top: '10%', left: '52%', width: 'clamp(540px, 76vw, 1180px)', baseOpacity: 0.04, blur: 3, flipX: true, anim: 'find-cloud-drift-b', duration: 82, delay: -40, coverage: 1, driftX: -16 },
  // Soft mass that rolls directly OVER the centre (the wordmark band).
  { id: 'fr-centre-l', src: SRC.c4, top: '32%', left: '-22%', width: 'clamp(600px, 84vw, 1320px)', baseOpacity: 0.05, blur: 2, flipX: false, anim: 'find-cloud-drift-c', duration: 66, delay: -22, coverage: 1, driftX: 19 },
  { id: 'fr-centre-r', src: SRC.c5, top: '30%', left: '46%', width: 'clamp(580px, 82vw, 1280px)', baseOpacity: 0.05, blur: 2, flipX: true, anim: 'find-cloud-drift-a', duration: 70, delay: -8, coverage: 1, driftX: -19 },
  // Dense low mist that climbs from the bottom over the lower wordmark.
  { id: 'fr-low-l', src: SRC.c7, top: '54%', left: '-20%', width: 'clamp(680px, 92vw, 1480px)', baseOpacity: 0.07, blur: 1, flipX: false, anim: 'find-cloud-drift-b', duration: 60, delay: -30, coverage: 1, driftX: 13 },
  { id: 'fr-low-r', src: SRC.c4, top: '58%', left: '40%', width: 'clamp(640px, 88vw, 1400px)', baseOpacity: 0.07, blur: 1, flipX: true, anim: 'find-cloud-drift-c', duration: 56, delay: -16, coverage: 1, driftX: -13 },
  { id: 'fr-low-c', src: SRC.c6, top: '64%', left: '8%', width: 'clamp(700px, 96vw, 1560px)', baseOpacity: 0.08, blur: 0, flipX: false, anim: 'find-cloud-drift-a', duration: 52, delay: -44, coverage: 1, driftX: 8 },
]

// ── easing helpers (pure, transform/opacity only output) ──────────────────────
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
// smoothstep — soft ease-in-out, no overshoot
const smooth = (n: number) => {
  const x = clamp01(n)
  return x * x * (3 - 2 * x)
}

/**
 * Full-screen near-white cover intensity for the FRONT field, 0..1. Mirrors the
 * `cover` curve in coverageState('front'): ramps to a near-full envelope by p≈0.84
 * (the whole page briefly washes near-white — reference frame_011), then THINS as the
 * next section emerges UP through the clouds (frame_012). Drives the dedicated soft
 * near-white veil so the cover is continuous (no sky gaps between PNGs) and the reveal
 * happens promptly right after the wordmark disappears.
 */
function frontCover(p: number) {
  // Bloom to a DENSE near-full sheet by p≈0.78 (the cloud screen that bridges to the next
  // section — frame_011, dense cover right as the image-filled wordmark has just lifted
  // into it), then THIN promptly p 0.78→1.0 as the next section emerges UP through the
  // SAME clouds (frame_012). Continuous bridge, no long hold.
  const bloom = smooth(clamp01((p - 0.45) / 0.33))
  const lift = smooth(clamp01((p - 0.78) / 0.22))
  return clamp01(bloom - lift * 0.82)
}

/**
 * Coverage ramp for a layer at a given scroll progress + variant.
 * Returns opacity / scale / translateY(vh) / translateX(vw) deltas to layer on top
 * of the layer's base position. Higher `coverage` => stronger response, accelerating
 * through the morph + wordmark beat (p 0.45 → 1.0).
 *
 * 'front' starts near-invisible and reaches a strong (but still soft, never fully
 * opaque) veil so the wordmark stays legible-through-the-mist; 'back' keeps its
 * original (fully-visible) behaviour.
 */
function coverageState(p: number, layer: CloudLayer, variant: 'back' | 'front') {
  const early = smooth(p / 0.45) // 0..1 by p=0.45
  const beat = smooth(clamp01((p - 0.45) / 0.55)) // 0..1 across 0.45..1.0
  const ramp = clamp01(early * 0.28 + beat * 0.85) * layer.coverage

  if (variant === 'front') {
    // FRONT field arc (tight, reference frames 7 -> 11 -> 12):
    //   rest (p≈0)     : near-invisible — headline fully readable.
    //   p 0.45 -> 0.78 : blooms in fast, ramping to a DENSE near-opaque FULL viewport
    //                    SHEET (the cloud screen that bridges to the next section — the
    //                    page is briefly enveloped in soft near-white cloud, frame_011).
    //   p 0.78 -> 1.0  : the sheet THINS / lifts as the next section emerges UP through
    //                    the SAME clouds (continuous bridge — frame_012).
    // `cover` is the enveloping intensity 0..1 used by both the PNG layers and the
    // dedicated near-white full-screen veil (rendered separately as the `cover-veil`).
    const bloom = smooth(clamp01((p - 0.45) / 0.33)) // 0 at p=0.45, 1 by p=0.78
    const lift = smooth(clamp01((p - 0.78) / 0.22)) // 0 until 0.78, 1 by p=1.0
    const cover = clamp01(bloom - lift * 0.82) // ramp to ~1, then thin to ~0.18
    const frontRamp = cover * layer.coverage
    // Near-opaque at peak so the field reads as a dense soft cover (frame_011).
    const FRONT_PEAK = 0.97
    const opacity = clamp01(layer.baseOpacity + (FRONT_PEAK - layer.baseOpacity) * frontRamp)
    const scale = 1 + frontRamp * 0.62 // swell large so puffs overlap into a wash
    const translateY = -frontRamp * 14 // gentle upward climb, then lifts off on reveal
    const translateX = layer.driftX * frontRamp // inward sweep toward centre
    return { opacity, scale, translateY, translateX }
  }

  // back (original behaviour)
  const opacity = clamp01(layer.baseOpacity + (1 - layer.baseOpacity) * ramp)
  const scale = 1 + ramp * 0.42
  const translateY = -ramp * 24
  const translateX = layer.driftX * ramp
  return { opacity, scale, translateY, translateX }
}

export default function HeroClouds({
  progressRef,
  active = true,
  variant = 'back',
}: HeroCloudsProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<Array<HTMLImageElement | null>>([])
  // Dedicated near-white full-screen cover veil (front variant only) — guarantees a
  // continuous dense cover at peak (no sky gaps between PNGs), then thins on reveal.
  const veilRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  // Resolve reduced-motion only on the client to avoid an SSR mismatch.
  const [reducedMotion, setReducedMotion] = useState(false)

  const layers = variant === 'front' ? FRONT_LAYERS : BACK_LAYERS

  // Static rest progress per variant:
  //  - back  -> mid coverage (scene already nestled, fully visible).
  //  - front -> a LIGHT veil: reads as cloud-in-front but NOT blocking (FRONT_PEAK
  //    cap + this modest progress keep the wordmark legible).
  const staticRestP = variant === 'front' ? 0.5 : 0.62

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const animate = active && !reducedMotion

  // Coverage loop: per-layer opacity + scale + inward/upward drift ramp UP with hero
  // progress so clouds increasingly ENVELOP the scene. For the FRONT field this is
  // what makes soft cloud drift in front of the building + over the wordmark.
  useEffect(() => {
    const els = layerRefs.current
    if (els.length === 0) return

    // Per-layer coverage transform is written to CSS custom properties read by the
    // keyframes, so the idle drift animation (which owns `transform`) and the scroll
    // coverage coexist without one clobbering the other.
    const apply = (p: number) => {
      for (let i = 0; i < layers.length; i++) {
        const el = els[i]
        if (!el) continue
        const layer = layers[i]
        const { opacity, scale, translateY, translateX } = coverageState(p, layer, variant)
        el.style.opacity = opacity.toFixed(3)
        el.style.setProperty('--cov-scale', scale.toFixed(3))
        el.style.setProperty('--cov-ty', `${translateY.toFixed(2)}vh`)
        el.style.setProperty('--cov-tx', `${translateX.toFixed(2)}vw`)
      }
      // FRONT veil — soft near-white full-screen cover. Ramps to a dense envelope by
      // p≈0.84 (frame_011) then thins as the next section emerges (frame_012).
      const veil = veilRef.current
      if (veil) {
        // Peak ~0.94 keeps it dense-but-soft (cloud texture still reads through the PNGs).
        veil.style.opacity = (frontCover(p) * 0.94).toFixed(3)
      }
    }

    if (!animate) {
      // Static fallback:
      //  - back  -> mid-coverage rest state (clouds nestle the wordmark).
      //  - front -> light static veil (not fully blocking — headline still reads).
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
      ref={fieldRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/*
        Drift keyframes — transform-only, GPU-composited. Three families + flips.
        Each keyframe COMPOSES the idle drift with the scroll-coverage transform
        carried by CSS vars (--cov-tx / --cov-ty / --cov-scale), so the live coverage
        ramp and the continuous drift never fight over `transform`. Defaults keep
        static (reduced-motion / pre-paint) layers at coverage rest.
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

      {layers.map((layer, i) => {
        const filterVal = layer.blur > 0 ? `blur(${layer.blur}px)` : 'none'

        const animName = animate
          ? layer.flipX
            ? `${layer.anim}-flip`
            : layer.anim
          : undefined

        // Initial coverage rest values so the very first paint (before the rAF loop
        // runs / when static) already shows the field at its rest state.
        const initial = coverageState(animate ? 0 : staticRestP, layer, variant)

        const style: CSSProperties = {
          position: 'absolute',
          top: layer.top,
          left: layer.left,
          width: layer.width,
          height: 'auto',
          opacity: initial.opacity,
          filter: filterVal,
          display: 'block',
          willChange: animate ? 'transform, opacity' : 'auto',
          // @ts-expect-error — CSS custom properties are valid inline styles.
          '--cov-scale': initial.scale.toFixed(3),
          '--cov-ty': `${initial.translateY.toFixed(2)}vh`,
          '--cov-tx': `${initial.translateX.toFixed(2)}vw`,
          ...(animate && animName
            ? {
                animation: `${animName} ${layer.duration}s ease-in-out ${layer.delay}s infinite`,
              }
            : {
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

      {/* FRONT cover veil — a soft near-white wash that fills the WHOLE viewport at the
          end of the hero so the page is briefly enveloped in cloud (frame_011), then
          thins as the next section emerges up through it (frame_012). A faint top-light
          gradient + blur keeps it reading as cloud, not a flat panel. Front variant only;
          its opacity is driven each frame by frontCover(p). */}
      {variant === 'front' && (
        <div
          ref={veilRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-6%',
            opacity: animate ? frontCover(0) * 0.94 : frontCover(staticRestP) * 0.94,
            background:
              'radial-gradient(120% 90% at 50% 30%, rgba(255,255,255,0.78) 0%, rgba(248,251,255,0.94) 46%, rgba(255,255,255,0.99) 100%)',
            filter: 'blur(6px)',
            willChange: animate ? 'opacity' : 'auto',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
