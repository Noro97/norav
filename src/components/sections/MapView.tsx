import { useRef, useEffect, useId, type CSSProperties } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useThemeColor } from '@/content/theme'

interface MapViewProps {
  markers: GeoJSON.FeatureCollection | null
  connections: GeoJSON.FeatureCollection | null
  onLoad: () => void
}

const YEREVAN: L.LatLngTuple = [40.1812, 44.5136]

// Esri's Dark Gray canvas: keyless, and dark by design so it takes a tint
// cleanly. CARTO's dark tiles now stamp "API key required" across the map.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'
const ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** Points sampled along each route's curve — enough to read as a smooth arc. */
const CURVE_STEPS = 16

/** A token's hex as 0–1 channels; anything else falls back to the shipped hex. */
function channels(color: string, fallback: string): [number, number, number] {
  const hex = /^#[0-9a-f]{6}$/i.test(color.trim()) ? color.trim() : fallback
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
}

/** `t` of the way from `a` to `b`, per channel. */
function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [0, 1, 2].map((i) => a[i]! + (b[i]! - a[i]!) * t) as [number, number, number]
}

/** One `tableValues` string per channel, darkest stop first. */
function tables(stops: [number, number, number][]): [string, string, string] {
  return [0, 1, 2].map((c) => stops.map((s) => s[c]!.toFixed(3)).join(' ')) as [string, string, string]
}

/** A quadratic arc between two [lng, lat] points, lifted north like a flight path. */
function arc(from: [number, number], to: [number, number]): L.LatLngTuple[] {
  const [x1, y1] = from
  const [x2, y2] = to
  const cx = (x1 + x2) / 2
  const cy = Math.max(y1, y2) + Math.hypot(x2 - x1, y2 - y1) * 0.2
  const points: L.LatLngTuple[] = []
  for (let i = 0; i <= CURVE_STEPS; i++) {
    const t = i / CURVE_STEPS
    const u = 1 - t
    points.push([u * u * y1 + 2 * u * t * cy + t * t * y2, u * u * x1 + 2 * u * t * cx + t * t * x2])
  }
  return points
}

export default function MapView({ markers, connections, onLoad }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const onLoadRef = useRef(onLoad)
  const mapRef = useRef<L.Map | null>(null)
  const nodesRef = useRef<L.LayerGroup | null>(null)
  const routesRef = useRef<L.LayerGroup | null>(null)
  const zoomedOutRef = useRef(false)

  /**
   * Esri's tiles are grey on grey; a tone-map filter repaints them in the
   * site's own four roles, so the map follows whatever palette the CMS
   * publishes. SVG filters take resolved colours, not CSS variables — the same
   * constraint the 3D mark works under — hence the hooks.
   */
  const ground = useThemeColor('--color-background', '#010123')
  const card = useThemeColor('--color-card', '#0d0d1f')
  const line = useThemeColor('--color-muted', '#1a1a2e')
  const text = useThemeColor('--color-muted-foreground', '#888888')
  const id = useId().replace(/:/g, '')
  const baseFilter = `map-base-${id}`
  const labelFilter = `map-labels-${id}`

  // Seventeen stops, one per sixteenth of luminance. The canvas uses a narrow
  // band — water near 0.23, land near 0.3, roads near 0.38, borders above
  // 0.5 — so each band gets its own role and everything else is padding.
  // Roads lean toward the text colour: in the muted role alone they vanish.
  const g = channels(ground, '#010123')
  const c = channels(card, '#0d0d1f')
  const l = channels(line, '#1a1a2e')
  const tx = channels(text, '#888888')
  const road = mix(l, tx, 0.3)
  const base = tables([g, g, g, g, g, c, road, road, tx, tx, tx, tx, tx, tx, tx, tx, tx])
  // Labels are light text on a dark halo: the halo sinks into the ground.
  const labels = tables([g, g, tx, tx])

  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  // Initialize map once
  useEffect(() => {
    const div = mapDivRef.current
    if (!div) return

    const map = L.map(div, {
      center: YEREVAN,
      zoom: 12,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: false,
      // Google's `cooperative`: the page scrolls past the map, not into it.
      scrollWheelZoom: false,
    })

    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>')

    map.createPane('labels')
    const labelPane = map.getPane('labels')!
    labelPane.style.zIndex = '450'
    labelPane.style.pointerEvents = 'none'

    L.tileLayer(`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
      attribution: ATTRIBUTION,
      maxNativeZoom: 16,
      className: 'map-base',
    }).addTo(map)
    L.tileLayer(`${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, {
      pane: 'labels',
      maxNativeZoom: 16,
      className: 'map-labels',
    }).addTo(map)

    routesRef.current = L.layerGroup().addTo(map)
    nodesRef.current = L.layerGroup().addTo(map)
    L.circleMarker(YEREVAN, { radius: 6, className: 'map-home', interactive: false }).addTo(map)

    mapRef.current = map
    onLoadRef.current()

    return () => {
      map.remove()
      mapRef.current = null
      nodesRef.current = null
      routesRef.current = null
      zoomedOutRef.current = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const nodes = nodesRef.current
    if (!map || !nodes) return

    nodes.clearLayers()
    if (!markers || markers.features.length === 0) return

    for (const f of markers.features) {
      if (f.geometry.type !== 'Point') continue
      const [lng, lat] = f.geometry.coordinates as [number, number]
      const intensity = (f.properties?.intensity as number) ?? 0.5
      L.circleMarker([lat, lng], {
        radius: 3 + intensity * 4,
        className: 'map-node',
        interactive: false,
      }).addTo(nodes)
    }

    // Out to the hubs once, when the first nodes land; later batches stay put.
    if (!zoomedOutRef.current) {
      zoomedOutRef.current = true
      const bounds = L.latLngBounds(
        markers.features
          .filter((f) => f.geometry.type === 'Point')
          .map((f) => {
            const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates as [number, number]
            return [lat, lng] as L.LatLngTuple
          }),
      ).extend(YEREVAN)
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (still) map.fitBounds(bounds, { padding: [24, 24] })
      else map.flyToBounds(bounds, { padding: [24, 24], duration: 1.2 })
    }
  }, [markers])

  useEffect(() => {
    const routes = routesRef.current
    if (!routes) return

    routes.clearLayers()
    for (const f of connections?.features ?? []) {
      if (f.geometry.type !== 'LineString') continue
      const coords = f.geometry.coordinates as [number, number][]
      if (coords.length < 2) continue
      L.polyline(arc(coords[0]!, coords[1]!), { className: 'map-route', interactive: false }).addTo(routes)
    }
  }, [connections])

  return (
    <>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id={baseFilter} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={base[0]} />
            <feFuncG type="table" tableValues={base[1]} />
            <feFuncB type="table" tableValues={base[2]} />
          </feComponentTransfer>
        </filter>
        <filter id={labelFilter} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={labels[0]} />
            <feFuncG type="table" tableValues={labels[1]} />
            <feFuncB type="table" tableValues={labels[2]} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div
        ref={mapDivRef}
        // Isolated so Leaflet's pane z-indexes stay inside the map and the
        // card's overlay label sits on top.
        className="absolute inset-0 isolate"
        // Filtered per tile, not per pane: a filter over the whole pane draws
        // a hairline seam along every tile edge.
        style={
          {
            backgroundColor: 'var(--color-background)',
            '--map-base-filter': `url(#${baseFilter})`,
            '--map-labels-filter': `url(#${labelFilter})`,
          } as CSSProperties
        }
      />
    </>
  )
}
