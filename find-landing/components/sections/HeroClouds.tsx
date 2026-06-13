'use client'

/**
 * HeroClouds — R3F volumetric cloud layer for the signature Hero.
 *
 * Renders several soft, bright drei <Cloud> banks over a transparent (alpha)
 * background so the CSS sky shows through. Clouds are tuned to read as the soft,
 * obviously-visible WHITE puffs from frame_001 / frame_006: high opacity, large
 * volume, dense segments, banks spread across the full viewport width and parked
 * across the mid/upper sky.
 *
 * A slow time-based drift keeps motion alive even when scroll is paused; a scroll
 * `progress` (0->1) drives a vertical parallax (clouds part + lift as the building
 * rises) and an upward dissolve at the end of the hero pin (hand-off to Why FIND).
 *
 * Performance:
 *  - dpr capped at [1, 1.75]
 *  - frameloop pauses when the hero leaves the viewport (IntersectionObserver)
 *  - GPU-only animation (group transforms + visibility), disposed on unmount
 *
 * SSR-safe: only ever mounted client-side via `dynamic(..., { ssr: false })`.
 */

// R3F 8.x + React 19 compatibility: augment the React.JSX namespace so that
// Three.js intrinsic elements (group, ambientLight, directionalLight, etc.)
// are recognised by the TypeScript compiler.
import type { ThreeElements } from '@react-three/fiber'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

import { useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Clouds, Cloud } from '@react-three/drei'
import { MeshBasicMaterial, AmbientLight, DirectionalLight, type Group } from 'three'

export interface HeroCloudsProps {
  /** Shared scroll progress over the hero pin, 0 -> 1. Drives parallax + dissolve. */
  progressRef?: RefObject<number>
  /** Master gate — when false the canvas is not rendered at all. */
  active?: boolean
}

/**
 * Bright daytime lighting added imperatively (avoids three.js JSX intrinsics).
 * Clouds render with MeshBasicMaterial (unlit) so they always read bright WHITE
 * regardless of normals; the lights add a faint warm/cool wash to neighbouring
 * geometry without ever greying the puffs out.
 */
function SceneLighting() {
  const { scene } = useThree()

  useEffect(() => {
    const ambient = new AmbientLight(0xffffff, 1.4)
    const key = new DirectionalLight(0xfff1e0, 1.1) // warm key (golden hour)
    key.position.set(-8, 6, 10)
    const fill = new DirectionalLight(0xdfeaff, 0.6) // cool sky fill
    fill.position.set(6, -4, 6)

    scene.add(ambient, key, fill)
    return () => {
      scene.remove(ambient, key, fill)
      ambient.dispose()
      key.dispose()
      fill.dispose()
    }
  }, [scene])

  return null
}

/** Cloud cluster — handles its own drift + reacts to scroll progress. */
function CloudField({ progressRef }: { progressRef?: RefObject<number> }) {
  const groupRef = useRef<Group>(null)
  const churnRef = useRef<Group>(null)

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    const t = state.clock.elapsedTime
    const p = progressRef?.current ?? 0

    // Time-based horizontal drift — alive even when scroll is idle.
    g.position.x = Math.sin(t * 0.05) * 1.1

    // Scroll parallax: clouds part + lift as the building rises (p 0.08->0.55),
    // then drift fully upward + out at the very end (p 0.8->1) to hand off.
    const parallaxLift = p * 7
    const exitLift = Math.max(0, (p - 0.8) / 0.2) * 18
    g.position.y = parallaxLift + exitLift

    // Subtle breathing scale for depth.
    const breathe = 1 + Math.sin(t * 0.13) * 0.02
    g.scale.setScalar(breathe)

    // Dissolve out as we approach the next section (frames 13/14).
    const exitFade = 1 - Math.max(0, (p - 0.82) / 0.18)
    g.visible = exitFade > 0.01

    // Slow rotational churn for painterly volume.
    if (churnRef.current) {
      churnRef.current.rotation.y += delta * 0.01
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={churnRef}>
        {/* MeshBasicMaterial keeps every puff bright WHITE (unlit) — the single
            biggest fix vs the previous Lambert material that rendered grey. */}
        <Clouds material={MeshBasicMaterial} limit={600} range={160}>
          {/* Wide bright back band across the upper sky — fills viewport width. */}
          <Cloud
            seed={11}
            bounds={[26, 5, 4]}
            volume={11}
            segments={48}
            position={[0, 5.5, -6]}
            color="#ffffff"
            opacity={0.92}
            speed={0.05}
            growth={6}
          />
          {/* Left mid bank. */}
          <Cloud
            seed={2}
            bounds={[16, 5, 4]}
            volume={10}
            segments={46}
            position={[-9, 1.5, -2]}
            color="#ffffff"
            opacity={0.95}
            speed={0.07}
            growth={5}
          />
          {/* Right mid bank. */}
          <Cloud
            seed={3}
            bounds={[16, 5, 4]}
            volume={10}
            segments={46}
            position={[9, 2.2, -3]}
            color="#fbfdff"
            opacity={0.95}
            speed={0.06}
            growth={5}
          />
          {/* Warm lower-left bank (catches golden-hour light, frame_001 base). */}
          <Cloud
            seed={4}
            bounds={[18, 4, 4]}
            volume={9}
            segments={44}
            position={[-5, -4.5, 2]}
            color="#fdeede"
            opacity={0.9}
            speed={0.06}
            growth={5}
          />
          {/* Warm lower-right bank. */}
          <Cloud
            seed={5}
            bounds={[18, 4, 4]}
            volume={9}
            segments={44}
            position={[6, -4, 1]}
            color="#fef3e8"
            opacity={0.88}
            speed={0.05}
            growth={5}
          />
          {/* Bright central drift sitting just behind the building/wordmark
              so the FIND beat floats inside the clouds (frame_011). */}
          <Cloud
            seed={7}
            bounds={[20, 5, 3]}
            volume={10}
            segments={44}
            position={[0, 0, -1]}
            color="#ffffff"
            opacity={0.85}
            speed={0.045}
            growth={6}
          />
        </Clouds>
      </group>
    </group>
  )
}

export default function HeroClouds({ progressRef, active = true }: HeroCloudsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Pause the render loop when the hero is offscreen — saves GPU.
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!active) return null

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <Canvas
        dpr={[1, 1.75]}
        frameloop={inView ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 16], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <SceneLighting />
        <CloudField progressRef={progressRef} />
      </Canvas>
    </div>
  )
}
