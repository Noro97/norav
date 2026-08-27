import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { BORING_CODE, ARCHITECTURE_NODES } from './vibecoding.data'

// Token-based syntax highlighting — avoids regex cascade corruption
const KEYWORDS = new Set(['async', 'function', 'const', 'await', 'return', 'throw', 'new', 'if'])

function highlightLine(line: string): string {
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  let result = ''
  let i = 0

  while (i < escaped.length) {
    // String literals
    if (escaped[i] === "'" || escaped[i] === '&' && escaped.slice(i, i + 6) === '&quot;') {
      const quote = escaped[i] === "'" ? "'" : '&quot;'
      const end = escaped.indexOf(quote, i + quote.length)
      if (end !== -1) {
        const str = escaped.slice(i, end + quote.length)
        result += `<span class="text-emerald-400">${str}</span>`
        i = end + quote.length
        continue
      }
    }

    // Words (keywords, identifiers, numbers)
    const wordMatch = escaped.slice(i).match(/^[a-zA-Z_]\w*/)
    if (wordMatch) {
      const word = wordMatch[0]
      if (KEYWORDS.has(word)) {
        result += `<span class="text-crimson-400">${word}</span>`
      } else {
        result += word
      }
      i += word.length
      continue
    }

    // Numbers
    const numMatch = escaped.slice(i).match(/^\d+/)
    if (numMatch) {
      result += `<span class="text-sky-400">${numMatch[0]}</span>`
      i += numMatch[0].length
      continue
    }

    result += escaped[i]
    i++
  }

  return result
}

const HIGHLIGHTED_CODE = BORING_CODE.split('\n').map(highlightLine).join('\n')

const NODE_HEIGHT = 48

export interface VibeSliderCopy {
  lowVibe: string
  highVibe: string
  boringLabel: string
  archLabel: string
  /** Label per architecture node id; a node without one renders untitled. */
  nodeLabels: Record<string, string>
}

export function VibeSlider({ copy }: { copy: VibeSliderCopy }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const vibeValue = useMotionValue(0) // 0–100

  // Derived transforms
  const rotateY = useTransform(vibeValue, [0, 50, 100], [0, 90, 180])
  const codeOpacity = useTransform(vibeValue, [0, 40, 50], [1, 1, 0])
  const archOpacity = useTransform(vibeValue, [50, 60, 100], [0, 1, 1])
  const thumbLeft = useTransform(vibeValue, (v) => `${v}%`)
  const filenameOpacity = useTransform(vibeValue, [40, 60], [1, 0])
  const archFilenameOpacity = useTransform(vibeValue, [40, 60], [0, 1])

  const updateValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
      vibeValue.set(pct)
    },
    [vibeValue]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      updateValue(e.clientX)
    },
    [updateValue]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      updateValue(e.clientX)
    },
    [updateValue]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  // Snap to ends on double-click
  const onDoubleClick = useCallback(() => {
    const current = vibeValue.get()
    animate(vibeValue, current < 50 ? 100 : 0, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })
  }, [vibeValue])

  return (
    <div className="flex flex-col gap-5">
      {/* Display card */}
      <div
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl overflow-hidden"
        style={{ perspective: 800 }}
      >
        {/* macOS chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 relative">
            <motion.span
              className="font-mono text-xs text-white/40 absolute left-0 whitespace-nowrap"
              style={{ opacity: filenameOpacity }}
            >
              {copy.boringLabel}
            </motion.span>
            <motion.span
              className="font-mono text-xs text-white/40 whitespace-nowrap"
              style={{ opacity: archFilenameOpacity }}
            >
              {copy.archLabel}
            </motion.span>
          </div>
        </div>

        {/* Content area with 3D flip */}
        <div className="relative h-[400px] md:h-[460px] overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              rotateY,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Front: Boring code */}
            <motion.div
              className="absolute inset-0 p-5 overflow-hidden"
              style={{ opacity: codeOpacity, backfaceVisibility: 'hidden' }}
            >
              <pre
                className="font-mono text-xs md:text-xs leading-relaxed text-white/60 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: HIGHLIGHTED_CODE }}
              />
              {/* Scanline overlay for code */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
            </motion.div>
          </motion.div>

          {/* Back: Architecture diagram (counter-rotated so it reads correctly) */}
          <motion.div
            className="absolute inset-0"
            style={{
              rotateY: useTransform(rotateY, (v) => v - 180),
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <motion.div
              className="absolute inset-0 p-4"
              style={{ opacity: archOpacity }}
            >
              <ArchitectureDiagram nodeLabels={copy.nodeLabels} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Slider control */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-mono text-xs text-white/45 uppercase tracking-wider">
            {copy.lowVibe}
          </span>
          <span className="font-mono text-xs text-crimson-500/60 uppercase tracking-wider">
            {copy.highVibe}
          </span>
        </div>

        {/* Custom track */}
        <div
          ref={trackRef}
          className="relative h-8 flex items-center cursor-pointer select-none touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={onDoubleClick}
          data-cursor="link"
        >
          {/* Track background */}
          <div className="absolute inset-x-0 h-1 rounded-full bg-white/[0.06]">
            {/* Filled portion */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/10 to-crimson-500/40"
              style={{ width: thumbLeft }}
            />
          </div>

          {/* Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-crimson-500 shadow-[0_0_12px_color-mix(in_srgb,_var(--color-crimson-500)_40%,_transparent)] border-2 border-white/20 transition-shadow hover:shadow-[0_0_20px_color-mix(in_srgb,_var(--color-crimson-500)_60%,_transparent)]"
            style={{ left: thumbLeft }}
          />
        </div>
      </div>
    </div>
  )
}

// Architecture diagram component — vertical tree layout
function ArchitectureDiagram({ nodeLabels }: { nodeLabels: Record<string, string> }) {
  return (
    <svg
      viewBox="0 0 400 480"
      className="w-full h-full"
      role="img"
      aria-label="Proof project architecture: TMA to Auth to Edge Functions to Gemini AI and DB"
    >
      {/* Connection paths (vertical bezier curves) */}
      {ARCHITECTURE_NODES.map((node) =>
        node.connections.map((targetId) => {
          const target = ARCHITECTURE_NODES.find((n) => n.id === targetId)
          if (!target) return null

          const x1 = node.x + node.width / 2
          const y1 = node.y + NODE_HEIGHT
          const x2 = target.x + target.width / 2
          const y2 = target.y
          const midY = (y1 + y2) / 2

          return (
            <g key={`${node.id}-${targetId}`}>
              <path
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="color-mix(in srgb, var(--color-crimson-500) 30%, transparent)"
                strokeWidth={1.5}
                strokeDasharray="8 8"
                className="animate-dash-flow"
              />
              {/* Arrowhead at target */}
              <polygon
                points={`${x2 - 5},${y2 - 1} ${x2 + 5},${y2 - 1} ${x2},${y2 + 5}`}
                fill="color-mix(in srgb, var(--color-crimson-500) 40%, transparent)"
              />
              {/* Pulse dot at source */}
              <circle cx={x1} cy={y1} r={3} fill="color-mix(in srgb, var(--color-crimson-500) 50%, transparent)">
                <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )
        })
      )}

      {/* Nodes */}
      {ARCHITECTURE_NODES.map((node) => (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={NODE_HEIGHT}
            rx={10}
            fill="color-mix(in srgb, var(--color-crimson-500) 8%, transparent)"
            stroke="color-mix(in srgb, var(--color-crimson-500) 25%, transparent)"
            strokeWidth={1}
          />
          <text
            x={node.x + node.width / 2}
            y={node.y + NODE_HEIGHT / 2 + 5}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize={14}
            fontFamily="'JetBrains Mono', monospace"
          >
            {nodeLabels[node.id] ?? ''}
          </text>
        </g>
      ))}
    </svg>
  )
}
