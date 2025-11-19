import { create } from 'zustand'

interface MercuryState {
  // View controls
  autoRotate: boolean
  rotationSpeed: number
  showLabels: boolean
  showAtmosphere: boolean

  // Surface features
  showCraters: boolean
  surfaceDetail: number

  // Camera
  cameraDistance: number

  // Info panel
  selectedFeature: string | null
  showInfo: boolean

  // Loading
  isLoading: boolean
  loadingProgress: number

  // Actions
  setAutoRotate: (value: boolean) => void
  setRotationSpeed: (value: number) => void
  setShowLabels: (value: boolean) => void
  setShowAtmosphere: (value: boolean) => void
  setShowCraters: (value: boolean) => void
  setSurfaceDetail: (value: number) => void
  setCameraDistance: (value: number) => void
  setSelectedFeature: (feature: string | null) => void
  setShowInfo: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  setLoadingProgress: (value: number) => void
}

export const useMercuryStore = create<MercuryState>((set) => ({
  // Initial state
  autoRotate: true,
  rotationSpeed: 0.1,
  showLabels: true,
  showAtmosphere: true,
  showCraters: true,
  surfaceDetail: 1,
  cameraDistance: 4,
  selectedFeature: null,
  showInfo: true,
  isLoading: true,
  loadingProgress: 0,

  // Actions
  setAutoRotate: (value) => set({ autoRotate: value }),
  setRotationSpeed: (value) => set({ rotationSpeed: value }),
  setShowLabels: (value) => set({ showLabels: value }),
  setShowAtmosphere: (value) => set({ showAtmosphere: value }),
  setShowCraters: (value) => set({ showCraters: value }),
  setSurfaceDetail: (value) => set({ surfaceDetail: value }),
  setCameraDistance: (value) => set({ cameraDistance: value }),
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  setShowInfo: (value) => set({ showInfo: value }),
  setIsLoading: (value) => set({ isLoading: value }),
  setLoadingProgress: (value) => set({ loadingProgress: value }),
}))

// Mercury facts data
export const mercuryFacts = {
  general: {
    title: "Mercury",
    subtitle: "The Swift Planet",
    description: "Mercury is the smallest planet in our Solar System and the closest to the Sun. Its surface is heavily cratered and similar in appearance to Earth's Moon.",
  },
  stats: [
    { label: "Diameter", value: "4,879 km", detail: "38% of Earth" },
    { label: "Mass", value: "3.3 × 10²³ kg", detail: "5.5% of Earth" },
    { label: "Distance from Sun", value: "57.9 million km", detail: "0.39 AU" },
    { label: "Orbital Period", value: "88 Earth days", detail: "Fastest orbit" },
    { label: "Rotation Period", value: "59 Earth days", detail: "3:2 resonance" },
    { label: "Surface Temp", value: "-180°C to 430°C", detail: "Greatest range" },
    { label: "Gravity", value: "3.7 m/s²", detail: "38% of Earth" },
    { label: "Moons", value: "0", detail: "No natural satellites" },
  ],
  features: [
    {
      id: "caloris",
      name: "Caloris Basin",
      description: "One of the largest impact basins in the Solar System, about 1,550 km in diameter. Created by a massive asteroid impact around 3.9 billion years ago.",
      coordinates: { lat: 30.5, lon: 170.2 },
    },
    {
      id: "rembrandt",
      name: "Rembrandt Basin",
      description: "The second-largest impact basin on Mercury, approximately 715 km in diameter. Named after the Dutch painter.",
      coordinates: { lat: -33, lon: 88 },
    },
    {
      id: "rachmaninoff",
      name: "Rachmaninoff Basin",
      description: "A double-ring basin about 290 km in diameter with evidence of past volcanic activity.",
      coordinates: { lat: 27.6, lon: 57.4 },
    },
    {
      id: "hokusai",
      name: "Hokusai Crater",
      description: "A prominent ray crater named after the Japanese artist, known for its extensive ray system visible across the planet.",
      coordinates: { lat: 57.8, lon: 16.8 },
    },
    {
      id: "degas",
      name: "Degas Crater",
      description: "A well-preserved crater with prominent central peaks and terraced walls, about 60 km in diameter.",
      coordinates: { lat: 37.4, lon: -127 },
    },
  ],
}
