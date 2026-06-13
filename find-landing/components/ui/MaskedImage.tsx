'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

// Chevron: true right-pointing arrowhead. Flat left edge, single point at right.
// Panels overlap into one ascending directional band (see ChevronStrip).
export const CHEVRON_CLIP_PATH =
  'polygon(0% 0%, 78% 0%, 100% 50%, 78% 100%, 0% 100%)'

export const RECT_CLIP_PATH = 'none'

export type MaskedImageShape = 'rect' | 'chevron'

export interface MaskedImageProps {
  /** Clip-path shape applied to the image container */
  shape: MaskedImageShape
  /** Image src (next/image compatible, must be a string path) */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Fill layout (parent must have position:relative and explicit dimensions) */
  fill?: boolean
  /** Width in px when fill=false */
  width?: number
  /** Height in px when fill=false */
  height?: number
  /** Next image quality (1-100) */
  quality?: number
  /** Additional classes on the wrapper div */
  className?: string
  /** Priority loading (set true for above-the-fold images) */
  priority?: boolean
  /** Object-fit style for the image */
  objectFit?: 'cover' | 'contain' | 'fill'
}

export default function MaskedImage({
  shape,
  src,
  alt,
  fill = false,
  width,
  height,
  quality = 85,
  className,
  priority = false,
  objectFit = 'cover',
}: MaskedImageProps) {
  const clipPath =
    shape === 'chevron' ? CHEVRON_CLIP_PATH : RECT_CLIP_PATH

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ clipPath }}
    >
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          quality={quality}
          priority={priority}
          style={{ objectFit }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 800}
          height={height ?? 600}
          quality={quality}
          priority={priority}
          style={{ objectFit, width: '100%', height: 'auto' }}
        />
      )}
    </div>
  )
}
