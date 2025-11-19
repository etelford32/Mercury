/**
 * Mercury Texture Generator
 * Generates procedural texture maps for a hyperrealistic Mercury simulation
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 2048;
const OUTPUT_DIR = path.join(__dirname, '../public/textures');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Simplex noise implementation
class SimplexNoise {
  constructor(seed = Math.random()) {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) this.p[i] = i;

    // Shuffle based on seed
    let n = seed * 256;
    for (let i = 255; i > 0; i--) {
      n = (n * 16807) % 2147483647;
      const j = Math.floor((n / 2147483647) * (i + 1));
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }

    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  noise2D(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    const grad = (hash, x, y) => {
      const h = hash & 7;
      const u = h < 4 ? x : y;
      const v = h < 4 ? y : x;
      return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
    };

    let n0 = 0, n1 = 0, n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * grad(this.perm[ii + this.perm[jj]], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * grad(this.perm[ii + i1 + this.perm[jj + j1]], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * grad(this.perm[ii + 1 + this.perm[jj + 1]], x2, y2);
    }

    return 70 * (n0 + n1 + n2);
  }

  fbm(x, y, octaves = 6, lacunarity = 2, persistence = 0.5) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2D(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }
}

// Generate crater
function generateCrater(x, y, cx, cy, radius, depth) {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > radius * 1.3) return 0;

  const normalizedDist = dist / radius;

  if (normalizedDist < 0.8) {
    // Inside crater - depression
    const innerDist = normalizedDist / 0.8;
    return -depth * (1 - innerDist * innerDist) * 0.7;
  } else if (normalizedDist < 1.0) {
    // Rim - raised edge
    const rimDist = (normalizedDist - 0.8) / 0.2;
    return depth * 0.5 * Math.sin(rimDist * Math.PI);
  } else {
    // Outer ejecta
    const ejectaDist = (normalizedDist - 1.0) / 0.3;
    return depth * 0.2 * (1 - ejectaDist) * (1 - ejectaDist);
  }
}

// Generate color map
function generateColorMap() {
  console.log('Generating color map...');
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(SIZE, SIZE);
  const data = imageData.data;

  const noise = new SimplexNoise(42);
  const noise2 = new SimplexNoise(123);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;

      // Convert to spherical coordinates for seamless wrapping
      const u = x / SIZE;
      const v = y / SIZE;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      // Base color with fbm noise
      const scale = 4;
      let value = noise.fbm(nx * scale, ny * scale, 6) * 0.5 + 0.5;

      // Add variation
      const variation = noise2.fbm(nx * scale * 2, nz * scale * 2, 4) * 0.3;
      value = Math.max(0, Math.min(1, value + variation));

      // Mercury's gray-brown color palette
      const baseR = 140;
      const baseG = 130;
      const baseB = 120;

      // Color variation
      const r = Math.floor(baseR + value * 40 - 20);
      const g = Math.floor(baseG + value * 35 - 17);
      const b = Math.floor(baseB + value * 30 - 15);

      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'mercury_color.jpg'), buffer);
  console.log('Color map saved.');
}

// Generate normal map
function generateNormalMap() {
  console.log('Generating normal map...');
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(SIZE, SIZE);
  const data = imageData.data;

  const noise = new SimplexNoise(42);

  // Generate height data first
  const heights = new Float32Array(SIZE * SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE;
      const v = y / SIZE;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      // Multi-octave noise for terrain
      let height = noise.fbm(nx * 8, ny * 8, 8, 2, 0.5);

      // Add craters
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
      ];

      for (const crater of craters) {
        height += generateCrater(u, v, crater.x, crater.y, crater.r, crater.d);
      }

      // Add many small craters
      for (let i = 0; i < 50; i++) {
        const cx = (noise.noise2D(i * 0.1, 0) + 1) * 0.5;
        const cy = (noise.noise2D(0, i * 0.1) + 1) * 0.5;
        const cr = 0.01 + Math.abs(noise.noise2D(i, i)) * 0.02;
        const cd = 0.1 + Math.abs(noise.noise2D(i * 2, i * 2)) * 0.15;
        height += generateCrater(u, v, cx, cy, cr, cd);
      }

      heights[y * SIZE + x] = height;
    }
  }

  // Calculate normals from heights
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;

      const x1 = (x - 1 + SIZE) % SIZE;
      const x2 = (x + 1) % SIZE;
      const y1 = (y - 1 + SIZE) % SIZE;
      const y2 = (y + 1) % SIZE;

      const left = heights[y * SIZE + x1];
      const right = heights[y * SIZE + x2];
      const up = heights[y1 * SIZE + x];
      const down = heights[y2 * SIZE + x];

      const dx = (right - left) * 2;
      const dy = (down - up) * 2;

      // Normalize
      const len = Math.sqrt(dx * dx + dy * dy + 1);

      data[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((1 / len * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'mercury_normal.jpg'), buffer);
  console.log('Normal map saved.');
}

// Generate roughness map
function generateRoughnessMap() {
  console.log('Generating roughness map...');
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(SIZE, SIZE);
  const data = imageData.data;

  const noise = new SimplexNoise(789);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;

      const u = x / SIZE;
      const v = y / SIZE;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);

      // High roughness with variation
      let roughness = 0.7 + noise.fbm(nx * 16, ny * 16, 4) * 0.3;
      roughness = Math.max(0, Math.min(1, roughness));

      const value = Math.floor(roughness * 255);

      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'mercury_roughness.jpg'), buffer);
  console.log('Roughness map saved.');
}

// Generate displacement map
function generateDisplacementMap() {
  console.log('Generating displacement map...');
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(SIZE, SIZE);
  const data = imageData.data;

  const noise = new SimplexNoise(42);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;

      const u = x / SIZE;
      const v = y / SIZE;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      // Terrain displacement
      let displacement = noise.fbm(nx * 8, ny * 8, 6, 2, 0.5) * 0.5 + 0.5;

      // Add crater influence
      const craters = [
        { x: 0.3, y: 0.4, r: 0.08, d: 0.15 },
        { x: 0.7, y: 0.3, r: 0.12, d: 0.2 },
        { x: 0.5, y: 0.6, r: 0.06, d: 0.1 },
        { x: 0.5, y: 0.35, r: 0.15, d: 0.25 },
      ];

      for (const crater of craters) {
        const craterValue = generateCrater(u, v, crater.x, crater.y, crater.r, crater.d);
        displacement += craterValue * 0.5;
      }

      displacement = Math.max(0, Math.min(1, displacement));
      const value = Math.floor(displacement * 255);

      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'mercury_displacement.jpg'), buffer);
  console.log('Displacement map saved.');
}

// Main execution
console.log('Starting Mercury texture generation...');
console.log(`Output directory: ${OUTPUT_DIR}`);
console.log(`Texture size: ${SIZE}x${SIZE}`);
console.log('');

generateColorMap();
generateNormalMap();
generateRoughnessMap();
generateDisplacementMap();

console.log('');
console.log('All textures generated successfully!');
