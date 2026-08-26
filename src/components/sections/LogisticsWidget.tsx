import { useRef, useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock } from '@/content/ContentProvider'
import type { CaseStudyContent } from '@norav/content-schema'

const MapView = lazy(() => import('./MapView'))

// Hub cities — Armenia + neighbouring region
const HUBS: [number, number, string][] = [
  [44.51, 40.18, 'Yerevan'], [44.50, 40.79, 'Vanadzor'], [43.87, 40.30, 'Gyumri'],
  [44.72, 41.72, 'Tbilisi'], [41.64, 41.63, 'Batumi'], [43.59, 41.99, 'Kutaisi'],
  [28.98, 41.01, 'Istanbul'], [32.86, 39.93, 'Ankara'], [35.32, 37.00, 'Adana'],
  [51.39, 35.69, 'Tehran'], [51.66, 32.65, 'Isfahan'], [46.30, 38.08, 'Tabriz'],
]

function generateMarkers(count: number): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  for (let i = 0; i < count; i++) {
    // Cluster around real hub cities with some scatter
    const hub = HUBS[i % HUBS.length]!
    const scatter = Math.min(count / 50, 15)
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          hub[0] + (Math.random() - 0.5) * scatter,
          hub[1] + (Math.random() - 0.5) * scatter,
        ],
      },
      properties: { id: i, intensity: Math.random(), hub: hub[2] },
    })
  }
  return { type: 'FeatureCollection', features }
}

function generateConnections(count: number): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  for (let i = 0; i < count; i++) {
    const from = HUBS[Math.floor(Math.random() * HUBS.length)]!
    const to = HUBS[Math.floor(Math.random() * HUBS.length)]!
    if (from === to) continue
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [from[0], from[1]],
          [to[0], to[1]],
        ],
      },
      properties: { id: i, from: from[2], to: to[2] },
    })
  }
  return { type: 'FeatureCollection', features }
}

export function LogisticsWidget({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CaseStudyContent>('logistics')
  const { t } = useTranslation('projects')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'logistics', sectionRef)
  const [markerCount, setMarkerCount] = useState(0)
  const [isStressTesting, setIsStressTesting] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [markers, setMarkers] = useState<GeoJSON.FeatureCollection | null>(null)
  const [connections, setConnections] = useState<GeoJSON.FeatureCollection | null>(null)
  const [wsMessages, setWsMessages] = useState(0)
  const [latency, setLatency] = useState(12)
  const [throughput, setThroughput] = useState(0)
  const stressRafRef = useRef(0)

  // GSAP entrance
  useGSAP(() => {
    const content = sectionRef.current!.querySelector('.logistics-content')
    const map = sectionRef.current!.querySelector('.logistics-map')
    if (content) {
      gsap.fromTo(content,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
    if (map) {
      gsap.fromTo(map,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
  }, { scope: sectionRef })

  // Simulated live telemetry
  useEffect(() => {
    if (!mapLoaded) return
    const interval = setInterval(() => {
      setWsMessages((p) => p + Math.floor(Math.random() * 3 + 1))
      setLatency(Math.round(8 + Math.random() * 12))
      setThroughput((p) => p + Math.floor(Math.random() * 30 + 10))
    }, 1000)
    return () => clearInterval(interval)
  }, [mapLoaded])

  // Cancel stress test rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(stressRafRef.current)
  }, [])

  const handleMapLoaded = useCallback(() => setMapLoaded(true), [])

  const handleStressTest = useCallback(() => {
    cancelAnimationFrame(stressRafRef.current)
    setIsStressTesting(true)
    setMarkerCount(0)

    const total = 40
    let added = 0
    const batchSize = 10

    const addBatch = () => {
      added += batchSize
      const current = Math.min(added, total)
      setMarkerCount(current)
      setMarkers(generateMarkers(current))
      setConnections(generateConnections(Math.floor(current / 8)))
      if (current < total) {
        stressRafRef.current = requestAnimationFrame(addBatch)
      } else {
        setIsStressTesting(false)
      }
    }
    stressRafRef.current = requestAnimationFrame(addBatch)
  }, [])

  if (!block) return null
  const { content } = block

  return (
    <section
      id={anchorId ?? 'logistics'}
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — Content */}
        <div className="logistics-content space-y-6">
          <span className="label-mono">{content.sectionLabel}</span>
          <h2 className="text-display-lg font-bold text-white leading-tight">
            {content.title}
          </h2>
          <p className="text-white/70 text-body-lg leading-relaxed max-w-lg">
            {content.description}
          </p>

          {/* Tech stack tags */}
          <div className="flex flex-wrap gap-2">
            {content.techStack.map((tag) => (
              <span key={tag.name} className="case-study-pill text-xs font-mono text-white/50">
                {tag.name}
              </span>
            ))}
          </div>

          {/* Live metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            <div className="case-study-card p-4 text-center">
              <div className="text-2xl font-bold text-gold-400 font-mono">{markerCount}</div>
              <div className="text-xs text-white/60 font-mono mt-1">{t('logistics.metrics.nodes')}</div>
            </div>
            <div className="case-study-card p-4 text-center">
              <div className="text-2xl font-bold text-crimson-400 font-mono">{latency}ms</div>
              <div className="text-xs text-white/60 font-mono mt-1">{t('logistics.metrics.latency')}</div>
            </div>
            <div className="case-study-card p-4 text-center">
              <div className="text-2xl font-bold text-crimson-400 font-mono">
                {wsMessages > 1000 ? `${(wsMessages / 1000).toFixed(1)}k` : wsMessages}
              </div>
              <div className="text-xs text-white/60 font-mono mt-1">{t('logistics.metrics.wsEvents')}</div>
            </div>
            <div className="case-study-card p-4 text-center">
              <div className="text-2xl font-bold text-crimson-400 font-mono">
                {throughput > 1000 ? `${(throughput / 1000).toFixed(1)}k` : throughput}
              </div>
              <div className="text-xs text-white/60 font-mono mt-1">{t('logistics.metrics.throughput')}</div>
            </div>
          </div>

          {/* Stress Test Button */}
          <button
            onClick={handleStressTest}
            disabled={isStressTesting}
            className="group relative inline-flex items-center gap-3 px-7 py-3.5 bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 font-mono text-base tracking-wider uppercase rounded transition-all hover:bg-crimson-500/20 hover:border-crimson-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isStressTesting ? 'bg-yellow-400 animate-pulse' : 'bg-crimson-500'}`} />
            {isStressTesting ? t('logistics.stressTest.rendering', { count: markerCount }) : t('logistics.stressTest.run')}
          </button>

          {/* Live log */}
          {mapLoaded && (
            <div className="font-mono text-xs text-white/40 space-y-1 max-h-20 overflow-hidden">
              <div>{t('logistics.log.eventBatch', { count: wsMessages % 30 + 5 })}</div>
              <div>{t('logistics.log.sourceUpdate', { markers: markerCount, connections: connections?.features.length ?? 0 })}</div>
              <div>{t('logistics.log.frameBudget', { time: (16.6 - (latency % 4)).toFixed(1) })}</div>
            </div>
          )}
        </div>

        {/* Right — Map */}
        <div className="logistics-map case-study-card relative aspect-[4/3] overflow-hidden bg-card" data-cursor="target">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-crimson-500/30 border-t-crimson-500 rounded-full animate-spin" />
              </div>
            }
          >
            <MapView
              markers={markers}
              connections={connections}
              onLoad={handleMapLoaded}
            />
          </Suspense>
          {/* Overlay label */}
          <div className="case-study-pill absolute top-3 left-3 font-mono text-xs text-white/40 bg-black/50">
            {t('logistics.liveLabel', { count: HUBS.length })}
          </div>
        </div>
      </div>
    </section>
  )
}
