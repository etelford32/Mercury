import { useControls, folder } from 'leva'
import { useMercuryStore } from '../../store/mercuryStore'
import { useEffect } from 'react'

export function Controls() {
  const {
    setAutoRotate,
    setRotationSpeed,
    setShowAtmosphere,
    setSurfaceDetail,
  } = useMercuryStore()

  const controls = useControls({
    'Rotation': folder({
      autoRotate: {
        value: true,
        label: 'Auto Rotate',
      },
      rotationSpeed: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Speed',
      },
    }),
    'Surface': folder({
      surfaceDetail: {
        value: 1,
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Detail Level',
      },
      showAtmosphere: {
        value: true,
        label: 'Atmosphere Glow',
      },
    }),
  })

  // Sync Leva controls with Zustand store
  useEffect(() => {
    setAutoRotate(controls.autoRotate)
  }, [controls.autoRotate, setAutoRotate])

  useEffect(() => {
    setRotationSpeed(controls.rotationSpeed)
  }, [controls.rotationSpeed, setRotationSpeed])

  useEffect(() => {
    setShowAtmosphere(controls.showAtmosphere)
  }, [controls.showAtmosphere, setShowAtmosphere])

  useEffect(() => {
    setSurfaceDetail(controls.surfaceDetail)
  }, [controls.surfaceDetail, setSurfaceDetail])

  return null
}
