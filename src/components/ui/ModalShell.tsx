import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValue } from 'framer-motion'
import { useModalChrome } from '@/hooks/useModalChrome'
import { SPRING } from '@/lib/motion'

/** A viewport point — where the reader clicked to open the modal. */
export interface ModalOrigin {
  x: number
  y: number
}

interface Props {
  onClose: () => void
  /**
   * The point the panel grows out of, and shrinks back into. A modal opened
   * from a tile at the bottom of the screen should arrive from there, not
   * materialise in the middle of nowhere — that is what keeps the tile and
   * the panel one thing in the reader's head. Omitted, it grows from its own
   * centre.
   */
  origin?: ModalOrigin | null
  /** The panel's surface: width, rounding, background. Position and layering are the shell's. */
  panelClassName: string
  /** Defaults to the site's standard scrim. */
  backdropClassName?: string
  /** Extra classes on the fixed container — a `z-*` above whatever opened it. */
  containerClassName?: string
  children: ReactNode
}

/**
 * The frame every modal on the site renders inside: the portal, the scrim,
 * the panel and its spring, Escape and scroll-lock.
 *
 * Rendering the shell rather than assembling the same six elements per modal
 * is what makes them behave alike — and what fixes the exit: a modal that
 * wraps *itself* in `AnimatePresence` is unmounted by its parent before the
 * exit animation can run, so it simply vanishes. The `AnimatePresence`
 * belongs at the call site, around the conditional:
 *
 *   <AnimatePresence>{open && <SomeModal onClose={...} />}</AnimatePresence>
 *
 * The panel arrives on a critically damped spring — no overshoot, because
 * nothing threw it — and leaves along the same path it came in on.
 */
export function ModalShell({
  onClose,
  origin,
  panelClassName,
  backdropClassName = 'bg-black/80 backdrop-blur-md',
  containerClassName = 'z-50',
  children,
}: Props) {
  useModalChrome(onClose)

  const panelRef = useRef<HTMLDivElement>(null)
  const originX = useMotionValue(0.5)
  const originY = useMotionValue(0.5)

  // Before the first paint, so the very first frame of the scale already
  // points at the trigger. `offsetLeft/Top` rather than the bounding rect:
  // the panel is mid-transform at that moment and the rect would report the
  // scaled box.
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!origin || !panel) return
    originX.set((origin.x - panel.offsetLeft) / panel.offsetWidth)
    originY.set((origin.y - panel.offsetTop) / panel.offsetHeight)
  }, [origin, originX, originY])

  return createPortal(
    <motion.div
      className={`fixed inset-0 flex items-center justify-center p-4 ${containerClassName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`absolute inset-0 ${backdropClassName}`} onClick={onClose} />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        data-surface="panel"
        className={`relative ${panelClassName}`}
        style={{ originX, originY }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={SPRING.settle}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  )
}
