import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, Environment, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

export function HeroMonolith() {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null)

  // Spring state kept in refs to avoid re-renders
  const rotX = useRef(0)
  const rotY = useRef(0)
  const velX = useRef(0)
  const velY = useRef(0)

  useFrame((_state, delta) => {
    const group = groupRef.current
    const mat = matRef.current
    if (!group || !mat) return

    const dt = Math.min(delta, 0.05) // clamp delta to avoid spiral on tab refocus

    // Read store state directly (no subscription overhead inside useFrame)
    const { mousePosition, heroScrollProgress } = useAppStore.getState()

    // --- Spring physics ---
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
    const scale = 1 - progress * 0.2 // 1 → 0.8
    group.scale.setScalar(scale)
    group.visible = progress < 0.99
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
    </group>
  )
}
