import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlock } from '@/content/ContentProvider'
import type { BentoGridContent } from '@norav/content-schema'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { BentoVideoPlaceholder } from './BentoVideoPlaceholder'
import { OMNIGRID_PROJECT } from './bento.data'
import { SHIPMENTS, MINI_COLUMNS, STATUS_COLORS } from '../OmniGrid/omnigrid.data'
import type { ShipmentStatus } from '../OmniGrid/omnigrid.data'

interface Props {
  className?: string
}

type CacheStatus = 'FRESH' | 'STALE' | 'FETCHING'

const CACHE_CYCLE: CacheStatus[] = ['FRESH', 'FRESH', 'FRESH', 'STALE', 'FETCHING', 'FRESH']
const CACHE_COLORS: Record<CacheStatus, string> = {
  FRESH: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  STALE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  FETCHING: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

// Only use first 50 rows for the mini table
const MINI_DATA = SHIPMENTS.slice(0, 20)

export function OmniGridBentoTile({ className = '' }: Props) {
  const block = useBlock<BentoGridContent>('bento_grid')
  const copy = block?.content.projects.find((candidate) => candidate.project === 'omnigrid')
  const tileRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [cacheIdx, setCacheIdx] = useState(0)
  const cacheIdxRef = useRef(0)
  const [showLightning, setShowLightning] = useState(false)

  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [20, -20])

  // Cache status cycling — the transition check runs outside the setState
  // updater (updaters must be side-effect free), and the flash timeout is
  // cleared on unhover/unmount.
  useEffect(() => {
    if (!isHovered) return
    let flashTimer: ReturnType<typeof setTimeout> | null = null
    const interval = setInterval(() => {
      const prev = cacheIdxRef.current
      const next = (prev + 1) % CACHE_CYCLE.length
      cacheIdxRef.current = next
      setCacheIdx(next)
      if (CACHE_CYCLE[next] === 'FRESH' && CACHE_CYCLE[prev] === 'FETCHING') {
        setShowLightning(true)
        if (flashTimer) clearTimeout(flashTimer)
        flashTimer = setTimeout(() => setShowLightning(false), 600)
      }
    }, 2000)
    return () => {
      clearInterval(interval)
      if (flashTimer) clearTimeout(flashTimer)
    }
  }, [isHovered])

  const cacheStatus = CACHE_CYCLE[cacheIdx]!

  const table = useReactTable({
    data: MINI_DATA,
    columns: MINI_COLUMNS,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const visibleRows = table.getRowModel().rows.slice(0, 8)

  const handleScrollTo = useCallback(() => {
    document.getElementById('omnigrid')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div
      ref={tileRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bento-tile group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/20 hover:shadow-[0_0_60px_-12px_color-mix(in_srgb,_var(--color-cyan-500)_15%,_transparent)] ${className}`}
    >
      {/* Gradient mesh — cyan/teal */}
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--color-cyan-500) 60%, transparent) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(8,145,178,0.3) 0%, transparent 60%)',
        }}
      />

      <BentoVideoPlaceholder variant="omnigrid" active={isHovered} />

      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <motion.div className="relative p-6 md:p-8" style={{ y }}>
        {/* Case study watermark */}
        <div className="absolute top-4 right-6 md:right-8 font-mono text-[72px] md:text-[96px] font-black leading-none text-white/[0.02] select-none pointer-events-none tracking-tighter">
          04
        </div>

        {/* Cache status pill + Lightning */}
        <div className="absolute top-6 right-6 md:right-8 flex items-center gap-2">
          {showLightning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-cyan-400"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </motion.div>
          )}
          <span
            className={`px-2 py-0.5 text-[11px] font-mono tracking-wider border rounded-full transition-all duration-300 ${CACHE_COLORS[cacheStatus]}`}
          >
            {cacheStatus}
          </span>
        </div>

        {/* Label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-xs text-cyan-400/70 tracking-[0.25em] uppercase">
            Case Study 04
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2 group-hover:text-cyan-50 transition-colors duration-300">
          {copy?.title ?? ''}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/60 leading-relaxed mb-4 max-w-lg">
          {copy?.description ?? ''}
        </p>

        {/* Mini filter bar */}
        <div className="mb-3">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter..."
            className="w-full max-w-[200px] px-2.5 py-1 text-xs font-mono text-white/70 bg-black/40 border border-white/[0.08] rounded-md placeholder:text-white/35 focus:outline-none focus:border-cyan-500/30 transition-colors"
          />
        </div>

        {/* Mini Bloomberg table */}
        <div className="mb-5 rounded-lg bg-black/40 border border-white/[0.08] overflow-x-auto scrollbar-hidden" data-lenis-prevent>
          <table className="w-full min-w-[450px] text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-2 py-1.5 text-left text-white/40 font-normal tracking-wider uppercase cursor-pointer hover:text-cyan-400/80 transition-colors select-none"
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span className="text-cyan-400">↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span className="text-cyan-400">↓</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-2 py-1 ${
                        cell.column.id === 'status'
                          ? STATUS_COLORS[cell.getValue() as ShipmentStatus] ?? 'text-white/50'
                          : 'text-white/50'
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {OMNIGRID_PROJECT.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-mono text-white/45 bg-white/[0.04] border border-white/[0.08] rounded-md tracking-wide"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <MagneticButton
          onClick={handleScrollTo}
          aria-label={copy?.cta ?? ''}
          className="inline-flex items-center gap-2.5 text-xs font-mono text-cyan-400/80 uppercase tracking-[0.15em] group/btn hover:text-cyan-300 transition-colors duration-300"
        >
          <span className="relative">
            {copy?.cta ?? ''}
            <span className="absolute -bottom-px left-0 w-0 h-px bg-cyan-500/50 group-hover/btn:w-full transition-all duration-300" />
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300"
          >
            <path d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        </MagneticButton>
      </motion.div>

      {/* Bottom edge glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/30 transition-all duration-700" />
    </div>
  )
}
