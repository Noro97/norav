import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import { useAppStore } from '@/store/useAppStore'
import { CONNECTION_DISTANCE_THRESHOLD, CONNECTION_Z_DEPTH_RANGE } from '@/lib/constants'
import particleVert from './shaders/particle.vert?raw'
import particleFrag from './shaders/particle.frag?raw'
import connectionVert from './shaders/connection.vert?raw'
import connectionFrag from './shaders/connection.frag?raw'

interface ParticleFieldProps {
  count: number
  maxNeighbors: number
}

export function ParticleField({ count, maxNeighbors }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const connectionMeshRef = useRef<THREE.Mesh>(null)
  const noise3D = useMemo(() => createNoise3D(), [])

  // Stable per-node base positions and attributes — separate arrays (IMPORTANT: must not share)
  const { offsets, positions, scales, speeds } = useMemo(() => {
    const offsets = new Float32Array(count * 3)   // static base positions (noise input)
    const positions = new Float32Array(count * 3) // displaced positions (written each frame)
    const scales = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      offsets[i * 3]     = (Math.random() - 0.5) * 12
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 12
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 8
      // Initialize positions to same as offsets for first frame
      positions[i * 3]     = offsets[i * 3]
      positions[i * 3 + 1] = offsets[i * 3 + 1]
      positions[i * 3 + 2] = offsets[i * 3 + 2]
      scales[i] = Math.random() * 2.0 + 0.5
      speeds[i] = Math.random() * 0.8 + 0.4
    }

    return { offsets, positions, scales, speeds }
  }, [count])

  // Node geometry — position attribute is CPU-updated each frame
  const nodeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(positions, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posAttr)
geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return geo
  }, [positions, offsets, scales, speeds])

  // Connection geometry — pre-allocated instanced buffer
  const maxInstances = Math.floor(count * maxNeighbors / 2)

  const { connectionGeometry, instanceStartAttr, instanceEndAttr, instanceAlphaAttr } = useMemo(() => {
    // Unit quad: two triangles, 4 vertices, UV coords for billboard expansion
    const verts = new Float32Array([
      0, 0, 0,  // v0: start-bottom
      1, 0, 0,  // v1: end-bottom
      1, 1, 0,  // v2: end-top
      0, 1, 0,  // v3: start-top
    ])
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ])
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3])

    const geo = new THREE.InstancedBufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))
    geo.instanceCount = maxInstances

    const startArr = new Float32Array(maxInstances * 3)
    const endArr = new Float32Array(maxInstances * 3)
    const alphaArr = new Float32Array(maxInstances) // all zero initially

    const startAttr = new THREE.InstancedBufferAttribute(startArr, 3)
    const endAttr = new THREE.InstancedBufferAttribute(endArr, 3)
    const alphaAttr = new THREE.InstancedBufferAttribute(alphaArr, 1)

    startAttr.setUsage(THREE.DynamicDrawUsage)
    endAttr.setUsage(THREE.DynamicDrawUsage)
    alphaAttr.setUsage(THREE.DynamicDrawUsage)

    geo.setAttribute('instanceStart', startAttr)
    geo.setAttribute('instanceEnd', endAttr)
    geo.setAttribute('instanceAlpha', alphaAttr)

    return {
      connectionGeometry: geo,
      instanceStartAttr: startAttr,
      instanceEndAttr: endAttr,
      instanceAlphaAttr: alphaAttr,
    }
  }, [maxInstances])

  const nodeUniforms = useMemo(() => ({
    uTime:        { value: 0 },
    uMouse:       { value: new THREE.Vector2(0, 0) },
    uColorBase:   { value: new THREE.Color(0.85, 0.85, 0.9) },
    uColorAccent: { value: new THREE.Color(0.71, 0.1, 0.17) },
  }), [])

  const connectionUniforms = useMemo(() => ({
    uMouse:       { value: new THREE.Vector2(0, 0) },
    uCollapsed:   { value: 0 },
    uBurst:       { value: 0 },
    uColorBase:   { value: new THREE.Color(0.85, 0.85, 0.9) },
    uColorAccent: { value: new THREE.Color(0.71, 0.1, 0.17) },
    uLineWidth:   { value: 0.015 },
  }), [])

  // Neighbor count tracker reused each frame (avoids allocation)
  const neighborCounts = useMemo(() => new Int32Array(count), [count])

  useFrame((state) => {
    if (!pointsRef.current || !connectionMeshRef.current) return

    const store = useAppStore.getState()
    const elapsed = state.clock.elapsedTime
    const scrollZ = store.scrollProgress * 8.0

    // Smoothly interpolate collapse and burst (same logic as before)
    const targetCollapsed = store.particlesCollapsed ? 1.0 : 0.0
    const prevCollapsed = connectionUniforms['uCollapsed']!.value as number
    const collapsed = prevCollapsed + (targetCollapsed - prevCollapsed) * 0.05

    let burst = connectionUniforms['uBurst']!.value as number
    if (store.particleBurst) {
      burst = Math.min(burst + 0.1, 1.0)
    } else {
      burst = burst * 0.95
    }

    // World-space mouse (NDC * 5.0 to match camera FOV 60 at z=6)
    const mx = store.mousePosition.x * 5.0
    const my = store.mousePosition.y * 5.0

    // Update node uniforms
    const nodeMaterial = pointsRef.current.material as THREE.ShaderMaterial
    nodeMaterial.uniforms['uTime']!.value = elapsed
    ;(nodeMaterial.uniforms['uMouse']!.value as THREE.Vector2).set(mx, my)

    // Update connection uniforms
    const connMaterial = connectionMeshRef.current.material as THREE.ShaderMaterial
    connectionUniforms['uCollapsed']!.value = collapsed
    connMaterial.uniforms['uBurst']!.value = burst
    ;(connMaterial.uniforms['uMouse']!.value as THREE.Vector2).set(mx, my)

    // --- CPU displacement ---
    const posArr = nodeGeometry.attributes['position']!.array as Float32Array

    for (let i = 0; i < count; i++) {
      const bx = offsets[i * 3]
      const by = offsets[i * 3 + 1]
      const bz = offsets[i * 3 + 2]
      const speed = speeds[i]

      const t = elapsed * speed * 0.3

      // Port of vertex shader noise (same swizzles)
      const nx = noise3D(bx * 0.4 + t,  by * 0.4,       bz * 0.4 + scrollZ) * 1.5
      const ny = noise3D(bx * 0.4,       by * 0.4 + t,  bz * 0.4 + scrollZ) * 1.5
      const nz = noise3D(bx * 0.4 + scrollZ, by * 0.4 + t, bz * 0.4      ) * 1.5

      let px = bx + nx
      let py = by + ny
      let pz = bz + nz

      // Mouse repulsion (push away)
      const dx = px - mx
      const dy = py - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 5.0 && dist > 0.001) {
        const force = (5.0 - dist) / 5.0
        px += (dx / dist) * force * 0.8
        py += (dy / dist) * force * 0.8
      }

      // Collapse (exact port of original shader mix() calls)
      // mix(pz, 0.0, collapsed*0.8) → Z collapses faster
      pz = pz * (1 - collapsed * 0.8)
      // mix(px, px*0.3, collapsed*0.5) → XY scales toward center more slowly
      px = px * (1 - 0.7 * collapsed * 0.5)
      py = py * (1 - 0.7 * collapsed * 0.5)

      // Burst
      if (burst > 0.001) {
        const len = Math.sqrt(px * px + py * py + pz * pz)
        if (len > 0.001) {
          px += (px / len) * burst * 3.0
          py += (py / len) * burst * 3.0
          pz += (pz / len) * burst * 3.0
        }
      }

      posArr[i * 3]     = px
      posArr[i * 3 + 1] = py
      posArr[i * 3 + 2] = pz
    }

    const posAttr = nodeGeometry.attributes['position'] as THREE.BufferAttribute
    posAttr.needsUpdate = true

    // --- Neighbor / connection computation ---
    neighborCounts.fill(0)
    let pairCount = 0
    const maxPairs = maxInstances

    const startArr = instanceStartAttr.array as Float32Array
    const endArr = instanceEndAttr.array as Float32Array
    const alphaArr = instanceAlphaAttr.array as Float32Array

    // Zero out all instances first
    alphaArr.fill(0)

    for (let i = 0; i < count && pairCount < maxPairs; i++) {
      if (neighborCounts[i] >= maxNeighbors) continue
      const ax = posArr[i * 3], ay = posArr[i * 3 + 1], az = posArr[i * 3 + 2]

      for (let j = i + 1; j < count && pairCount < maxPairs; j++) {
        if (neighborCounts[j] >= maxNeighbors) continue

        const bx = posArr[j * 3], by = posArr[j * 3 + 1], bz = posArr[j * 3 + 2]

        // Z-depth filter
        if (Math.abs(az - bz) >= CONNECTION_Z_DEPTH_RANGE) continue

        const ddx = ax - bx, ddy = ay - by, ddz = az - bz
        const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz)
        if (d >= CONNECTION_DISTANCE_THRESHOLD) continue

        // Record connection
        const off3 = pairCount * 3
        startArr[off3] = ax; startArr[off3 + 1] = ay; startArr[off3 + 2] = az
        endArr[off3]   = bx; endArr[off3 + 1]   = by; endArr[off3 + 2]   = bz

        // Alpha fades with distance
        alphaArr[pairCount] = (1 - d / CONNECTION_DISTANCE_THRESHOLD) * 0.4

        neighborCounts[i]++
        neighborCounts[j]++
        pairCount++
      }
    }

    // Update active instance count so GPU doesn't draw unused instances
    connectionGeometry.instanceCount = pairCount

    instanceStartAttr.needsUpdate = true
    instanceEndAttr.needsUpdate = true
    instanceAlphaAttr.needsUpdate = true
  })

  return (
    <>
      <points ref={pointsRef} geometry={nodeGeometry}>
        <shaderMaterial
          vertexShader={particleVert}
          fragmentShader={particleFrag}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={connectionMeshRef} geometry={connectionGeometry}>
        <shaderMaterial
          vertexShader={connectionVert}
          fragmentShader={connectionFrag}
          uniforms={connectionUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}
