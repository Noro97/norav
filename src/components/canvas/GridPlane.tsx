import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

const GRID_SIZE = 40
const GRID_DIVISIONS = 40

const GRID_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScrollZ;
  uniform float uCollapsed;

  void main() {
    vec3 pos = position;
    float wave = sin(pos.x * 0.3 + uTime) * cos(pos.y * 0.3 + uTime + uScrollZ) * 1.5;
    pos.z = wave * (1.0 - uCollapsed);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const GRID_FRAG = /* glsl */ `
  void main() {
    gl_FragColor = vec4(0.71, 0.1, 0.17, 0.06);
  }
`

export function GridPlane() {
  const linesRef = useRef<THREE.LineSegments>(null)
  const collapsedRef = useRef(0)

  const geometry = useMemo(() => {
    const positions: number[] = []
    const half = GRID_SIZE / 2
    const step = GRID_SIZE / GRID_DIVISIONS

    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const y = -half + i * step
      for (let j = 0; j < GRID_DIVISIONS; j++) {
        const x1 = -half + j * step
        const x2 = x1 + step
        positions.push(x1, y, 0, x2, y, 0)
      }
    }
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const x = -half + i * step
      for (let j = 0; j < GRID_DIVISIONS; j++) {
        const y1 = -half + j * step
        const y2 = y1 + step
        positions.push(x, y1, 0, x, y2, 0)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollZ: { value: 0 },
      uCollapsed: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (!linesRef.current) return

    const store = useAppStore.getState()
    const targetCollapsed = store.particlesCollapsed ? 1.0 : 0.0
    collapsedRef.current += (targetCollapsed - collapsedRef.current) * 0.05

    const mat = linesRef.current.material as THREE.ShaderMaterial
    mat.uniforms['uTime']!.value = state.clock.elapsedTime * 0.3
    mat.uniforms['uScrollZ']!.value = store.scrollProgress * 4.0
    mat.uniforms['uCollapsed']!.value = collapsedRef.current
  })

  return (
    <lineSegments ref={linesRef} geometry={geometry} position={[0, 0, -4]}>
      <shaderMaterial
        vertexShader={GRID_VERT}
        fragmentShader={GRID_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  )
}
