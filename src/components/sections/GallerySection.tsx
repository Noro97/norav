import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useBlock } from '@/content/ContentProvider'
import { GalleryVariant } from '@/components/ui/effects/GalleryVariant'
import type { GalleryContent, GallerySettings } from '@norav/content-schema'

export function GallerySection({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<GalleryContent, GallerySettings>('gallery')
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const header = sectionRef.current!.querySelector('.gallery-header')
    if (!header) return
    gsap.fromTo(
      header.children,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      }
    )
  }, { scope: sectionRef })

  if (!block) return null
  const { content, settings } = block

  // An image the editor added but never picked a file for would render as a
  // broken frame, which is worse than one fewer picture.
  const images = content.images.map((row) => row.image).filter(Boolean)
  if (images.length === 0) return null

  return (
    <section
      ref={sectionRef}
      {...(anchorId ? { id: anchorId } : {})}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="gallery-header mb-12">
          <span className="label-mono">{content.sectionLabel}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
            {content.title}
          </h2>
          {content.description && (
            <p className="text-white/40 text-base max-w-xl">{content.description}</p>
          )}
        </div>

        <GalleryVariant
          images={images}
          variant={settings.galleryStyle}
          alt={content.images[0]?.alt || content.title}
        />
      </div>
    </section>
  )
}
