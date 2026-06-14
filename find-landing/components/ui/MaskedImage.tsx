'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

// Chevron: true ❯ shape - pointed right tip, concave V-notch on the left.
// Panels overlap into one continuous ❯❯❯❯ chain (see ChevronStrip).
// The notch vertex at 42% 50% lets the previous arrow's tip nest inside it,
// producing the characteristic white V-gaps visible in the reference (frames 16/18).
export const CHEVRON_CLIP_PATH =
  'polygon(0% 0%, 58% 0%, 100% 50%, 58% 100%, 0% 100%, 42% 50%)'

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
  /** Additional classes passed directly to the <Image> element (for hover transforms, etc.) */
  imgClassName?: string
  /** Priority loading (set true for above-the-fold images) */
  priority?: boolean
  /** Object-fit style for the image */
  objectFit?: 'cover' | 'contain' | 'fill'
  /** Object-position - controls which part of the image is visible within the clip shape */
  objectPosition?: string
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
  imgClassName,
  priority = false,
  objectFit = 'cover',
  objectPosition = 'center',
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
          className={imgClassName}
          style={{ objectFit, objectPosition }}
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
          className={imgClassName}
          style={{ objectFit, objectPosition, width: '100%', height: 'auto' }}
        />
      )}
    </div>
  )
}
