'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'

/**
 * Which dialogs are open, innermost last.
 *
 * Editing a collection entry opens one, and editing a repeater row inside it
 * opens another. Without this both would answer Escape — closing the row and
 * the entry with a single press — and both would trap Tab, fighting over where
 * focus goes next.
 */
const open: symbol[] = []

/**
 * A dialog that behaves like one.
 *
 * The media picker had the markup for this and none of the behaviour: no
 * Escape, no focus trap, and focus left wherever the click put it when the
 * overlay closed. Editing a row is about to happen in here too, so it is worth
 * getting right once.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusTo = useRef<HTMLElement | null>(null)

  const focusables = useCallback(
    () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ),
    [],
  )

  useEffect(() => {
    const token = Symbol('dialog')
    open.push(token)
    const isInnermost = () => open[open.length - 1] === token

    returnFocusTo.current = document.activeElement as HTMLElement | null
    focusables()[0]?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (!isInnermost()) return
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      // Keep Tab inside the panel: a dialog you can tab out of leaves the
      // keyboard somewhere the eye is not.
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const at = open.indexOf(token)
      if (at !== -1) open.splice(at, 1)
      returnFocusTo.current?.focus()
    }
  }, [focusables, onClose])

  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`overlay-panel${wide ? ' overlay-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="overlay-head">
          <strong>{title}</strong>
          <span className="spacer" />
          {footer}
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="overlay-body">{children}</div>
      </div>
    </div>
  )
}
