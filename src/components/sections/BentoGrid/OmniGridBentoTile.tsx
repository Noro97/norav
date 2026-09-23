import { useEffect, useRef, useState } from 'react'
import { useBlock } from '@/content/ContentProvider'
import { useOpenSection } from '@/content/navigation'
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
  FRESH: 'bg-status-success/20 text-status-success border-status-success/30',
  STALE: 'bg-status-warning/20 text-status-warning border-status-warning/30',
  FETCHING: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
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

  // The compiler cannot memoise TanStack Table's returned functions and says so; it skips this component, which is fine.
  // eslint-disable-next-line react-hooks/incompatible-library
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

  // Opens the OmniGrid case study — its page, or its section if it is on this one.
  const openCaseStudy = useOpenSection('omnigrid')

  return (
    <div
      ref={tileRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bento-tile group relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl transition-all duration-500 hover:border-secondary-500/20 hover:shadow-[0_0_60px_-12px_color-mix(in_srgb,_var(--color-secondary-500)_15%,_transparent)] ${className}`}
    >
      {/* Gradient mesh — cyan/teal */}
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--color-secondary-500) 60%, transparent) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, color-mix(in srgb, var(--color-secondary-600) 30%, transparent) 0%, transparent 60%)',
        }}
      />

      <BentoVideoPlaceholder variant="omnigrid" active={isHovered} />

      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-secondary-500/40 to-transparent" />

      <motion.div className="relative p-6 md:p-8" style={{ y }}>
        {/* Case study watermark */}
        <div className="absolute top-4 right-6 md:right-8 font-mono text-[72px] md:text-[96px] font-black leading-none text-tertiary-ink/[0.02] select-none pointer-events-none tracking-tighter">
          04
        </div>

        {/* Cache status pill + Lightning */}
        <div className="absolute top-6 right-6 md:right-8 flex items-center gap-2">
          {showLightning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-secondary-400"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </motion.div>
          )}
          <span
            className={`px-2 py-0.5 text-caption font-mono tracking-wider border rounded-full transition-all duration-300 ${CACHE_COLORS[cacheStatus]}`}
          >
            {cacheStatus}
          </span>
        </div>

        {/* Label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="type-label text-secondary-400/70">
            Case Study 04
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-tertiary-ink/[0.06] to-transparent" />
        </div>

        {/* Title */}
        <h3 className="font-display text-heading-small font-black text-tertiary-ink mb-2 group-hover:text-secondary-50 transition-colors duration-300">
          {copy?.title ?? ''}
        </h3>

        {/* Description */}
        <p className="text-body-small text-tertiary-ink/60 leading-relaxed mb-4 max-w-lg">
          {copy?.description ?? ''}
        </p>

        {/* Mini filter bar */}
        <div className="mb-3">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter..."
            className="w-full max-w-[200px] px-2.5 py-1 text-caption font-mono text-tertiary-ink/70 bg-tertiary-shade/40 border border-tertiary-ink/[0.08] rounded-md placeholder:text-tertiary-ink/35 focus:outline-none focus:border-secondary-500/30 transition-colors"
          />
        </div>

        {/* Mini Bloomberg table */}
        <div className="mb-5 rounded-lg bg-tertiary-shade/40 border border-tertiary-ink/[0.08] overflow-x-auto scrollbar-hidden">
          <table className="w-full min-w-[450px] text-caption font-mono">
            <thead>
              <tr className="border-b border-tertiary-ink/[0.06]">
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-2 py-1.5 text-left text-tertiary-ink/40 font-normal tracking-wider uppercase cursor-pointer hover:text-secondary-400/80 transition-colors select-none"
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span className="text-secondary-400">↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span className="text-secondary-400">↓</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-tertiary-ink/[0.03] hover:bg-tertiary-ink/[0.02] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-2 py-1 ${
                        cell.column.id === 'status'
                          ? STATUS_COLORS[cell.getValue() as ShipmentStatus] ?? 'text-tertiary-ink/50'
                          : 'text-tertiary-ink/50'
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
              className="px-2.5 py-1 text-caption font-mono text-tertiary-ink/45 bg-tertiary-ink/[0.04] border border-tertiary-ink/[0.08] rounded-md tracking-wide"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <MagneticButton
          onClick={openCaseStudy}
          aria-label={copy?.cta ?? ''}
          className="type-label inline-flex items-center gap-2.5 text-secondary-400/80 group/btn hover:text-secondary-300 transition-colors duration-300"
        >
          <span className="relative">
            {copy?.cta ?? ''}
            <span className="absolute -bottom-px left-0 w-0 h-px bg-secondary-500/50 group-hover/btn:w-full transition-all duration-300" />
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
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary-500/0 to-transparent group-hover:via-secondary-500/30 transition-all duration-700" />
    </div>
  )
}
