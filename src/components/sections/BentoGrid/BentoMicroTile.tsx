import { useRef } from 'react'
import { useBlock } from '@/content/ContentProvider'
import type { BentoGridContent } from '@norav/content-schema'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Zap, Shield, User, Brain, Database } from 'lucide-react'

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  zap: Zap, shield: Shield, user: User, brain: Brain, database: Database,
}

// Pull the hero stat from each micro-tile description
const HERO_STATS = ['60%', '99%', '15s', '98.4%', '10K+']

interface BentoMicroTileProps {
  index: number
  icon: string
  illustration?: string
}

export function BentoMicroTile({ index, icon, illustration }: BentoMicroTileProps) {
  const block = useBlock<BentoGridContent>('bento_grid')
  const tile = block?.content.tiles.find((candidate) => candidate.slot === index)
  const tileRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [20, -20])

  return (
    <div ref={tileRef} className="bento-tile group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.025] to-transparent backdrop-blur-xl p-5 md:p-6 flex flex-col transition-all duration-500 hover:border-crimson-500/15">
      {/* Illustration */}
      {illustration && (
        <img
          src={illustration}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain object-center opacity-15 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
        />
      )}

      {/* Ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-crimson-500/[0.03] blur-2xl group-hover:bg-crimson-500/[0.06] transition-all duration-700 pointer-events-none" />

      <motion.div style={{ y }}>
      {/* Icon with glow ring */}
      <div className="relative w-8 h-8 rounded-lg bg-crimson-500/[0.08] border border-crimson-500/15 flex items-center justify-center text-crimson-400/70 mb-4 group-hover:border-crimson-500/30 group-hover:text-crimson-400 transition-all duration-300">
        {(() => {
          const IconComp = ICONS[icon] ?? Zap
          return <IconComp size={16} />
        })()}
        <div className="absolute inset-0 rounded-lg bg-crimson-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Hero stat — the number that pops */}
      <span className="font-mono text-2xl font-black text-white/90 tracking-tight mb-1">
        {HERO_STATS[index]}
      </span>

      {/* Title */}
      <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
        {tile?.title ?? ''}
      </h3>

      {/* Description */}
      <p className="text-xs text-white/50 leading-relaxed mt-auto">
        {tile?.description ?? ''}
      </p>
      </motion.div>

      {/* Corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
        <div className="absolute bottom-3 right-3 w-px h-4 bg-gradient-to-t from-white/[0.06] to-transparent" />
        <div className="absolute bottom-3 right-3 h-px w-4 bg-gradient-to-l from-white/[0.06] to-transparent" />
      </div>
    </div>
  )
}
