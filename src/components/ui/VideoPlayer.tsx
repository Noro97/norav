import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface VideoPlayerProps {
  src: string
  poster: string
  alt: string
  portrait?: boolean
  autoplay?: boolean
}

/**
 * A clip that costs nothing until it's needed.
 *
 * Only the poster loads with the page. The `<video>` doesn't exist until someone
 * presses play or, for an `autoplay` clip, until it nears the screen. So a page of
 * clips nobody scrolls to downloads no video at all. Under reduced motion an
 * `autoplay` clip waits for a click like any other.
 */
export function VideoPlayer({ src, poster, alt, portrait = false, autoplay = false }: VideoPlayerProps) {
  const { t } = useTranslation('projects')
  const reducedMotion = useReducedMotion()
  const [frame, inView] = useInView<HTMLDivElement>()
  const video = useRef<HTMLVideoElement>(null)
  const [pressed, setPressed] = useState(false)
  const [reached, setReached] = useState(false)

  const ambient = autoplay && !reducedMotion && !pressed

  if (ambient && inView && !reached) setReached(true)

  // A clip that plays by itself stops when it's off screen, and stops for good if
  // the visitor asks for less motion. One that was pressed is theirs to control.
  useEffect(() => {
    const element = video.current
    if (!element || pressed) return
    if (ambient && inView) void element.play().catch(() => {})
    else element.pause()
  }, [ambient, inView, pressed, reached])

  // The button that was pressed is gone; without this, focus drops to the page.
  useEffect(() => {
    if (pressed) video.current?.focus()
  }, [pressed])

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.08] bg-tertiary-shade ${
        portrait ? 'mx-auto aspect-[9/16] max-h-[80vh]' : 'aspect-video w-full'
      }`}
    >
      {pressed || reached ? (
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-contain"
          src={src}
          poster={poster}
          aria-label={alt}
          tabIndex={0}
          preload="none"
          controls
          playsInline
          muted={!pressed}
          loop={!pressed}
          autoPlay={pressed}
        />
      ) : (
        <button
          type="button"
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={t('video.play', { title: alt })}
          onClick={() => setPressed(true)}
        >
          <img src={poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-tertiary-ink/20 bg-tertiary-bg/70 text-tertiary-ink transition-colors group-hover:border-primary-500/60 group-focus-visible:border-primary-500"
          >
            <Play size={20} />
          </span>
        </button>
      )}
    </div>
  )
}
