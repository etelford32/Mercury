import { useEffect, useRef } from 'react'
import { useMercuryStore } from '../../store/mercuryStore'
import './LoadingScreen.css'

export function LoadingScreen() {
  const { loadingProgress, setLoadingProgress, setIsLoading } = useMercuryStore()
  const progressRef = useRef(loadingProgress)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      progressRef.current += Math.random() * 15
      if (progressRef.current >= 100) {
        progressRef.current = 100
        setLoadingProgress(100)
        clearInterval(interval)
        setTimeout(() => setIsLoading(false), 500)
      } else {
        setLoadingProgress(progressRef.current)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [setLoadingProgress, setIsLoading])

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1 className="loading-title">MERCURY</h1>
        <p className="loading-subtitle">The Swift Planet</p>

        <div className="loading-bar-container">
          <div
            className="loading-bar"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>

        <p className="loading-text">
          Loading surface textures... {Math.round(loadingProgress)}%
        </p>

        <div className="loading-facts">
          <p>Distance from Sun: 57.9 million km</p>
        </div>
      </div>
    </div>
  )
}
