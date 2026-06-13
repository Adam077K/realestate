'use client'

/**
 * HeroClouds — R3F volumetric cloud layer for the signature Hero.
 *
 * Renders 4 soft drei <Cloud> instances at varied z-depth over a transparent
 * (alpha) background so the CSS sky shows through. A slow, time-based drift keeps
 * motion alive even when scroll is paused; a scroll `progress` (0→1) drives a
 * subtle vertical parallax + an upward dissolve at the end of the hero pin.
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
import { MeshLambertMaterial, AmbientLight, DirectionalLight, type Group } from 'three'

export interface HeroCloudsProps {
  /** Shared scroll progress over the hero pin, 0 → 1. Drives parallax + dissolve. */
  progressRef?: RefObject<number>
  /** Master gate — when false the canvas is not rendered at all. */
  active?: boolean
}

/** Adds soft daytime lighting imperatively so we avoid three.js JSX intrinsics. */
function SceneLighting() {
  const { scene } = useThree()

  useEffect(() => {
    const ambient = new AmbientLight(0xfff4ea, 1.15)
    const key = new DirectionalLight(0xffd9b8, 0.9)
    key.position.set(-6, -4, 8)
    const fill = new DirectionalLight(0xcfe0ff, 0.5)
    fill.position.set(5, 8, 4)

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
    g.position.x = Math.sin(t * 0.04) * 0.6

    // Scroll parallax: clouds part + lift as the building rises (p 0.08→0.55),
    // then drift fully upward + out at the very end (p 0.8→1).
    const parallaxLift = p * 6
    const exitLift = Math.max(0, (p - 0.8) / 0.2) * 14
    g.position.y = parallaxLift + exitLift

    // Subtle breathing scale for depth.
    const breathe = 1 + Math.sin(t * 0.12) * 0.015
    g.scale.setScalar(breathe)

    // Dissolve out as we approach the next section (frames 13/14).
    const exitFade = 1 - Math.max(0, (p - 0.82) / 0.18)
    g.visible = exitFade > 0.01

    // Slow rotational churn for painterly volume.
    if (churnRef.current) {
      churnRef.current.rotation.y += delta * 0.008
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={churnRef}>
        <Clouds material={MeshLambertMaterial} limit={400} range={120}>
          {/* Lower bank — warm, dense, sits in front (frame_001 base). */}
          <Cloud
            seed={1}
            bounds={[14, 3, 3]}
            volume={7}
            segments={42}
            position={[-4, -3.2, 1]}
            color="#f3d9c4"
            opacity={0.55}
            speed={0.08}
            growth={5}
            concentrate="outside"
          />
          {/* Mid-left soft cluster. */}
          <Cloud
            seed={2}
            bounds={[11, 3, 3]}
            volume={6}
            segments={38}
            position={[-6, 1, -3]}
            color="#ffffff"
            opacity={0.5}
            speed={0.06}
            growth={4}
            concentrate="inside"
          />
          {/* Mid-right soft cluster. */}
          <Cloud
            seed={3}
            bounds={[11, 3, 3]}
            volume={6}
            segments={38}
            position={[7, 2.5, -4]}
            color="#eef2f8"
            opacity={0.5}
            speed={0.05}
            growth={4}
            concentrate="inside"
          />
          {/* Far hazy back bank — cool, large, low opacity for depth. */}
          <Cloud
            seed={4}
            bounds={[20, 4, 4]}
            volume={9}
            segments={30}
            position={[2, 5, -9]}
            color="#dfe7f2"
            opacity={0.32}
            speed={0.03}
            growth={6}
            concentrate="random"
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
        camera={{ position: [0, 0, 18], fov: 42 }}
        style={{ background: 'transparent' }}
      >
        <SceneLighting />
        <CloudField progressRef={progressRef} />
      </Canvas>
    </div>
  )
}
