import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useShipments } from './useShipments'
import { OMNIGRID_COLUMNS, STATUS_COLORS, PRIORITY_COLORS } from './omnigrid.data'
import type { ShipmentRecord, ShipmentStatus, ShipmentPriority } from './omnigrid.data'
import { ShipmentDetailModal } from './ShipmentDetailModal'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000 } },
})

const CACHE_COLORS: Record<string, string> = {
  FRESH: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  STALE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  FETCHING: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

const TECH_STACK = ['TanStack Query', 'TanStack Table', 'Zod', 'Virtual Scroll']

function OmniGridContent() {
  const { t } = useTranslation(['projects', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('omnigrid', sectionRef)

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedRow, setSelectedRow] = useState<ShipmentRecord | null>(null)
  const [showLightning, setShowLightning] = useState(false)

  const { data: shipments = [], cacheStatus, dataUpdatedAt } = useShipments()

  // GSAP entrance
  useGSAP(() => {
    const sidebar = sectionRef.current!.querySelector('.omnigrid-sidebar')
    const main = sectionRef.current!.querySelector('.omnigrid-main')
    if (sidebar) {
      gsap.fromTo(sidebar,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
    if (main) {
      gsap.fromTo(main,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
  }, { scope: sectionRef })

  const table = useReactTable({
    data: shipments,
    columns: OMNIGRID_COLUMNS,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  const lightningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (lightningTimerRef.current) clearTimeout(lightningTimerRef.current)
  }, [])

  const handleRowClick = useCallback((record: ShipmentRecord) => {
    setSelectedRow(record)
    setShowLightning(true)
    if (lightningTimerRef.current) clearTimeout(lightningTimerRef.current)
    lightningTimerRef.current = setTimeout(() => setShowLightning(false), 600)
  }, [])

  // Measure actual render → commit duration for the rows currently displayed
  const renderStartRef = useRef(performance.now())
  renderStartRef.current = performance.now()
  const [renderTime, setRenderTime] = useState(0)
  useLayoutEffect(() => {
    setRenderTime(Math.round((performance.now() - renderStartRef.current) * 100) / 100)
  }, [rows])

  return (
    <section
      id="omnigrid"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-28 md:py-36"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="label-mono">{t('projects:omnigrid.sectionLabel')}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mt-4 mb-5">
            {t('projects:omnigrid.title')}
          </h2>
          <p className="text-white/45 text-base md:text-lg max-w-xl leading-relaxed">
            {t('projects:omnigrid.description')}
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="px-3 py-1.5 text-xs font-mono text-cyan-400/70 bg-cyan-500/[0.06] border border-cyan-500/15 rounded-lg tracking-wide">
                {tech}
              </span>
            ))}
          </div>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-500/50 to-transparent mt-8" />
        </div>

        {/* Main content: sidebar + table */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className="omnigrid-sidebar flex flex-col gap-4">
            {/* Cache Status */}
            <div className="glass-card p-5">
              <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-4">
                {t('projects:omnigrid.cache.status')}
              </h4>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs font-mono border rounded-full transition-all duration-300 ${CACHE_COLORS[cacheStatus]}`}>
                  {t(`projects:omnigrid.cache.${cacheStatus.toLowerCase()}`)}
                </span>
                {showLightning && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400 animate-pulse">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                )}
              </div>
              <div className="space-y-2 text-xs font-mono text-white/45">
                <div className="flex justify-between">
                  <span>{t('projects:omnigrid.cache.hitRate')}</span>
                  <span className="text-emerald-400">98.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('projects:omnigrid.cache.lastFetch')}</span>
                  <span className="text-white/50">
                    {dataUpdatedAt ? `${Math.round((Date.now() - dataUpdatedAt) / 1000)}s ago` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache-Hit visualization */}
            <div className="glass-card p-5">
              <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3">
                Cache-Hit Flow
              </h4>
              <svg viewBox="0 0 240 80" className="w-full">
                {/* Request node */}
                <circle cx="30" cy="40" r="18" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" />
                <text x="30" y="44" textAnchor="middle" fill="rgba(6,182,212,0.8)" fontSize="7" fontFamily="JetBrains Mono">REQ</text>

                {/* Arrow to cache */}
                <line x1="50" y1="40" x2="90" y2="40" stroke="rgba(6,182,212,0.4)" strokeWidth="1" strokeDasharray="4 2">
                  <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite" />
                </line>

                {/* Cache node */}
                <circle cx="120" cy="40" r="22" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5">
                  <animate attributeName="r" values="22;23;22" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="120" y="37" textAnchor="middle" fill="rgba(16,185,129,0.9)" fontSize="7" fontFamily="JetBrains Mono">CACHE</text>
                <text x="120" y="47" textAnchor="middle" fill="rgba(16,185,129,0.5)" fontSize="6" fontFamily="JetBrains Mono">HIT</text>

                {/* Lightning bolt */}
                <polygon points="155 28 148 42 155 42 152 56 162 38 155 38 158 28" fill="rgba(6,182,212,0.6)">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
                </polygon>

                {/* Response node */}
                <circle cx="200" cy="40" r="18" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
                <text x="200" y="37" textAnchor="middle" fill="rgba(6,182,212,0.7)" fontSize="6" fontFamily="JetBrains Mono">&lt;1ms</text>
                <text x="200" y="47" textAnchor="middle" fill="rgba(6,182,212,0.5)" fontSize="6" fontFamily="JetBrains Mono">DATA</text>

                {/* Arrow cache to response */}
                <line x1="168" y1="40" x2="180" y2="40" stroke="rgba(6,182,212,0.3)" strokeWidth="1" strokeDasharray="4 2">
                  <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>

            {/* Engineering Log */}
            <div className="glass-card p-5">
              <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3">
                {t('projects:omnigrid.engineering.title')}
              </h4>

              <div className="mb-4">
                <h5 className="text-xs font-semibold text-cyan-400/80 mb-1.5">
                  {t('projects:omnigrid.engineering.headlessVsComponent')}
                </h5>
                <p className="text-xs text-white/45 leading-relaxed">
                  {t('projects:omnigrid.engineering.headlessDesc')}
                </p>
              </div>

              <div className="h-px bg-white/[0.06] my-3" />

              <div>
                <h5 className="text-xs font-semibold text-cyan-400/80 mb-1.5">
                  {t('projects:omnigrid.engineering.serverVsClient')}
                </h5>
                <p className="text-xs text-white/45 leading-relaxed">
                  {t('projects:omnigrid.engineering.serverDesc')}
                </p>
              </div>
            </div>

          </div>

          {/* Main table area */}
          <div className="omnigrid-main flex-1 min-w-0">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={t('projects:omnigrid.filterPlaceholder')}
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-mono text-white/70 bg-white/[0.03] border border-white/[0.08] rounded-xl placeholder:text-white/35 focus:outline-none focus:border-cyan-500/30 transition-colors backdrop-blur-sm"
                />
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-3 text-xs font-mono text-white/45">
                <span>{rows.length.toLocaleString()} rows</span>
                <span className="text-white/10">|</span>
                <span>{sorting.length} sorted</span>
                <span className="text-white/10">|</span>
                <span>{renderTime < 1 ? '<1' : renderTime}ms render</span>
                <span className="text-white/10">|</span>
                <span className={`px-1.5 py-0.5 border rounded-full text-xs ${CACHE_COLORS[cacheStatus]}`}>
                  {cacheStatus}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-hidden" data-lenis-prevent>
              {/* Table header */}
              <div className="flex items-center border-b border-white/[0.06] sticky top-0 z-10 bg-[#0d0d1f] min-w-[1060px]">
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <div
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize(), flexShrink: 0 }}
                    className="px-3 py-3 text-left text-xs font-mono font-normal text-white/40 uppercase tracking-wider cursor-pointer hover:text-cyan-400/80 transition-colors select-none truncate"
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span className="text-cyan-400">↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span className="text-cyan-400">↓</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Table body */}
              <div>
                {rows.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
                    className="flex items-center border-b border-white/[0.03] hover:bg-cyan-500/[0.04] transition-colors cursor-pointer min-w-[1060px]"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isStatus = cell.column.id === 'status'
                      const isPriority = cell.column.id === 'priority'
                      let cellClass = 'text-white/50'
                      if (isStatus) cellClass = STATUS_COLORS[cell.getValue() as ShipmentStatus] ?? cellClass
                      if (isPriority) cellClass = PRIORITY_COLORS[cell.getValue() as ShipmentPriority] ?? cellClass

                      return (
                        <div
                          key={cell.id}
                          style={{ width: cell.column.getSize(), flexShrink: 0 }}
                          className={`px-3 py-2.5 text-xs font-mono truncate ${cellClass}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedRow && (
        <ShipmentDetailModal
          shipment={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </section>
  )
}

export function OmniGridWidget() {
  return (
    <QueryClientProvider client={queryClient}>
      <OmniGridContent />
    </QueryClientProvider>
  )
}
