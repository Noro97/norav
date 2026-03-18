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
    bg: '#B51A2B',
    border: 'none',
    label: '',
    blendMode: 'normal',
    backdropBlur: 'none',
    color: 'transparent',
  },
  play: {
    size: 64,
    bg: 'rgba(181, 26, 43, 0.15)',
    border: '1.5px solid rgba(181, 26, 43, 0.6)',
    label: 'PLAY',
    blendMode: 'normal',
    backdropBlur: 'blur(8px)',
    color: '#B51A2B',
  },
  target: {
    size: 48,
    bg: 'rgba(181, 26, 43, 0.1)',
    border: '1.5px solid rgba(181, 26, 43, 0.5)',
    label: '⊕',
    blendMode: 'normal',
    backdropBlur: 'none',
    color: '#B51A2B',
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
    bg: '#B51A2B',
    border: 'none',
    label: '',
    blendMode: 'normal',
    backdropBlur: 'none',
    color: 'transparent',
  },
  drag: {
    size: 12,
    bg: '#B51A2B',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Subscribe to cursorState to apply style changes imperatively
  useEffect(() => {
    // Zustand 5: subscribe(listener) — one arg only
    return useAppStore.subscribe((state) => {
      const dot = dotRef.current
      if (!dot) return
      applyDotConfig(dot, state.cursorState)
    })
  }, [])

  useAnimationLoop(() => {
    const dot = dotRef.current
    if (!dot) return

    const raw = useAppStore.getState().cursorPosition
    const smooth = smoothRef.current

    smooth.x += (raw.x - smooth.x) * CURSOR_LERP_FACTOR
    smooth.y += (raw.y - smooth.y) * CURSOR_LERP_FACTOR

    // Read current size to center the dot on the cursor
    const size = parseFloat(dot.style.width) || 12
    const offset = size / 2

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
