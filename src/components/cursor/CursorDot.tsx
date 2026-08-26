import { useEffect, useRef } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useAppStore } from '@/store/useAppStore'
import { CURSOR_LERP_FACTOR } from '@/lib/constants'
import type { CursorState } from '@/components/cursor/cursor.types'

// Extend CSSProperties mix-blend-mode values accepted by the DOM
type CSSMixBlendModeValue =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

interface DotConfig {
  size: number
  bg: string
  border: string
  label: string
  blendMode: CSSMixBlendModeValue
  backdropBlur: string
  color: string
}

const CONFIG: Record<CursorState, DotConfig> = {
  default: {
    size: 12,
    bg: 'var(--color-crimson-500)',
    border: 'none',
    label: '',
    blendMode: 'normal',
    backdropBlur: 'none',
    color: 'transparent',
  },
  play: {
    size: 64,
    bg: 'color-mix(in srgb, var(--color-crimson-500) 15%, transparent)',
    border: '1.5px solid color-mix(in srgb, var(--color-crimson-500) 60%, transparent)',
    label: 'PLAY',
    blendMode: 'normal',
    backdropBlur: 'blur(8px)',
    color: 'var(--color-crimson-500)',
  },
  target: {
    size: 48,
    bg: 'color-mix(in srgb, var(--color-crimson-500) 10%, transparent)',
    border: '1.5px solid color-mix(in srgb, var(--color-crimson-500) 50%, transparent)',
    label: '⊕',
    blendMode: 'normal',
    backdropBlur: 'none',
    color: 'var(--color-crimson-500)',
  },
  text: {
    size: 32,
    bg: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    label: '',
    blendMode: 'difference',
    backdropBlur: 'none',
    color: 'transparent',
  },
  link: {
    size: 24,
    bg: 'var(--color-crimson-500)',
    border: 'none',
    label: '',
    blendMode: 'normal',
    backdropBlur: 'none',
    color: 'transparent',
  },
  drag: {
    size: 12,
    bg: 'var(--color-crimson-500)',
    border: 'none',
    label: '',
    blendMode: 'normal',
    backdropBlur: 'none',
    color: 'transparent',
  },
}

function applyDotConfig(dot: HTMLDivElement, cursorState: CursorState) {
  const cfg = CONFIG[cursorState]

  dot.style.width = `${cfg.size}px`
  dot.style.height = `${cfg.size}px`
  dot.style.background = cfg.bg
  dot.style.border = cfg.border
  dot.style.mixBlendMode = cfg.blendMode
  dot.style.backdropFilter = cfg.backdropBlur
  ;(dot.style as unknown as Record<string, string>)['webkitBackdropFilter'] = cfg.backdropBlur
  dot.style.color = cfg.color

  const label = dot.querySelector<HTMLSpanElement>('.cursor-dot-label')
  if (label) {
    label.textContent = cfg.label
    label.style.display = cfg.label ? 'flex' : 'none'
  }
}

export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null)
  const smoothRef = useRef({ x: 0, y: 0 })
  const sizeRef = useRef(12) // cached size to avoid parseFloat every frame

  // Subscribe to cursorState to apply style changes imperatively (bypassing
  // React render to avoid re-rendering the dot on every cursor move).
  useEffect(() => {
    // NOTE: Zustand's subscribe(listener) RETURNS its unsubscribe function, so
    // returning it directly wires the unsubscribe up as the effect cleanup.
    return useAppStore.subscribe((state) => {
      const dot = dotRef.current
      if (!dot) return
      applyDotConfig(dot, state.cursorState)
      sizeRef.current = CONFIG[state.cursorState].size
    })
  }, [])

  useAnimationLoop(() => {
    const dot = dotRef.current
    if (!dot) return

    const raw = useAppStore.getState().cursorPosition
    const smooth = smoothRef.current

    smooth.x += (raw.x - smooth.x) * CURSOR_LERP_FACTOR
    smooth.y += (raw.y - smooth.y) * CURSOR_LERP_FACTOR

    const offset = sizeRef.current / 2
    dot.style.transform = `translate(${smooth.x - offset}px, ${smooth.y - offset}px)`
  })

  const initCfg = CONFIG['default']

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9997,
        pointerEvents: 'none',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${initCfg.size}px`,
        height: `${initCfg.size}px`,
        background: initCfg.bg,
        border: initCfg.border,
        mixBlendMode: initCfg.blendMode,
        backdropFilter: initCfg.backdropBlur,
        color: initCfg.color,
        transition:
          'width 200ms ease, height 200ms ease, background 200ms ease, border 200ms ease, backdrop-filter 200ms ease',
        willChange: 'transform',
        transform: 'translate(-9999px, -9999px)',
      }}
    >
      <span
        className="cursor-dot-label"
        style={{
          display: 'none',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          userSelect: 'none',
        }}
      />
    </div>
  )
}
