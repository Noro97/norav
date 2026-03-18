import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, Environment, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

const SHARD_COUNT = 40
const SHARD_SIZE = 0.05
const EXPLODE_DURATION = 1.5
const TOTAL_DURATION = 3.0
const GRAVITY = 4.0

// Per-shard simulation state stored in flat arrays (avoids object allocation in frame loop)
interface ShardState {
  origins: Float32Array    // [x,y,z] * SHARD_COUNT  — home positions
  positions: Float32Array  // current positions
  velocities: Float32Array // current velocities
  angularVels: Float32Array // [ax,ay,az] * SHARD_COUNT
  rotations: Float32Array  // current euler angles
}

function buildShards(): ShardState {
  const origins = new Float32Array(SHARD_COUNT * 3)
  const positions = new Float32Array(SHARD_COUNT * 3)
  const velocities = new Float32Array(SHARD_COUNT * 3)
  const angularVels = new Float32Array(SHARD_COUNT * 3)
  const rotations = new Float32Array(SHARD_COUNT * 3)

  // Text bounding area: roughly ±1.4 wide, ±0.7 tall in local space
  for (let i = 0; i < SHARD_COUNT; i++) {
    const b = i * 3
    const ox = (Math.random() - 0.5) * 2.8
    const oy = (Math.random() - 0.5) * 1.4
    const oz = (Math.random() - 0.5) * 0.2
    origins[b] = ox
    origins[b + 1] = oy
    origins[b + 2] = oz
    positions[b] = ox
    positions[b + 1] = oy
    positions[b + 2] = oz

    // Outward velocity from centre + upward bias
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

// Reusable temp objects for matrix composition (allocated once)
const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _euler = new THREE.Euler()
const _scale = new THREE.Vector3(1, 1, 1)
const _mat4 = new THREE.Matrix4()

export function HeroMonolith() {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const shardGeoRef = useRef<THREE.BoxGeometry | null>(null)

  // Spring state kept in refs to avoid re-renders
  const rotX = useRef(0)
  const rotY = useRef(0)
  const velX = useRef(0)
  const velY = useRef(0)

  // Explosion state
  const explodeTimeRef = useRef(0)
  const wasExplodedRef = useRef(false)
  const shardState = useRef<ShardState>(buildShards())

  // Build the geometry once and keep a ref for disposal
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
      // Reset timer and re-randomise velocities from current positions
      explodeTimeRef.current = 0
      wasExplodedRef.current = true
      const s = shardState.current
      for (let i = 0; i < SHARD_COUNT; i++) {
        const b = i * 3
        // Reset positions to origins
        s.positions[b] = s.origins[b]!
        s.positions[b + 1] = s.origins[b + 1]!
        s.positions[b + 2] = s.origins[b + 2]!
        s.rotations[b] = 0
        s.rotations[b + 1] = 0
        s.rotations[b + 2] = 0
        // Randomise velocities again for variety each click
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
      // Explosion finished, reset flag
      wasExplodedRef.current = false
    }

    // --- Spring physics for mouse tracking ---
    const stiffness = 120
    const damping = 14

    const targetX = mousePosition.y * 0.3
    const targetY = mousePosition.x * 0.3

    velX.current += (targetX - rotX.current) * stiffness * dt
    velX.current -= velX.current * damping * dt
    rotX.current += velX.current * dt

    velY.current += (targetY - rotY.current) * stiffness * dt
    velY.current -= velY.current * damping * dt
    rotY.current += velY.current * dt

    group.rotation.x = rotX.current
    group.rotation.y = rotY.current

    // --- Scroll fade ---
    const progress = heroScrollProgress
    mat.opacity = 1 - progress
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
          // Physics integration: apply gravity, integrate position
          s.velocities[b + 1] = s.velocities[b + 1]! - GRAVITY * dt
          s.positions[b] = s.positions[b]! + s.velocities[b]! * dt
          s.positions[b + 1] = s.positions[b + 1]! + s.velocities[b + 1]! * dt
          s.positions[b + 2] = s.positions[b + 2]! + s.velocities[b + 2]! * dt
          s.rotations[b] = s.rotations[b]! + s.angularVels[b]! * dt
          s.rotations[b + 1] = s.rotations[b + 1]! + s.angularVels[b + 1]! * dt
          s.rotations[b + 2] = s.rotations[b + 2]! + s.angularVels[b + 2]! * dt
        } else {
          // Lerp back to origin
          const lerpAlpha = Math.min((t - EXPLODE_DURATION) / (TOTAL_DURATION - EXPLODE_DURATION), 1)
          const smooth = lerpAlpha * lerpAlpha * (3 - 2 * lerpAlpha) // smoothstep

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

      // End the explosion cycle
      if (t >= TOTAL_DURATION) {
        instanced.visible = false
        setHeroExploded(false)
        wasExplodedRef.current = false
      }
    } else if (instanced) {
      instanced.visible = false
    }

    // Hide / show main text mesh while exploded
    // The Text is the first child of the Center group, which is the first child of groupRef
    const center = group.children[1] // Environment + Center
    if (center) {
      center.visible = !wasExplodedRef.current
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <Environment preset="city" />
      <Center>
        <Text
          fontSize={1.2}
          letterSpacing={-0.05}
          anchorX="center"
          anchorY="middle"
        >
          GY
          <meshPhysicalMaterial
            ref={matRef}
            metalness={0.95}
            roughness={0.05}
            transmission={0.6}
            thickness={1.5}
            ior={1.5}
            envMapIntensity={2.0}
            color="#1a0a10"
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transparent={true}
            opacity={1}
          />
        </Text>
      </Center>

      {/* Shard instanced mesh — same glass material as text */}
      <instancedMesh
        ref={instancedRef}
        args={[shardGeometry, undefined, SHARD_COUNT]}
        visible={false}
      >
        <meshPhysicalMaterial
          metalness={0.95}
          roughness={0.05}
          transmission={0.6}
          thickness={1.5}
          ior={1.5}
          envMapIntensity={2.0}
          color="#1a0a10"
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transparent={true}
          opacity={0.9}
        />
      </instancedMesh>
    </group>
  )
}
