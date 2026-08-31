import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useModalChrome } from '@/hooks/useModalChrome'

interface Props {
  onClose: () => void
}

const NODES = [
  { x: 20, width: 110, key: 'proof.architecture.tma' },
  { x: 160, width: 130, key: 'proof.architecture.storage' },
  { x: 320, width: 120, key: 'proof.architecture.edge' },
  { x: 470, width: 110, key: 'proof.architecture.gemini' },
  { x: 610, width: 100, key: 'proof.architecture.db' },
] as const

function ArchitectureModalContent({ onClose }: Props) {
  const { t } = useTranslation('bento')

  useModalChrome(onClose)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Content */}
        <motion.div
          className="relative max-w-3xl w-full rounded-2xl border border-white/[0.06] bg-gradient-to-br from-card to-background backdrop-blur-xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-crimson-500/40 to-transparent" />

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-400" />
                </span>
                <h3 className="font-mono text-xs text-white/60 uppercase tracking-[0.2em]">
                  {t('proof.architecture.title')}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/15 transition-all duration-200"
                aria-label={t('proof.architecture.close')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Architecture diagram */}
            <div className="overflow-x-auto" data-lenis-prevent>
              <svg viewBox="0 0 730 120" className="w-full h-auto min-w-[500px]">
                {/* Nodes */}
                {NODES.map((node) => (
                  <g key={node.key}>
                    <rect
                      x={node.x}
                      y={30}
                      width={node.width}
                      height={60}
                      rx={8}
                      fill="color-mix(in srgb, var(--color-crimson-500) 8%, transparent)"
                      stroke="color-mix(in srgb, var(--color-crimson-500) 25%, transparent)"
                      strokeWidth={1}
                    />
                    <text
                      x={node.x + node.width / 2}
                      y={65}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.6)"
                      fontSize={11}
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {t(node.key)}
                    </text>
                  </g>
                ))}

                {/* Connecting arrows */}
                {NODES.slice(0, -1).map((node, i) => {
                  const nextNode = NODES[i + 1]!
                  const x1 = node.x + node.width
                  const x2 = nextNode.x
                  const midY = 60

                  return (
                    <g key={`arrow-${i}`}>
                      <line
                        x1={x1 + 4}
                        y1={midY}
                        x2={x2 - 4}
                        y2={midY}
                        stroke="color-mix(in srgb, var(--color-crimson-500) 35%, transparent)"
                        strokeWidth={1.5}
                        strokeDasharray="8 8"
                        className="animate-dash-flow"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                      {/* Arrowhead */}
                      <polygon
                        points={`${x2 - 4},${midY - 4} ${x2 - 4},${midY + 4} ${x2},${midY}`}
                        fill="color-mix(in srgb, var(--color-crimson-500) 40%, transparent)"
                      />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Flow description */}
            <div className="mt-6 grid grid-cols-5 gap-2">
              {['1. Upload', '2. Store', '3. Process', '4. Analyze', '5. Update'].map((step, i) => (
                <div key={i} className="text-center">
                  <span className="font-mono text-[11px] text-crimson-400/50 tracking-wide">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function ProofArchitectureModal({ onClose }: Props) {
  return createPortal(
    <ArchitectureModalContent onClose={onClose} />,
    document.body
  )
}
