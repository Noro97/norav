import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import particleVert from './shaders/particle.vert?raw'
import particleFrag from './shaders/particle.frag?raw'

interface ParticleFieldProps {
  count: number
}

export function ParticleField({ count }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { offsets, scales, speeds } = useMemo(() => {
    const offsets = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      offsets[i * 3] = (Math.random() - 0.5) * 12
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 12
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 8
      scales[i] = Math.random() * 2.0 + 0.5
      speeds[i] = Math.random() * 0.8 + 0.4
    }

    return { offsets, scales, speeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uCollapsed: { value: 0 },
      uBurst: { value: 0 },
      uColorBase: { value: new THREE.Color(0.85, 0.85, 0.9) },
      uColorAccent: { value: new THREE.Color(0.71, 0.1, 0.17) },
    }),
    []
  )

  useFrame((state) => {
    if (!pointsRef.current) return

    const material = pointsRef.current.material as THREE.ShaderMaterial
    const u = material.uniforms
    const store = useAppStore.getState()

    u['uTime']!.value = state.clock.elapsedTime
    u['uScrollProgress']!.value = store.scrollProgress
    ;(u['uMouse']!.value as THREE.Vector2).set(store.mousePosition.x, store.mousePosition.y)

    const targetCollapsed = store.particlesCollapsed ? 1.0 : 0.0
    u['uCollapsed']!.value += (targetCollapsed - (u['uCollapsed']!.value as number)) * 0.05

    if (store.particleBurst) {
      u['uBurst']!.value = Math.min((u['uBurst']!.value as number) + 0.1, 1.0)
    } else {
      u['uBurst']!.value = (u['uBurst']!.value as number) * 0.95
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    // Three.js requires a 'position' attribute to determine draw count
    geo.setAttribute('position', new THREE.BufferAttribute(offsets, 3))
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return geo
  }, [offsets, scales, speeds])

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={particleVert}
        fragmentShader={particleFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
