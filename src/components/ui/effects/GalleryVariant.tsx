import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type GalleryStyle = 'grid' | 'circular' | 'dome' | 'card-swap'

interface Props {
  images: string[]
  variant: GalleryStyle
  alt?: string
  className?: string
}

const AUTO_SWAP_MS = 2600

function GridGallery({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className ?? ''}`}>
      {images.map((src, i) => (
        <div key={i} className="aspect-video rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.02]">
          <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}

/** Thumbnails laid out around an arc — a full circle, or (`dome`) its upper half. */
function ArcGallery({
  images,
  alt,
  className,
  sweep,
}: {
  images: string[]
  alt: string
  className?: string
  sweep: 'full' | 'half'
}) {
  const count = images.length
  const radius = 120
  // Both sweeps start at the top; the full circle closes on itself, so it
  // divides by the count rather than by the gaps between thumbnails.
  const START_DEG = -90
  const spanDeg = sweep === 'half' ? 180 : 360
  const step = count > 1 ? spanDeg / (sweep === 'full' ? count : count - 1) : 0

  return (
    <div
      className={`relative mx-auto ${className ?? ''}`}
      style={{ height: sweep === 'half' ? radius + 70 : radius * 2 + 70 }}
    >
      {images.map((src, i) => {
        const deg = START_DEG + step * i
        const rad = (deg * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/[0.1] bg-white/[0.02] shadow-lg transition-transform duration-300 hover:scale-110 hover:z-10"
            style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
          >
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
          </div>
        )
      })}
    </div>
  )
}

function CardSwapGallery({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reducedMotion || images.length < 2) return
    const id = setInterval(() => setActive((i) => (i + 1) % images.length), AUTO_SWAP_MS)
    return () => clearInterval(id)
  }, [reducedMotion, images.length])

  return (
    <div className={`relative aspect-video max-w-md mx-auto ${className ?? ''}`}>
      {images.map((src, i) => {
        const offset = (i - active + images.length) % images.length
        return (
          <div
            key={i}
            className="absolute inset-0 rounded-xl overflow-hidden border border-white/[0.1] bg-white/[0.02] shadow-xl transition-all duration-500 ease-out"
            style={{
              transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.04})`,
              opacity: offset === 0 ? 1 : offset === 1 ? 0.5 : 0,
              zIndex: images.length - offset,
              pointerEvents: offset === 0 ? 'auto' : 'none',
            }}
          >
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
          </div>
        )
      })}
    </div>
  )
}

/**
 * Renders a case study's `content.screenshots` in the style its
 * `settings.galleryStyle` picks. Free-tier-reactbits-flavoured but built from
 * scratch on plain CSS transforms — no new dependency.
 */
export function GalleryVariant({ images, variant, alt = 'Screenshot', className }: Props) {
  if (images.length === 0) return null
  if (variant === 'circular') return <ArcGallery images={images} alt={alt} className={className} sweep="full" />
  if (variant === 'dome') return <ArcGallery images={images} alt={alt} className={className} sweep="half" />
  if (variant === 'card-swap') return <CardSwapGallery images={images} alt={alt} className={className} />
  return <GridGallery images={images} alt={alt} className={className} />
}
