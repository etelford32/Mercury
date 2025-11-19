import { useRef } from 'react'
import { DirectionalLight } from 'three'

export function SunLight() {
  const lightRef = useRef<DirectionalLight>(null)

  return (
    <>
      {/* Main sun light */}
      <directionalLight
        ref={lightRef}
        position={[10, 3, 5]}
        intensity={2.5}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light for subtle detail in shadows */}
      <directionalLight
        position={[-5, -2, -3]}
        intensity={0.1}
        color="#4a5568"
      />

      {/* Rim light for definition */}
      <directionalLight
        position={[-3, 2, -5]}
        intensity={0.3}
        color="#ffd4a3"
      />
    </>
  )
}
