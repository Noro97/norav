import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { useAppStore } from '@/store/useAppStore'

const SHARD_COUNT = 40
const SHARD_SIZE = 0.05
const EXPLODE_DURATION = 1.5
const TOTAL_DURATION = 3.0
const GRAVITY = 4.0

// Scale factor: SVG viewBox is ~454x544, we want it ~1.5 units wide in 3D
const SVG_SCALE = 1.5 / 454

interface ShardState {
  origins: Float32Array
  positions: Float32Array
  velocities: Float32Array
  angularVels: Float32Array
  rotations: Float32Array
}

function buildShards(): ShardState {
  const origins = new Float32Array(SHARD_COUNT * 3)
  const positions = new Float32Array(SHARD_COUNT * 3)
  const velocities = new Float32Array(SHARD_COUNT * 3)
  const angularVels = new Float32Array(SHARD_COUNT * 3)
  const rotations = new Float32Array(SHARD_COUNT * 3)

  for (let i = 0; i < SHARD_COUNT; i++) {
    const b = i * 3
    const ox = (Math.random() - 0.5) * 2.5
    const oy = (Math.random() - 0.5) * 3.0
    const oz = (Math.random() - 0.5) * 0.2
    origins[b] = ox
    origins[b + 1] = oy
    origins[b + 2] = oz
    positions[b] = ox
    positions[b + 1] = oy
    positions[b + 2] = oz

    const speed = 2.5 + Math.random() * 4.0
    const angle = Math.atan2(oy, ox) + (Math.random() - 0.5) * 1.2
    velocities[b] = Math.cos(angle) * speed
    velocities[b + 1] = Math.abs(Math.sin(angle)) * speed * 0.7 + 1.5 + Math.random() * 2.0
    velocities[b + 2] = (Math.random() - 0.5) * speed * 0.3

    angularVels[b] = (Math.random() - 0.5) * 8
    angularVels[b + 1] = (Math.random() - 0.5) * 8
    angularVels[b + 2] = (Math.random() - 0.5) * 8
  }

  return { origins, positions, velocities, angularVels, rotations }
}

const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _euler = new THREE.Euler()
const _scale = new THREE.Vector3(1, 1, 1)
const _mat4 = new THREE.Matrix4()

/** Parse SVG and build extruded geometries for each path */
function useSVGGeometries(url: string, depth: number) {
  const [geometries, setGeometries] = useState<THREE.BufferGeometry[]>([])

  useEffect(() => {
    const loader = new SVGLoader()
    loader.load(url, (data) => {
      const geos: THREE.BufferGeometry[] = []

      for (const path of data.paths) {
        const shapes = SVGLoader.createShapes(path)
        for (const shape of shapes) {
          const geo = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: true,
            bevelThickness: 0.02 / SVG_SCALE,
            bevelSize: 0.01 / SVG_SCALE,
            bevelSegments: 3,
          })
          geos.push(geo)
        }
      }

      setGeometries(geos)
    })

    return () => {
      // Dispose on unmount
      geometries.forEach((g) => g.dispose())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, depth])

  return geometries
}

export function HeroMonolith() {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const logoGroupRef = useRef<THREE.Group>(null)
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const shardGeoRef = useRef<THREE.BoxGeometry | null>(null)

  const rotX = useRef(0)
  const rotY = useRef(0)
  const velX = useRef(0)
  const velY = useRef(0)

  const explodeTimeRef = useRef(0)
  const wasExplodedRef = useRef(false)
  const shardState = useRef<ShardState>(buildShards())

  const svgGeometries = useSVGGeometries('/assets/img/logo-new.svg', 0.3 / SVG_SCALE)

  const shardGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(SHARD_SIZE, SHARD_SIZE, SHARD_SIZE)
    shardGeoRef.current = geo
    return geo
  }, [])

  useEffect(() => {
    return () => {
      shardGeoRef.current?.dispose()
    }
  }, [])

  useFrame((_state, delta) => {
    const group = groupRef.current
    const mat = matRef.current
    const instanced = instancedRef.current
    if (!group || !mat) return

    const dt = Math.min(delta, 0.05)

    const { mousePosition, heroScrollProgress, heroExploded, setHeroExploded } =
      useAppStore.getState()

    // --- Detect explosion start ---
    if (heroExploded && !wasExplodedRef.current) {
      explodeTimeRef.current = 0
      wasExplodedRef.current = true
      const s = shardState.current
      for (let i = 0; i < SHARD_COUNT; i++) {
        const b = i * 3
        s.positions[b] = s.origins[b]!
        s.positions[b + 1] = s.origins[b + 1]!
        s.positions[b + 2] = s.origins[b + 2]!
        s.rotations[b] = 0
        s.rotations[b + 1] = 0
        s.rotations[b + 2] = 0
        const ox = s.origins[b]!
        const oy = s.origins[b + 1]!
        const speed = 2.5 + Math.random() * 4.0
        const angle = Math.atan2(oy, ox) + (Math.random() - 0.5) * 1.2
        s.velocities[b] = Math.cos(angle) * speed
        s.velocities[b + 1] = Math.abs(Math.sin(angle)) * speed * 0.7 + 1.5 + Math.random() * 2.0
        s.velocities[b + 2] = (Math.random() - 0.5) * speed * 0.3
      }
    }

    if (!heroExploded && wasExplodedRef.current) {
      wasExplodedRef.current = false
    }

    // --- Spring physics for mouse tracking ---
    const stiffness = 120
    const damping = 14

    const targetX = -mousePosition.y * 0.3
    const targetY = mousePosition.x * 0.3

    velX.current += (targetX - rotX.current) * stiffness * dt
    velX.current -= velX.current * damping * dt
    rotX.current += velX.current * dt

    velY.current += (targetY - rotY.current) * stiffness * dt
    velY.current -= velY.current * damping * dt
    rotY.current += velY.current * dt

    group.rotation.x = rotX.current
    group.rotation.y = rotY.current

    // --- Scroll fade (update ALL mesh materials in the logo group) ---
    const progress = heroScrollProgress
    const fadeOpacity = 1 - progress
    mat.opacity = fadeOpacity

    // Also update all other meshes' materials in the logo group
    if (logoGroupRef.current) {
      logoGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const meshMat = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial
          if (meshMat && meshMat !== mat) {
            meshMat.opacity = fadeOpacity
          }
        }
      })
    }

    const scrollScale = 1 - progress * 0.2
    group.scale.setScalar(scrollScale)
    group.visible = progress < 0.99

    // --- Shard animation ---
    if (wasExplodedRef.current && instanced) {
      explodeTimeRef.current += dt
      const t = explodeTimeRef.current
      const s = shardState.current

      instanced.visible = true

      for (let i = 0; i < SHARD_COUNT; i++) {
        const b = i * 3

        if (t < EXPLODE_DURATION) {
          s.velocities[b + 1] = s.velocities[b + 1]! - GRAVITY * dt
          s.positions[b] = s.positions[b]! + s.velocities[b]! * dt
          s.positions[b + 1] = s.positions[b + 1]! + s.velocities[b + 1]! * dt
          s.positions[b + 2] = s.positions[b + 2]! + s.velocities[b + 2]! * dt
          s.rotations[b] = s.rotations[b]! + s.angularVels[b]! * dt
          s.rotations[b + 1] = s.rotations[b + 1]! + s.angularVels[b + 1]! * dt
          s.rotations[b + 2] = s.rotations[b + 2]! + s.angularVels[b + 2]! * dt
        } else {
          const lerpAlpha = Math.min((t - EXPLODE_DURATION) / (TOTAL_DURATION - EXPLODE_DURATION), 1)
          const smooth = lerpAlpha * lerpAlpha * (3 - 2 * lerpAlpha)

          s.positions[b] = s.positions[b]! + (s.origins[b]! - s.positions[b]!) * smooth * dt * 6
          s.positions[b + 1] = s.positions[b + 1]! + (s.origins[b + 1]! - s.positions[b + 1]!) * smooth * dt * 6
          s.positions[b + 2] = s.positions[b + 2]! + (s.origins[b + 2]! - s.positions[b + 2]!) * smooth * dt * 6
          s.rotations[b] = s.rotations[b]! * (1 - smooth * dt * 6)
          s.rotations[b + 1] = s.rotations[b + 1]! * (1 - smooth * dt * 6)
          s.rotations[b + 2] = s.rotations[b + 2]! * (1 - smooth * dt * 6)
        }

        _pos.set(s.positions[b]!, s.positions[b + 1]!, s.positions[b + 2]!)
        _euler.set(s.rotations[b]!, s.rotations[b + 1]!, s.rotations[b + 2]!)
        _quat.setFromEuler(_euler)
        _mat4.compose(_pos, _quat, _scale)
        instanced.setMatrixAt(i, _mat4)
      }

      instanced.instanceMatrix.needsUpdate = true

      if (t >= TOTAL_DURATION) {
        instanced.visible = false
        setHeroExploded(false)
        wasExplodedRef.current = false
      }
    } else if (instanced) {
      instanced.visible = false
    }

    // Hide/show logo group while exploded
    if (logoGroupRef.current) {
      logoGroupRef.current.visible = !wasExplodedRef.current
    }
  })

  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      <Environment preset="city" />
      <pointLight position={[2, 2, 4]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-2, -1, 3]} intensity={0.4} color="#B51A2B" />

      {/* SVG logo extruded into 3D with glass material */}
      {/* SVG viewBox: x=213 y=341 w=454 h=544 → center at (440, 613) */}
      {/* Translate so center is at origin, then scale + flip Y */}
      <group
        ref={logoGroupRef}
        scale={[SVG_SCALE, -SVG_SCALE, SVG_SCALE]}
      >
        <group position={[-440, -613, 0]}>
          {svgGeometries.map((geo, i) => (
            <mesh key={i} geometry={geo}>
              <meshPhysicalMaterial
                ref={i === 0 ? matRef : undefined}
                metalness={0.6}
                roughness={0.25}
                transmission={0.25}
                thickness={1.5}
                ior={1.3}
                envMapIntensity={0.4}
                color="#B51A2B"
                clearcoat={0.15}
                clearcoatRoughness={0.4}
                transparent={true}
                opacity={1}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Shard instanced mesh */}
      <instancedMesh
        ref={instancedRef}
        args={[shardGeometry, undefined, SHARD_COUNT]}
        visible={false}
      >
        <meshPhysicalMaterial
          metalness={0.3}
          roughness={0.55}
          transmission={0.15}
          thickness={1.5}
          ior={1.3}
          envMapIntensity={0.4}
          color="#B51A2B"
          clearcoat={0.15}
          clearcoatRoughness={0.6}
          transparent={true}
          opacity={0.9}
        />
      </instancedMesh>
    </group>
  )
}
