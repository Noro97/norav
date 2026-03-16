import { useRef, useEffect, useCallback } from 'react'

interface MapViewProps {
  markers: GeoJSON.FeatureCollection | null
  connections: GeoJSON.FeatureCollection | null
  onLoad: () => void
}

// World map outline (simplified)
const COASTLINE_PATHS = [
  // North America
  'M120,45 L125,40 L135,38 L145,35 L150,40 L148,50 L140,55 L135,60 L125,65 L115,60 L110,55 L105,50 L108,45 Z',
  // South America
  'M135,65 L140,70 L142,80 L138,90 L130,95 L125,90 L122,80 L125,70 Z',
  // Europe
  'M195,38 L200,35 L210,35 L215,38 L212,42 L205,45 L198,42 Z',
  // Africa
  'M195,50 L205,48 L215,52 L218,60 L215,70 L210,78 L200,80 L192,75 L188,65 L190,55 Z',
  // Asia
  'M220,30 L240,25 L260,28 L275,32 L280,40 L275,48 L265,50 L250,48 L240,45 L230,40 L222,35 Z',
  // Australia
  'M265,72 L275,70 L282,74 L280,80 L272,82 L265,78 Z',
]

function lonLatToXY(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lon + 180) / 360) * w
  const y = ((90 - lat) / 180) * h
  return [x, y]
}

export default function MapView({ markers, connections, onLoad }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const markersRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const connectionsRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const frameRef = useRef(0)
  const timeRef = useRef(0)
  const visibleRef = useRef(true)

  markersRef.current = markers
  connectionsRef.current = connections

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    timeRef.current += 0.016

    // Clear
    ctx.fillStyle = '#0d0d1f'
    ctx.fillRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = 'rgba(181, 26, 43, 0.04)'
    ctx.lineWidth = 0.5
    for (let lon = -180; lon <= 180; lon += 30) {
      const [x] = lonLatToXY(lon, 0, w, h)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let lat = -60; lat <= 90; lat += 30) {
      const [, y] = lonLatToXY(0, lat, w, h)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Coastlines
    ctx.strokeStyle = 'rgba(181, 26, 43, 0.12)'
    ctx.lineWidth = 1
    const scaleX = w / 400
    const scaleY = h / 200
    COASTLINE_PATHS.forEach((path) => {
      ctx.beginPath()
      const parts = path.match(/[ML]\s*[\d.]+,[\d.]+/g)
      if (!parts) return
      parts.forEach((part, i) => {
        const coords = part.replace(/[ML]/, '').trim().split(',')
        const x = parseFloat(coords[0]!) * scaleX
        const y = parseFloat(coords[1]!) * scaleY
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fillStyle = 'rgba(181, 26, 43, 0.03)'
      ctx.fill()
      ctx.stroke()
    })

    // Connections
    const conns = connectionsRef.current
    if (conns) {
      ctx.strokeStyle = 'rgba(181, 26, 43, 0.1)'
      ctx.lineWidth = 0.5
      conns.features.forEach((f) => {
        if (f.geometry.type !== 'LineString') return
        const coords = f.geometry.coordinates as [number, number][]
        if (coords.length < 2) return
        const [x1, y1] = lonLatToXY(coords[0]![0], coords[0]![1], w, h)
        const [x2, y2] = lonLatToXY(coords[1]![0], coords[1]![1], w, h)
        ctx.beginPath()
        // Curved line
        const mx = (x1 + x2) / 2
        const my = Math.min(y1, y2) - 20
        ctx.moveTo(x1, y1)
        ctx.quadraticCurveTo(mx, my, x2, y2)
        ctx.stroke()
      })
    }

    // Markers
    const mkrs = markersRef.current
    if (mkrs) {
      mkrs.features.forEach((f) => {
        if (f.geometry.type !== 'Point') return
        const [lon, lat] = f.geometry.coordinates as [number, number]
        const [x, y] = lonLatToXY(lon, lat, w, h)
        const intensity = (f.properties?.intensity as number) ?? 0.5
        const pulse = Math.sin(timeRef.current * 3 + intensity * 10) * 0.3 + 0.7

        // Glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 6 + intensity * 8)
        grd.addColorStop(0, `rgba(181, 26, 43, ${0.4 * pulse})`)
        grd.addColorStop(1, 'rgba(181, 26, 43, 0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(x, y, 6 + intensity * 8, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `rgba(181, 26, 43, ${0.8 * pulse})`
        ctx.beginPath()
        ctx.arc(x, y, 1.5 + intensity * 2, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    if (visibleRef.current) {
      frameRef.current = requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width * (window.devicePixelRatio > 1 ? 2 : 1)
        canvas.height = rect.height * (window.devicePixelRatio > 1 ? 2 : 1)
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
      }
    }

    resize()
    window.addEventListener('resize', resize)

    // Only animate when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = !!entry?.isIntersecting
        if (visibleRef.current) {
          frameRef.current = requestAnimationFrame(draw)
        } else {
          cancelAnimationFrame(frameRef.current)
        }
      },
      { threshold: 0 }
    )
    const parent = canvas.parentElement
    if (parent) observer.observe(parent)

    frameRef.current = requestAnimationFrame(draw)
    onLoad()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [draw, onLoad])

  return <canvas ref={canvasRef} className="absolute inset-0" />
}
