import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Mercury } from './Mercury'
import { Sun } from '../Sun/Sun'
import { SolarWindParticles } from '../SolarWind/SolarWindParticles'
import { Magnetosphere } from '../Magnetosphere/Magnetosphere'
import { LoadingScreen } from '../UI/LoadingScreen'
import { useMercuryStore } from '../../store/mercuryStore'
import { useSimulationStore } from '../../store/simulationStore'

function SceneContent() {
  const { cameraDistance } = useMercuryStore()
  const { showSun } = useSimulationStore()

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[0, 0, cameraDistance]}
        fov={45}
        near={0.1}
        far={1000}
      />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        minDistance={1.5}
        maxDistance={100}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />

      {/* Lighting */}
      <ambientLight intensity={0.05} />

      {/* Environment */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Sun with corona and activity */}
      {showSun && (
        <Suspense fallback={null}>
          <Sun />
        </Suspense>
      )}

      {/* Solar Wind Particles */}
      <Suspense fallback={null}>
        <SolarWindParticles />
      </Suspense>

      {/* Mercury with magnetosphere */}
      <group position={[0, 0, 0]}>
        <Suspense fallback={null}>
          <Mercury />
        </Suspense>

        {/* Mercury Magnetosphere */}
        <Suspense fallback={null}>
          <Magnetosphere />
        </Suspense>
      </group>

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.9}
          radius={1.0}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0005, 0.0005]}
        />
        <Vignette
          darkness={0.5}
          offset={0.3}
        />
      </EffectComposer>
    </>
  )
}

export function Scene() {
  const { isLoading } = useMercuryStore()

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {isLoading && <LoadingScreen />}
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000008']} />
        <fog attach="fog" args={['#000008', 10, 50]} />
        <SceneContent />
      </Canvas>
    </div>
  )
}
