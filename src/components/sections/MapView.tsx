import { useRef, useEffect, useCallback, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface MapViewProps {
  markers: GeoJSON.FeatureCollection | null
  connections: GeoJSON.FeatureCollection | null
  onLoad: () => void
}

// Configure API loader once — safe with React 19 StrictMode (idempotent)
setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  v: 'weekly',
})

// Dark "Night" style — applied via JSON so no mapId needed
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
]

// SVG marker icon factory — pulsing dot via Symbol
function createMarkerIcon(intensity: number): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 4 + intensity * 6,
    fillColor: 'var(--color-crimson-500)',
    fillOpacity: 0.7 + intensity * 0.3,
    strokeColor: '#ff3050',
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

    ctx.strokeStyle = 'rgba(181, 26, 43, 0.12)'
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

export default function MapView({ markers, connections, onLoad }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const onLoadRef = useRef(onLoad)
  const mapRef = useRef<google.maps.Map | null>(null)
  const overlayRef = useRef<BezierOverlayInstance | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const dataLayerRef = useRef<google.maps.Data | null>(null)
  const lastUpdateRef = useRef(0)
  const pendingRafRef = useRef(0)
  const [authFailed, setAuthFailed] = useState(false)

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
        backgroundColor: '#1d2c4d',
        styles: DARK_STYLE,
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
            fillColor: 'var(--color-crimson-500)',
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
      <div className="absolute inset-0 bg-[#1d2c4d]" data-cursor="target">
        <img
          src="/assets/img/world-map.webp"
          alt="Map"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d2c4d] via-transparent to-[#1d2c4d]/80" />
      </div>
    )
  }

  return (
    <div
      ref={mapDivRef}
      className="absolute inset-0"
      style={{ backgroundColor: '#1d2c4d' }}
      data-cursor="target"
    />
  )
}
