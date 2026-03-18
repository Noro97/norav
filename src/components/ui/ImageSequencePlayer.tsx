import { useRef, useState, useEffect, useCallback } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

interface Props {
  frameDir: string
  frameCount: number
  framePrefix?: string
  fallbackSrc?: string
  width: number
  height: number
  className?: string
}

function padIndex(index: number, total: number): string {
  const digits = String(total).length
  return String(index).padStart(digits, '0')
}

const RETRY_LIMIT = 2
const RETRY_DELAY_MS = 500
const LOAD_TIMEOUT_MS = 8000
const LOAD_THRESHOLD = 0.5

export function ImageSequencePlayer({
  frameDir,
  frameCount,
  framePrefix = 'frame-',
  fallbackSrc,
  width,
  height,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<(HTMLImageElement | null)[]>([])
  const currentFrameRef = useRef(0)

  const [loadedCount, setLoadedCount] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'fallback'>('loading')

  // Draw a specific frame index to canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const clampedIndex = Math.max(0, Math.min(frameCount - 1, index))
    const img = framesRef.current[clampedIndex]
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }, [frameCount])

  // Preload all frames with retry logic
  useEffect(() => {
    if (frameCount <= 0) return

    const frames = new Array<HTMLImageElement | null>(frameCount).fill(null)
    framesRef.current = frames
    let loadedSoFar = 0
    let settled = false

    function onLoaded() {
      loadedSoFar += 1
      setLoadedCount(loadedSoFar)
      if (!settled && loadedSoFar >= frameCount) {
        settled = true
        setPhase('ready')
      }
    }

    function loadWithRetry(index: number, attempt: number) {
      const paddedIdx = padIndex(index, frameCount)
      const url = `${frameDir}/${framePrefix}${paddedIdx}.webp`
      const img = new Image()
      img.decoding = 'async'

      img.onload = () => {
        framesRef.current[index] = img
        onLoaded()
      }

      img.onerror = () => {
        if (attempt < RETRY_LIMIT) {
          setTimeout(() => loadWithRetry(index, attempt + 1), RETRY_DELAY_MS)
        } else {
          // Skip after 2 failures — null stays in frames array
          framesRef.current[index] = null
          onLoaded()
        }
      }

      img.src = url
    }

    for (let i = 0; i < frameCount; i++) {
      loadWithRetry(i, 0)
    }

    // 8-second timeout: if <50% loaded, show fallback
    const timeoutId = window.setTimeout(() => {
      if (!settled && loadedSoFar / frameCount < LOAD_THRESHOLD) {
        settled = true
        setPhase('fallback')
      }
    }, LOAD_TIMEOUT_MS)

    return () => {
      settled = true
      clearTimeout(timeoutId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameDir, framePrefix, frameCount])

  // Draw first loaded frame when transitioning to ready
  useEffect(() => {
    if (phase === 'ready') {
      drawFrame(0)
    }
  }, [phase, drawFrame])

  // GSAP ScrollTrigger scrubbing
  useGSAP(() => {
    if (phase !== 'ready') return

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 60%',
      end: 'bottom 20%',
      scrub: 0.5,
      onUpdate(self) {
        const targetFrame = Math.round(self.progress * (frameCount - 1))
        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame
          drawFrame(targetFrame)
        }
      },
    })

    return () => {
      st.kill()
    }
  }, { scope: containerRef, dependencies: [phase, frameCount, drawFrame] })

  const progress = frameCount > 0 ? loadedCount / frameCount : 0

  return (
    <div ref={containerRef} className={className} style={{ width, height, position: 'relative' }}>
      {/* Loading skeleton */}
      {phase === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            gap: 12,
          }}
          aria-label="Loading image sequence"
          role="status"
        >
          {/* Skeleton shimmer */}
          <div
            style={{
              width: '80%',
              height: '60%',
              borderRadius: 6,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-shimmer 1.5s infinite',
            }}
          />
          {/* Progress bar */}
          <div
            style={{
              width: '60%',
              height: 3,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: '#B51A2B',
                borderRadius: 2,
                transition: 'width 0.1s ease',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}

      {/* Fallback static image */}
      {phase === 'fallback' && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt="Product view"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}

      {/* Fallback placeholder when no fallbackSrc */}
      {phase === 'fallback' && !fallbackSrc && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
          }}
          aria-label="Image unavailable"
          role="img"
        >
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            image unavailable
          </span>
        </div>
      )}

      {/* Canvas — always rendered so drawFrame works; hidden until ready */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        role="img"
        aria-label="Rotating product view"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          opacity: phase === 'ready' ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Shimmer keyframe injected once via style tag */}
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
