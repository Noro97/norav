import { useEffect, useRef } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** The layer every background effect draws on: behind the content, never in the pointer's way. */
export const BACKGROUND_LAYER = 'absolute inset-0 overflow-hidden pointer-events-none'

export interface Frame {
  dt: number
  width: number
  height: number
}

interface Props<T> {
  /** Builds the scene. Called on mount and whenever the section is resized. */
  create: (width: number, height: number) => T
  /** One frame. Only called while the section is on screen. */
  paint: (ctx: CanvasRenderingContext2D, scene: T, frame: Frame) => void
  className?: string
}

/**
 * The half of a canvas background that is the same whichever effect it draws:
 * a canvas sized to its section, a scene rebuilt when that size changes, and a
 * frame callback that runs on the site's one shared rAF loop and only while the
 * section is actually on screen.
 *
 * Sizing watches the element rather than the window, because a section grows
 * for reasons the window never hears about — an accordion opening, an image
 * arriving, a font swapping in — and a canvas left at the old size is either
 * stretched or cropped.
 *
 * `paint` is handed a context already scaled for the display, so it works in
 * CSS pixels and the lines come out sharp on a retina screen.
 */
export function CanvasBackground<T>({ create, paint, className }: Props<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wrapperRef, inView] = useInView<HTMLDivElement>()
  const reducedMotion = useReducedMotion()

  const sceneRef = useRef<T | null>(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const createRef = useRef(create)
  const paintRef = useRef(paint)
  useEffect(() => {
    createRef.current = create
    paintRef.current = paint
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = parent
      if (width === 0 || height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { width, height }
      sceneRef.current = createRef.current(width, height)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  useAnimationLoop((dt) => {
    if (reducedMotion || !inView) return
    const ctx = canvasRef.current?.getContext('2d')
    const scene = sceneRef.current
    if (!ctx || scene === null) return
    const { width, height } = sizeRef.current
    ctx.clearRect(0, 0, width, height)
    paintRef.current(ctx, scene, { dt, width, height })
  })

  if (reducedMotion) return null

  return (
    <div ref={wrapperRef} className={`${BACKGROUND_LAYER} ${className ?? ''}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full" />
    </div>
  )
}
