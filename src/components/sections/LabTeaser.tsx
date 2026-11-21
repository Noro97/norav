import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useBlock, useCollection } from '@/content/ContentProvider'
import type { BlockComponentProps } from '@/content/blocks'
import type { LabContent, LabData, LabTeaserContent, LabTeaserSettings } from '@norav/content-schema'

type LabRow = LabData & LabContent

const LINK = 'text-body-small font-semibold text-primary-400 underline-offset-4 hover:underline'

/**
 * Asked at the moment someone points, not on render: the answer only decides
 * whether a clip loads, and the page's HTML must not depend on it.
 */
function mayPlay(): boolean {
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * One exhibit: its poster, its name and its line, the whole card one plain link
 * into the Lab. A clip, if it has one, is not on the page until someone points
 * at the card or tabs to it, and it stops when they leave.
 */
function LabCard({ row }: { row: LabRow }) {
  const video = useRef<HTMLVideoElement>(null)
  const [mounted, setMounted] = useState(false)
  const [wanted, setWanted] = useState(false)
  const [showing, setShowing] = useState(false)

  const start = () => {
    if (!row.clip || !mayPlay()) return
    setMounted(true)
    setWanted(true)
  }
  const stop = () => {
    setWanted(false)
    setShowing(false)
  }
  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') start()
  }

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (wanted) void element.play().catch(() => {})
    else element.pause()
  }, [wanted, mounted])

  return (
    <li className="group relative" onPointerEnter={onPointerEnter} onPointerLeave={stop} onFocus={start} onBlur={stop}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-tertiary-ink/[0.08] bg-tertiary-shade">
        {/* The title names the link, so the picture adds nothing for a screen reader. */}
        <img
          src={row.poster}
          alt=""
          width={960}
          height={600}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {mounted && (
          <video
            ref={video}
            src={row.clip}
            aria-hidden="true"
            tabIndex={-1}
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setShowing(wanted)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${showing ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>
      <h3 className="mt-5 text-body-large font-semibold text-tertiary-ink break-words">
        {/* A plain link: the Lab is another app, and a router link would land on this one's 404. */}
        <a href={row.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {row.title}
        </a>
      </h3>
      <p className="mt-2 text-body-small text-tertiary-ink/70 leading-relaxed break-words">{row.line}</p>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-2xl opacity-0 outline outline-2 outline-primary-400 group-has-[:focus-visible]:opacity-100"
      />
    </li>
  )
}

/**
 * A short look at Creative-Lab, low on the home page: the first few exhibits
 * from the Lab collection and the way into the rest. Craft, shown briefly; it
 * doesn't set the direction (docs/plan, Goal).
 *
 * Nothing here runs an exhibit. The posters are lazy and below the fold, a clip
 * waits for a pointer, and the Lab's own code loads only in the Lab.
 */
export function LabTeaser({ blockId }: BlockComponentProps) {
  const block = useBlock<LabTeaserContent, LabTeaserSettings>('lab_teaser', blockId)
  const rows = useCollection<LabRow>('lab')
  if (!block) return null
  const { content, settings } = block
  const shown = rows.filter(({ data }) => data.poster).slice(0, settings.count)
  // A heading and a link over no exhibits reads as a broken section.
  if (shown.length === 0) return null

  return (
    <section className="relative px-gutter-x py-20 md:py-28">
      <div className="w-full max-w-content mx-auto">
        <div className="max-w-3xl">
          {content.sectionLabel && <p className="label-mono">{content.sectionLabel}</p>}
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3 text-balance">{content.title}</h2>
          {content.description && (
            <p className="mt-4 text-body-regular text-tertiary-ink/70 max-w-[60ch] leading-relaxed">{content.description}</p>
          )}
        </div>

        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ id, data }) => (
            <LabCard key={id} row={data} />
          ))}
        </ul>

        <a href={settings.linkHref} className={`inline-block mt-10 ${LINK}`}>
          {content.linkLabel}
        </a>
      </div>
    </section>
  )
}
