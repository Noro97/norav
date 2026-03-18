import { useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export interface TechNode {
  name: string
  icon: React.ReactNode
  experience: string
}

interface Props {
  technologies: TechNode[]
  radius?: number
}

export function TechOrbit({ technologies, radius = 200 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sphereRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const N = technologies.length

  // Fibonacci sphere distribution
  const nodes = technologies.map((tech, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / N)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const thetaDeg = (theta * 180) / Math.PI
    const phiDeg = (phi * 180) / Math.PI
    return { tech, thetaDeg, phiDeg }
  })

  useGSAP(() => {
    if (prefersReducedMotion || !sphereRef.current) return

    const tl = gsap.timeline({ repeat: -1, ease: 'none' })
    tl.to(sphereRef.current, {
      rotateY: '+=360',
      duration: 30,
      ease: 'none',
    })
    tlRef.current = tl

    return () => {
      tl.kill()
      tlRef.current = null
    }
  }, { scope: containerRef, dependencies: [prefersReducedMotion] })

  const handleContainerMouseEnter = useCallback(() => {
    tlRef.current?.pause()
  }, [])

  const handleContainerMouseLeave = useCallback(() => {
    tlRef.current?.resume()
    setHoveredIdx(null)
  }, [])

  const handleNodeMouseEnter = useCallback((idx: number) => {
    setHoveredIdx(idx)
    const el = nodeRefs.current[idx]
    if (el) {
      gsap.to(el, {
        z: radius + 60,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [radius])

  const handleNodeMouseLeave = useCallback((idx: number) => {
    setHoveredIdx(null)
    const el = nodeRefs.current[idx]
    if (el) {
      gsap.to(el, {
        z: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, idx: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const el = nodeRefs.current[idx]
        if (hoveredIdx === idx) {
          setHoveredIdx(null)
          if (el) gsap.to(el, { z: 0, duration: 0.3, ease: 'power2.out' })
        } else {
          setHoveredIdx(idx)
          if (el) gsap.to(el, { z: radius + 60, duration: 0.3, ease: 'power2.out' })
        }
      }
    },
    [hoveredIdx, radius]
  )

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: radius * 2 + 120, height: radius * 2 + 120, perspective: '1000px' }}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <div
        ref={sphereRef}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {nodes.map(({ tech, thetaDeg, phiDeg }, idx) => {
          const isHovered = hoveredIdx === idx

          return (
            <div
              key={tech.name}
              ref={(el) => { nodeRefs.current[idx] = el }}
              tabIndex={0}
              role="button"
              aria-label={`${tech.name} – ${tech.experience}`}
              onMouseEnter={() => handleNodeMouseEnter(idx)}
              onMouseLeave={() => handleNodeMouseLeave(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotateY(${thetaDeg}deg) rotateX(${phiDeg}deg) translateZ(${radius}px)`,
                cursor: 'pointer',
                outline: 'none',
              }}
              className="group"
            >
              {/* Icon node */}
              <div
                className={[
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  'bg-white/5 border border-white/10',
                  'transition-all duration-300',
                  isHovered
                    ? 'bg-crimson-500/20 border-crimson-500/40 shadow-[0_0_20px_rgba(181,26,43,0.4)]'
                    : 'group-hover:bg-crimson-500/20 group-hover:border-crimson-500/40',
                  'focus-visible:ring-2 focus-visible:ring-crimson-500/60',
                ].join(' ')}
              >
                <span className="text-white/70 group-hover:text-white transition-colors w-5 h-5 flex items-center justify-center">
                  {tech.icon}
                </span>
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none z-50"
                  style={{ transformStyle: 'flat' }}
                >
                  <div className="bg-neutral-900/95 border border-white/10 rounded px-2.5 py-1.5 whitespace-nowrap backdrop-blur-sm">
                    <p className="font-mono text-xs text-white font-medium">{tech.name}</p>
                    <p className="font-mono text-[10px] text-white/40 mt-0.5">{tech.experience}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
