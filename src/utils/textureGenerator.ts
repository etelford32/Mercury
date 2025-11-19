import { CanvasTexture, RepeatWrapping, LinearMipMapLinearFilter, LinearFilter } from 'three'

// Simplex noise implementation for procedural textures
class SimplexNoise {
  private perm: Uint8Array

  constructor(seed: number = Math.random() * 10000) {
    const p = new Uint8Array(256)
    for (let i = 0; i < 256; i++) p[i] = i

    let n = seed
    for (let i = 255; i > 0; i--) {
      n = (n * 16807) % 2147483647
      const j = Math.floor((n / 2147483647) * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }

    this.perm = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255]
    }
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1)
    const G2 = (3 - Math.sqrt(3)) / 6

    const s = (x + y) * F2
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)

    const t = (i + j) * G2
    const X0 = i - t
    const Y0 = j - t
    const x0 = x - X0
    const y0 = y - Y0

    let i1: number, j1: number
    if (x0 > y0) { i1 = 1; j1 = 0 }
    else { i1 = 0; j1 = 1 }

    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2

    const ii = i & 255
    const jj = j & 255

    const grad = (hash: number, gx: number, gy: number): number => {
      const h = hash & 7
      const u = h < 4 ? gx : gy
      const v = h < 4 ? gy : gx
      return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v)
    }

    let n0 = 0, n1 = 0, n2 = 0

    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 >= 0) {
      t0 *= t0
      n0 = t0 * t0 * grad(this.perm[ii + this.perm[jj]], x0, y0)
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 >= 0) {
      t1 *= t1
      n1 = t1 * t1 * grad(this.perm[ii + i1 + this.perm[jj + j1]], x1, y1)
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 >= 0) {
      t2 *= t2
      n2 = t2 * t2 * grad(this.perm[ii + 1 + this.perm[jj + 1]], x2, y2)
    }

    return 70 * (n0 + n1 + n2)
  }

  fbm(x: number, y: number, octaves = 6, lacunarity = 2, persistence = 0.5): number {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2D(x * frequency, y * frequency)
      maxValue += amplitude
      amplitude *= persistence
      frequency *= lacunarity
    }

    return value / maxValue
  }
}

function generateCrater(x: number, y: number, cx: number, cy: number, radius: number, depth: number): number {
  const dx = x - cx
  const dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist > radius * 1.3) return 0

  const normalizedDist = dist / radius

  if (normalizedDist < 0.8) {
    const innerDist = normalizedDist / 0.8
    return -depth * (1 - innerDist * innerDist) * 0.7
  } else if (normalizedDist < 1.0) {
    const rimDist = (normalizedDist - 0.8) / 0.2
    return depth * 0.5 * Math.sin(rimDist * Math.PI)
  } else {
    const ejectaDist = (normalizedDist - 1.0) / 0.3
    return depth * 0.2 * (1 - ejectaDist) * (1 - ejectaDist)
  }
}

const SIZE = 1024 // Reduced for browser performance

export function generateMercuryTextures() {
  const colorCanvas = document.createElement('canvas')
  const normalCanvas = document.createElement('canvas')
  const roughnessCanvas = document.createElement('canvas')
  const displacementCanvas = document.createElement('canvas')

  colorCanvas.width = normalCanvas.width = roughnessCanvas.width = displacementCanvas.width = SIZE
  colorCanvas.height = normalCanvas.height = roughnessCanvas.height = displacementCanvas.height = SIZE

  const colorCtx = colorCanvas.getContext('2d')!
  const normalCtx = normalCanvas.getContext('2d')!
  const roughnessCtx = roughnessCanvas.getContext('2d')!
  const displacementCtx = displacementCanvas.getContext('2d')!

  const colorData = colorCtx.createImageData(SIZE, SIZE)
  const normalData = normalCtx.createImageData(SIZE, SIZE)
  const roughnessData = roughnessCtx.createImageData(SIZE, SIZE)
  const displacementData = displacementCtx.createImageData(SIZE, SIZE)

  const noise = new SimplexNoise(42)
  const noise2 = new SimplexNoise(123)
  const noise3 = new SimplexNoise(789)

  // Crater definitions
  const craters = [
    { x: 0.3, y: 0.4, r: 0.08, d: 0.4 },
    { x: 0.7, y: 0.3, r: 0.12, d: 0.5 },
    { x: 0.5, y: 0.6, r: 0.06, d: 0.3 },
    { x: 0.2, y: 0.7, r: 0.1, d: 0.45 },
    { x: 0.8, y: 0.6, r: 0.07, d: 0.35 },
    { x: 0.4, y: 0.2, r: 0.05, d: 0.25 },
    { x: 0.6, y: 0.8, r: 0.09, d: 0.4 },
    { x: 0.15, y: 0.5, r: 0.04, d: 0.2 },
    { x: 0.85, y: 0.4, r: 0.06, d: 0.3 },
    { x: 0.5, y: 0.35, r: 0.15, d: 0.6 }, // Large Caloris-like basin
  ]

  // Generate small craters
  const smallCraters: Array<{ x: number; y: number; r: number; d: number }> = []
  for (let i = 0; i < 100; i++) {
    smallCraters.push({
      x: (noise.noise2D(i * 0.1, 0) + 1) * 0.5,
      y: (noise.noise2D(0, i * 0.1) + 1) * 0.5,
      r: 0.008 + Math.abs(noise.noise2D(i, i)) * 0.015,
      d: 0.08 + Math.abs(noise.noise2D(i * 2, i * 2)) * 0.12,
    })
  }

  // Height map for normal calculation
  const heights = new Float32Array(SIZE * SIZE)

  // Generate all textures
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4
      const u = x / SIZE
      const v = y / SIZE

      // Spherical mapping
      const theta = u * Math.PI * 2
      const phi = v * Math.PI
      const nx = Math.sin(phi) * Math.cos(theta)
      const ny = Math.sin(phi) * Math.sin(theta)
      const nz = Math.cos(phi)

      // === COLOR MAP ===
      const scale = 4
      let colorValue = noise.fbm(nx * scale, ny * scale, 6) * 0.5 + 0.5
      const variation = noise2.fbm(nx * scale * 2, nz * scale * 2, 4) * 0.3
      colorValue = Math.max(0, Math.min(1, colorValue + variation))

      // Mercury's gray-brown palette
      const baseR = 140, baseG = 130, baseB = 120
      const r = Math.max(0, Math.min(255, Math.floor(baseR + colorValue * 40 - 20)))
      const g = Math.max(0, Math.min(255, Math.floor(baseG + colorValue * 35 - 17)))
      const b = Math.max(0, Math.min(255, Math.floor(baseB + colorValue * 30 - 15)))

      colorData.data[idx] = r
      colorData.data[idx + 1] = g
      colorData.data[idx + 2] = b
      colorData.data[idx + 3] = 255

      // === HEIGHT/DISPLACEMENT ===
      let height = noise.fbm(nx * 8, ny * 8, 6, 2, 0.5) * 0.5 + 0.5

      // Add craters
      for (const crater of craters) {
        height += generateCrater(u, v, crater.x, crater.y, crater.r, crater.d) * 0.5
      }
      for (const crater of smallCraters) {
        height += generateCrater(u, v, crater.x, crater.y, crater.r, crater.d) * 0.3
      }

      heights[y * SIZE + x] = height

      const dispValue = Math.max(0, Math.min(255, Math.floor(Math.max(0, Math.min(1, height)) * 255)))
      displacementData.data[idx] = dispValue
      displacementData.data[idx + 1] = dispValue
      displacementData.data[idx + 2] = dispValue
      displacementData.data[idx + 3] = 255

      // === ROUGHNESS ===
      let roughness = 0.7 + noise3.fbm(nx * 16, ny * 16, 4) * 0.3
      roughness = Math.max(0, Math.min(1, roughness))
      const roughValue = Math.floor(roughness * 255)

      roughnessData.data[idx] = roughValue
      roughnessData.data[idx + 1] = roughValue
      roughnessData.data[idx + 2] = roughValue
      roughnessData.data[idx + 3] = 255
    }
  }

  // === NORMAL MAP (calculated from heights) ===
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4

      const x1 = (x - 1 + SIZE) % SIZE
      const x2 = (x + 1) % SIZE
      const y1 = (y - 1 + SIZE) % SIZE
      const y2 = (y + 1) % SIZE

      const left = heights[y * SIZE + x1]
      const right = heights[y * SIZE + x2]
      const up = heights[y1 * SIZE + x]
      const down = heights[y2 * SIZE + x]

      const dx = (right - left) * 2
      const dy = (down - up) * 2
      const len = Math.sqrt(dx * dx + dy * dy + 1)

      normalData.data[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255)
      normalData.data[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255)
      normalData.data[idx + 2] = Math.floor((1 / len * 0.5 + 0.5) * 255)
      normalData.data[idx + 3] = 255
    }
  }

  // Put image data on canvases
  colorCtx.putImageData(colorData, 0, 0)
  normalCtx.putImageData(normalData, 0, 0)
  roughnessCtx.putImageData(roughnessData, 0, 0)
  displacementCtx.putImageData(displacementData, 0, 0)

  // Create Three.js textures
  const createTexture = (canvas: HTMLCanvasElement): CanvasTexture => {
    const texture = new CanvasTexture(canvas)
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.minFilter = LinearMipMapLinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = true
    return texture
  }

  return {
    colorMap: createTexture(colorCanvas),
    normalMap: createTexture(normalCanvas),
    roughnessMap: createTexture(roughnessCanvas),
    displacementMap: createTexture(displacementCanvas),
  }
}
