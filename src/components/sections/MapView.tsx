import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { readToken, useThemeColor, withAlpha } from '@/content/theme'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface MapViewProps {
  markers: GeoJSON.FeatureCollection | null
  connections: GeoJSON.FeatureCollection | null
  onLoad: () => void
  /** Drawn instead of the map if the Maps API key is rejected. */
  fallbackImage?: string
}

// Configure API loader once — safe with React 19 StrictMode (idempotent)
setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  v: 'weekly',
})

/**
 * Google's stock "Night" palette was fourteen navy hexes, so the map stayed
 * dark blue while the rest of the page followed whatever accent and background
 * the CMS published — the one panel on the site that did not.
 *
 * Four roles now, all read from the theme. Every feature the stock style named
 * is still named here: dropping one lets Google's default daylight colour show
 * through for that feature alone, which is worse than a colour that is merely
 * wrong.
 *
 * Maps takes resolved colours, not CSS variables — the same constraint the 3D
 * mark works under.
 */
function darkStyle(
  ground: string,
  water: string,
  line: string,
  text: string,
): google.maps.MapTypeStyle[] {
  return [
    { elementType: 'geometry', stylers: [{ color: ground }] },
    { elementType: 'labels.text.fill', stylers: [{ color: text }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: ground }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: line }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: text }] },
    { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: line }] },
    { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: line }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: ground }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: ground }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: text }] },
    { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: ground }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: ground }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: text }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: line }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: text }] },
    { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: ground }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: line }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: ground }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: text }] },
    { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: ground }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: text }] },
    { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: ground }] },
    { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: line }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: line }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: water }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: text }] },
  ]
}

// SVG marker icon factory — pulsing dot via Symbol
function createMarkerIcon(intensity: number): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 4 + intensity * 6,
    fillColor: 'var(--color-primary-500)',
    fillOpacity: 0.7 + intensity * 0.3,
    strokeColor: 'var(--color-primary-400)',
    strokeWeight: 1,
    strokeOpacity: 0.4,
  }
}

// Factory for BezierOverlay — must be called AFTER google.maps is loaded
function createBezierOverlay(): google.maps.OverlayView & {
  setConnections(data: GeoJSON.FeatureCollection | null): void
} {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.pointerEvents = 'none'

  let connections: GeoJSON.FeatureCollection | null = null

  const overlay = new google.maps.OverlayView()

  overlay.onAdd = function () {
    this.getPanes()?.overlayLayer.appendChild(canvas)
  }

  overlay.draw = function () {
    const projection = this.getProjection()
    if (!projection || !connections) return

    const mapDiv = (this.getMap() as google.maps.Map)?.getDiv()
    if (!mapDiv) return

    const w = mapDiv.offsetWidth
    const h = mapDiv.offsetHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    canvas.style.left = '0'
    canvas.style.top = '0'

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // Read through the token cache: cheap per draw, and current after a
    // theme change, which a value captured at construction would not be.
    ctx.strokeStyle = withAlpha(readToken('--color-primary-500', '#B51A2B'), 0.12)
    ctx.lineWidth = 0.8

    connections.features.forEach((f) => {
      if (f.geometry.type !== 'LineString') return
      const coords = f.geometry.coordinates as [number, number][]
      if (coords.length < 2) return

      const p1 = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(coords[0]![1], coords[0]![0])
      )
      const p2 = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(coords[1]![1], coords[1]![0])
      )
      if (!p1 || !p2) return

      const mx = (p1.x + p2.x) / 2
      const my = Math.min(p1.y, p2.y) - 30

      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.quadraticCurveTo(mx, my, p2.x, p2.y)
      ctx.stroke()
    })
  }

  overlay.onRemove = function () {
    canvas.remove()
  }

  return Object.assign(overlay, {
    setConnections(data: GeoJSON.FeatureCollection | null) {
      connections = data
      overlay.draw()
    },
  })
}

// Throttle interval for stress test updates (~30fps)
const FRAME_INTERVAL = 1000 / 30

type BezierOverlayInstance = ReturnType<typeof createBezierOverlay>

export default function MapView({ markers, connections, onLoad, fallbackImage }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const onLoadRef = useRef(onLoad)
  const mapRef = useRef<google.maps.Map | null>(null)
  const overlayRef = useRef<BezierOverlayInstance | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const dataLayerRef = useRef<google.maps.Data | null>(null)
  const lastUpdateRef = useRef(0)
  const pendingRafRef = useRef(0)
  const [authFailed, setAuthFailed] = useState(false)

  // Four roles, re-read when the CMS publishes a palette.
  const ground = useThemeColor('--color-card', '#0f0f14')
  const water = useThemeColor('--color-background', '#08080b')
  const line = useThemeColor('--color-muted', '#1a1a22')
  const text = useThemeColor('--color-muted-foreground', '#8a8a99')
  const styles = useMemo(() => darkStyle(ground, water, line, text), [ground, water, line, text])

  // The init effect must not re-run on a palette change — it would rebuild the
  // map and drop every marker. It reads the current styles through a ref, and a
  // second effect restyles the map that already exists.
  const stylesRef = useRef(styles)

  useEffect(() => {
    // Writing the ref here rather than during render: init awaits the Maps
    // library, so by the time it builds the map this has already run.
    stylesRef.current = styles
    mapRef.current?.setOptions({ styles, backgroundColor: water })
  }, [styles, water])

  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  // Initialize map once
  useEffect(() => {
    let cancelled = false

    // Google Maps calls this global when API key auth fails
    ;(window as unknown as Record<string, unknown>).gm_authFailure = () => {
      if (!cancelled) {
        setAuthFailed(true)
        onLoadRef.current()
      }
    }

    async function init() {
      try {
        await importLibrary('maps')
      } catch {
        if (!cancelled) {
          setAuthFailed(true)
          onLoadRef.current()
        }
        return
      }
      if (cancelled || !mapDivRef.current) return

      const map = new google.maps.Map(mapDivRef.current, {
        center: { lat: 40.18, lng: 44.51 },
        zoom: 6,
        minZoom: 4,
        maxZoom: 10,
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
        // Read here rather than closed over: this effect must not list a
        // colour as a dependency, or a publish would rebuild the map.
        backgroundColor: readToken('--color-background', '#08080b'),
        styles: stylesRef.current,
      })

      mapRef.current = map

      // Data layer for bulk stress test markers
      const dataLayer = new google.maps.Data({ map })
      dataLayer.setStyle((feature) => {
        const intensity = feature.getProperty('intensity') as number
        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 2 + intensity * 3,
            fillColor: 'var(--color-primary-500)',
            fillOpacity: 0.6,
            strokeWeight: 0,
          },
        }
      })
      dataLayerRef.current = dataLayer

      // Bezier overlay for curved routes
      const overlay = createBezierOverlay()
      overlay.setMap(map)
      overlayRef.current = overlay

      onLoadRef.current()
    }

    init()

    return () => {
      cancelled = true
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
      overlayRef.current?.setMap(null)
      overlayRef.current = null
      dataLayerRef.current?.setMap(null)
      dataLayerRef.current = null
      cancelAnimationFrame(pendingRafRef.current)
      mapRef.current = null
    }
  }, [])

  const applyMarkers = useCallback((data: GeoJSON.FeatureCollection | null) => {
    const map = mapRef.current
    const dataLayer = dataLayerRef.current
    if (!map || !dataLayer) return

    // Clear existing data layer features
    dataLayer.forEach((f) => dataLayer.remove(f))

    if (!data || data.features.length === 0) {
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
      return
    }

    const isStressTest = data.features.length > 50

    if (isStressTest) {
      // Use Data layer for bulk rendering (performance)
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
      dataLayer.addGeoJson(data)
    } else {
      // Use regular Markers with SVG symbols for small sets
      const existing = markersRef.current
      const features = data.features

      for (let i = 0; i < features.length; i++) {
        const f = features[i]!
        if (f.geometry.type !== 'Point') continue
        const [lon, lat] = f.geometry.coordinates as [number, number]
        const intensity = (f.properties?.intensity as number) ?? 0.5

        if (i < existing.length) {
          existing[i]!.setPosition({ lat, lng: lon })
          existing[i]!.setIcon(createMarkerIcon(intensity))
          existing[i]!.setMap(map)
        } else {
          const marker = new google.maps.Marker({
            map,
            position: { lat, lng: lon },
            icon: createMarkerIcon(intensity),
            clickable: false,
            optimized: true,
          })
          existing.push(marker)
        }
      }

      // Hide excess markers
      for (let i = features.length; i < existing.length; i++) {
        existing[i]!.setMap(null)
      }
      markersRef.current = existing.slice(0, features.length)
    }
  }, [])

  const applyConnections = useCallback((data: GeoJSON.FeatureCollection | null) => {
    overlayRef.current?.setConnections(data)
  }, [])

  // Throttled marker/data update — retries on the next frame until the
  // FRAME_INTERVAL throttle window has elapsed.
  const scheduleUpdate = useCallback((
    newMarkers: GeoJSON.FeatureCollection | null,
    newConnections: GeoJSON.FeatureCollection | null,
  ) => {
    cancelAnimationFrame(pendingRafRef.current)
    const attempt = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current < FRAME_INTERVAL) {
        pendingRafRef.current = requestAnimationFrame(attempt)
        return
      }
      lastUpdateRef.current = timestamp
      applyMarkers(newMarkers)
      applyConnections(newConnections)
    }
    pendingRafRef.current = requestAnimationFrame(attempt)
  }, [applyMarkers, applyConnections])

  // React to markers/connections changes
  useEffect(() => {
    scheduleUpdate(markers, connections)
  }, [markers, connections, scheduleUpdate])

  if (authFailed) {
    return (
      <div className="absolute inset-0 bg-tertiary-bg">
        {fallbackImage && (
          <img
            src={fallbackImage}
            alt="Map"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary-bg via-transparent to-tertiary-bg/80" />
      </div>
    )
  }

  return (
    <div
      ref={mapDivRef}
      className="absolute inset-0"
      style={{ backgroundColor: 'var(--color-background)' }}
    />
  )
}
