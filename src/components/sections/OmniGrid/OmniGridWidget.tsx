import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useReveal } from '@/hooks/useReveal'
import { useBlock } from '@/content/ContentProvider'
import { useCaseStudyLabel } from '@/content/case-studies'
import { GalleryVariant } from '@/components/ui/effects/GalleryVariant'
import type { CaseStudyContent, CaseStudySettings } from '@norav/content-schema'
import { useShipments } from './useShipments'
import { OMNIGRID_COLUMNS, STATUS_COLORS, PRIORITY_COLORS } from './omnigrid.data'
import type { ShipmentRecord, ShipmentStatus, ShipmentPriority } from './omnigrid.data'
import { ShipmentDetailModal } from './ShipmentDetailModal'
import { AnimatePresence } from 'framer-motion'
import { originOf } from '@/lib/motion'
import type { ModalOrigin } from '@/components/ui/ModalShell'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000 } },
})

const CACHE_COLORS: Record<string, string> = {
  FRESH: 'bg-status-success/20 text-status-success border-status-success/30',
  STALE: 'bg-status-warning/20 text-status-warning border-status-warning/30',
  FETCHING: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
}


function OmniGridContent({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CaseStudyContent, CaseStudySettings>('omnigrid')
  // Before the early return: the number is a hook, and a hook cannot sit
  // behind a conditional.
  const sectionLabel = useCaseStudyLabel('omnigrid', block?.content.sectionLabel ?? '')
  const { t } = useTranslation(['projects', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'omnigrid', sectionRef)

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedRow, setSelectedRow] = useState<ShipmentRecord | null>(null)
  // Where the row was clicked — the modal grows out of that point.
  const [modalOrigin, setModalOrigin] = useState<ModalOrigin | null>(null)
  const [showLightning, setShowLightning] = useState(false)

  const { data: shipments = [], cacheStatus, dataUpdatedAt } = useShipments()

  useReveal(sectionRef, '.omnigrid-sidebar, .omnigrid-main')

  // The compiler cannot memoise TanStack Table's returned functions and says so; it skips this component, which is fine.
  // eslint-disable-next-line react-hooks/incompatible-library
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

  const handleRowClick = useCallback((record: ShipmentRecord, origin: ModalOrigin) => {
    setModalOrigin(origin)
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

  if (!block) return null
  const { content, settings } = block
  const screenshots = content.screenshots.map((s) => s.image).filter(Boolean)

  return (
    <section
      id={anchorId ?? 'omnigrid'}
      ref={sectionRef}
      className="relative px-gutter-x py-28 md:py-36"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-content mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="label-mono">{sectionLabel}</span>
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-4 mb-5">
            {content.title}
          </h2>
          <p className="text-tertiary-ink/45 text-body-regular md:text-body-large max-w-xl leading-relaxed">
            {content.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {content.techStack.map((tech) => (
              <span key={tech.name} className="case-study-pill text-caption font-mono text-secondary-400/70 tracking-wide">
                {tech.name}
              </span>
            ))}
          </div>
          <div className="h-px w-24 bg-gradient-to-r from-secondary-500/50 to-transparent mt-8" />
        </div>

        {/* Main content: sidebar + table */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className="omnigrid-sidebar flex flex-col gap-4">
            {/* Cache Status */}
            <div className="case-study-card p-5">
              <h4 className="type-label text-tertiary-ink/40 mb-4">
                {t('projects:omnigrid.cache.status')}
              </h4>
              <div className="flex items-center gap-3 mb-4">
                <span className={`case-study-pill text-caption font-mono transition-all duration-300 ${CACHE_COLORS[cacheStatus]}`}>
                  {t(`projects:omnigrid.cache.${cacheStatus.toLowerCase()}`)}
                </span>
                {showLightning && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-secondary-400 animate-pulse">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                )}
              </div>
              <div className="space-y-2 text-caption font-mono text-tertiary-ink/45">
                <div className="flex justify-between">
                  <span>{t('projects:omnigrid.cache.hitRate')}</span>
                  <span className="text-secondary-300 font-semibold">98.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('projects:omnigrid.cache.lastFetch')}</span>
                  <span className="text-tertiary-ink/50">
                    {dataUpdatedAt ? `${Math.round((Date.now() - dataUpdatedAt) / 1000)}s ago` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache-Hit visualization */}
            <div className="case-study-card p-5">
              <h4 className="type-label text-tertiary-ink/40 mb-3">
                Cache-Hit Flow
              </h4>
              <svg viewBox="0 0 240 80" className="w-full">
                {/* Request node */}
                <circle cx="30" cy="40" r="18" fill="color-mix(in srgb, var(--color-secondary-500) 15%, transparent)" stroke="color-mix(in srgb, var(--color-secondary-500) 40%, transparent)" strokeWidth="1.5" />
                <text x="30" y="44" textAnchor="middle" fill="color-mix(in srgb, var(--color-secondary-500) 80%, transparent)" fontSize="7" fontFamily="var(--font-mono)">REQ</text>

                {/* Arrow to cache */}
                <line x1="50" y1="40" x2="90" y2="40" stroke="color-mix(in srgb, var(--color-secondary-500) 40%, transparent)" strokeWidth="1" strokeDasharray="4 2">
                  <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite" />
                </line>

                {/* Cache node */}
                <circle cx="120" cy="40" r="22" fill="color-mix(in srgb, var(--color-status-success) 15%, transparent)" stroke="color-mix(in srgb, var(--color-status-success) 50%, transparent)" strokeWidth="1.5">
                  <animate attributeName="r" values="22;23;22" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="120" y="37" textAnchor="middle" fill="color-mix(in srgb, var(--color-status-success) 90%, transparent)" fontSize="7" fontFamily="var(--font-mono)">CACHE</text>
                <text x="120" y="47" textAnchor="middle" fill="color-mix(in srgb, var(--color-status-success) 50%, transparent)" fontSize="6" fontFamily="var(--font-mono)">HIT</text>

                {/* Lightning bolt */}
                <polygon points="155 28 148 42 155 42 152 56 162 38 155 38 158 28" fill="color-mix(in srgb, var(--color-secondary-500) 60%, transparent)">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
                </polygon>

                {/* Response node */}
                <circle cx="200" cy="40" r="18" fill="color-mix(in srgb, var(--color-secondary-500) 10%, transparent)" stroke="color-mix(in srgb, var(--color-secondary-500) 30%, transparent)" strokeWidth="1" />
                <text x="200" y="37" textAnchor="middle" fill="color-mix(in srgb, var(--color-secondary-500) 70%, transparent)" fontSize="6" fontFamily="var(--font-mono)">&lt;1ms</text>
                <text x="200" y="47" textAnchor="middle" fill="color-mix(in srgb, var(--color-secondary-500) 50%, transparent)" fontSize="6" fontFamily="var(--font-mono)">DATA</text>

                {/* Arrow cache to response */}
                <line x1="168" y1="40" x2="180" y2="40" stroke="color-mix(in srgb, var(--color-secondary-500) 30%, transparent)" strokeWidth="1" strokeDasharray="4 2">
                  <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>

            {/* Engineering Log */}
            <div className="case-study-card p-5">
              <h4 className="type-label text-tertiary-ink/40 mb-3">
                {t('projects:omnigrid.engineering.title')}
              </h4>

              <div className="mb-4">
                <h5 className="text-caption font-semibold text-secondary-400/80 mb-1.5">
                  {t('projects:omnigrid.engineering.headlessVsComponent')}
                </h5>
                <p className="text-caption text-tertiary-ink/45 leading-relaxed">
                  {t('projects:omnigrid.engineering.headlessDesc')}
                </p>
              </div>

              <div className="h-px bg-tertiary-ink/[0.06] my-3" />

              <div>
                <h5 className="text-caption font-semibold text-secondary-400/80 mb-1.5">
                  {t('projects:omnigrid.engineering.serverVsClient')}
                </h5>
                <p className="text-caption text-tertiary-ink/45 leading-relaxed">
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary-ink/40">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={t('projects:omnigrid.filterPlaceholder')}
                  className="w-full pl-9 pr-4 py-2.5 text-caption font-mono text-tertiary-ink/70 bg-tertiary-ink/[0.03] border border-tertiary-ink/[0.08] rounded-xl placeholder:text-tertiary-ink/35 focus:outline-none focus:border-secondary-500/30 transition-colors backdrop-blur-sm"
                />
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-3 text-caption font-mono text-tertiary-ink/45">
                <span>{rows.length.toLocaleString()} rows</span>
                <span className="text-tertiary-ink/10">|</span>
                <span>{sorting.length} sorted</span>
                <span className="text-tertiary-ink/10">|</span>
                <span>{renderTime < 1 ? '<1' : renderTime}ms render</span>
                <span className="text-tertiary-ink/10">|</span>
                <span className={`case-study-pill py-0.5 text-caption ${CACHE_COLORS[cacheStatus]}`}>
                  {cacheStatus}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="case-study-card max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-hidden">
              {/* Table header */}
              <div className="flex items-center border-b border-tertiary-ink/[0.06] sticky top-0 z-10 bg-tertiary-card min-w-[1060px]">
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <div
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize(), flexShrink: 0 }}
                    className="type-label px-3 py-3 text-left font-normal text-tertiary-ink/40 cursor-pointer hover:text-secondary-400/80 transition-colors select-none truncate"
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span className="text-secondary-400">↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span className="text-secondary-400">↓</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Table body */}
              <div>
                {rows.map((row) => (
                  <div
                    key={row.id}
                    onClick={(e) => handleRowClick(row.original, originOf(e))}
                    className="flex items-center border-b border-tertiary-ink/[0.03] hover:bg-secondary-500/[0.04] transition-colors cursor-pointer min-w-[1060px]"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isStatus = cell.column.id === 'status'
                      const isPriority = cell.column.id === 'priority'
                      let cellClass = 'text-tertiary-ink/50'
                      if (isStatus) cellClass = STATUS_COLORS[cell.getValue() as ShipmentStatus] ?? cellClass
                      if (isPriority) cellClass = PRIORITY_COLORS[cell.getValue() as ShipmentPriority] ?? cellClass

                      return (
                        <div
                          key={cell.id}
                          style={{ width: cell.column.getSize(), flexShrink: 0 }}
                          className={`px-3 py-2.5 text-caption font-mono truncate ${cellClass}`}
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

        {screenshots.length > 0 && (
          <div className="mt-10">
            <GalleryVariant images={screenshots} variant={settings.galleryStyle} alt={content.title} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedRow && (
          <ShipmentDetailModal
            shipment={selectedRow}
            origin={modalOrigin}
            onClose={() => setSelectedRow(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

export function OmniGridWidget({ anchorId }: { anchorId?: string | null }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OmniGridContent anchorId={anchorId} />
    </QueryClientProvider>
  )
}
