import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

type WalletState = 'idle' | 'connecting' | 'connected'

function AnimatedBalance({ target, decimals = 0, active }: { target: number; decimals?: number; active: boolean }) {
  const motionValue = useMotionValue(0)
  const display = useTransform(motionValue, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  )

  useEffect(() => {
    if (!active) {
      motionValue.set(0)
      return
    }
    const controls = animate(motionValue, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    })
    return controls.stop
  }, [active, target, motionValue, decimals])

  return (
    <motion.span className="font-mono text-lg font-bold text-white tabular-nums">
      {display}
    </motion.span>
  )
}

export function ProofEconomyTile() {
  const { t } = useTranslation('bento')
  const tileRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(tileRef, { once: true, margin: '-50px' })
  const [walletState, setWalletState] = useState<WalletState>('idle')

  const handleConnect = () => {
    if (walletState !== 'idle') return
    setWalletState('connecting')
    setTimeout(() => setWalletState('connected'), 1200)
  }

  const isConnected = walletState === 'connected'

  return (
    <div
      ref={tileRef}
      className="bento-tile group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.025] to-transparent backdrop-blur-xl p-5 md:p-6 flex flex-col transition-all duration-500 hover:border-crimson-500/15"
    >
      {/* Ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-crimson-500/[0.03] blur-2xl group-hover:bg-crimson-500/[0.06] transition-all duration-700 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-crimson-400/70">
          <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-7l-1.5-1.5" />
          <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-7l-1.5-1.5" />
        </svg>
        <h3 className="font-mono text-xs text-white/60 uppercase tracking-[0.2em]">
          {t('proof.economy.label')}
        </h3>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400/70">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              {t('proof.economy.starsBalance')}
            </span>
          </div>
          <AnimatedBalance target={2450} active={isConnected && isInView} />
        </div>
        <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400/70">
              <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
            </svg>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              {t('proof.economy.tonBalance')}
            </span>
          </div>
          <AnimatedBalance target={0.85} decimals={2} active={isConnected && isInView} />
        </div>
      </div>

      {/* Connect Wallet button */}
      <button
        onClick={handleConnect}
        disabled={walletState !== 'idle'}
        className={`w-full py-2 px-3 rounded-lg font-mono text-xs uppercase tracking-wider border transition-all duration-300 mb-4 ${
          walletState === 'idle'
            ? 'border-crimson-500/20 text-crimson-400/60 bg-crimson-500/[0.05] hover:bg-crimson-500/[0.1] hover:border-crimson-500/30 cursor-pointer'
            : walletState === 'connecting'
              ? 'border-crimson-500/15 text-crimson-400/40 bg-crimson-500/[0.03]'
              : 'border-green-500/20 text-green-400/60 bg-green-500/[0.05]'
        }`}
        data-cursor="link"
      >
        {walletState === 'idle' && t('proof.economy.connectWallet')}
        {walletState === 'connecting' && (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 border border-crimson-400/40 border-t-crimson-400 rounded-full animate-spin" />
            Connecting...
          </span>
        )}
        {walletState === 'connected' && (
          <span className="inline-flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t('proof.economy.connected')}
          </span>
        )}
      </button>

      {/* Transaction flow SVG */}
      <div className="mt-auto">
        <p className="font-mono text-[10px] text-white/45 uppercase tracking-wider mb-2">
          {t('proof.economy.txFlow')}
        </p>
        <svg viewBox="0 0 260 40" className="w-full h-auto" aria-hidden="true">
          {/* Nodes */}
          {[
            { x: 5, label: 'User' },
            { x: 70, label: 'Stars' },
            { x: 135, label: 'Webhook' },
            { x: 200, label: 'Premium' },
          ].map((node) => (
            <g key={node.label}>
              <rect
                x={node.x}
                y={8}
                width={50}
                height={24}
                rx={6}
                fill="rgba(181,26,43,0.08)"
                stroke={isConnected ? 'rgba(181,26,43,0.3)' : 'rgba(181,26,43,0.1)'}
                strokeWidth={0.8}
              />
              <text
                x={node.x + 25}
                y={23}
                textAnchor="middle"
                fill={isConnected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
              >
                {node.label}
              </text>
            </g>
          ))}
          {/* Arrows */}
          {[55, 120, 185].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={20}
              x2={x + 15}
              y2={20}
              stroke={isConnected ? 'rgba(181,26,43,0.4)' : 'rgba(181,26,43,0.1)'}
              strokeWidth={1}
              strokeDasharray="4 4"
              className={isConnected ? 'animate-dash-flow' : ''}
              style={isConnected ? { animationDelay: `${i * 0.3}s` } : undefined}
            />
          ))}
        </svg>
      </div>

      {/* Corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
        <div className="absolute bottom-3 right-3 w-px h-4 bg-gradient-to-t from-white/[0.06] to-transparent" />
        <div className="absolute bottom-3 right-3 h-px w-4 bg-gradient-to-l from-white/[0.06] to-transparent" />
      </div>
    </div>
  )
}
