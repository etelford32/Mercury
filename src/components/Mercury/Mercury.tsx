import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, ShaderMaterial, Color, AdditiveBlending, Texture } from 'three'
import { useMercuryStore } from '../../store/mercuryStore'
import { generateMercuryTextures } from '../../utils/textureGenerator'

// Custom shader for enhanced surface detail
const mercuryVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform float displacementScale;
  uniform sampler2D displacementMap;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Displacement mapping for crater depth
    float displacement = texture2D(displacementMap, uv).r;
    vec3 newPosition = position + normal * displacement * displacementScale;

    vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const mercuryFragmentShader = `
  uniform sampler2D colorMap;
  uniform sampler2D normalMap;
  uniform sampler2D roughnessMap;
  uniform vec3 sunDirection;
  uniform float ambientIntensity;
  uniform float surfaceDetail;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Sample textures
    vec4 color = texture2D(colorMap, vUv);
    vec3 normalTex = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
    float roughness = texture2D(roughnessMap, vUv).r;

    // Combine normals
    vec3 normal = normalize(vNormal + normalTex * surfaceDetail * 0.3);

    // Lighting calculation
    vec3 lightDir = normalize(sunDirection);
    float diffuse = max(dot(normal, lightDir), 0.0);

    // Specular highlight (subtle for rocky surface)
    vec3 viewDir = normalize(-vPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0 * (1.0 - roughness));

    // Combine lighting
    vec3 ambient = color.rgb * ambientIntensity;
    vec3 diffuseColor = color.rgb * diffuse;
    vec3 specular = vec3(0.2) * spec * (1.0 - roughness);

    vec3 finalColor = ambient + diffuseColor + specular;

    // Slight color temperature adjustment for realism
    finalColor *= vec3(1.0, 0.98, 0.95);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// Atmosphere shader
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform vec3 sunDirection;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = pow(rim, 3.0);

    // Sun-facing glow
    vec3 lightDir = normalize(sunDirection);
    float sunFacing = max(dot(vNormal, lightDir), 0.0);

    float alpha = rim * intensity * (0.3 + sunFacing * 0.7);

    gl_FragColor = vec4(glowColor, alpha);
  }
`

interface TextureSet {
  colorMap: Texture
  normalMap: Texture
  roughnessMap: Texture
  displacementMap: Texture
}

export function Mercury() {
  const meshRef = useRef<Mesh>(null)
  const atmosphereRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)

  const { autoRotate, rotationSpeed, showAtmosphere, surfaceDetail, setIsLoading, setLoadingProgress } = useMercuryStore()

  // State for procedurally generated textures
  const [textures, setTextures] = useState<TextureSet | null>(null)

  // Generate textures on mount
  useEffect(() => {
    setLoadingProgress(10)

    // Use requestIdleCallback or setTimeout for non-blocking generation
    const timeoutId = setTimeout(() => {
      setLoadingProgress(30)

      const generatedTextures = generateMercuryTextures()
      setTextures(generatedTextures)

      setLoadingProgress(100)
      setTimeout(() => setIsLoading(false), 500)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [setIsLoading, setLoadingProgress])

  // Create shader material
  const mercuryMaterial = useMemo(() => {
    if (!textures) return null

    return new ShaderMaterial({
      vertexShader: mercuryVertexShader,
      fragmentShader: mercuryFragmentShader,
      uniforms: {
        colorMap: { value: textures.colorMap },
        normalMap: { value: textures.normalMap },
        roughnessMap: { value: textures.roughnessMap },
        displacementMap: { value: textures.displacementMap },
        displacementScale: { value: 0.02 },
        sunDirection: { value: [1, 0.3, 0.5] },
        ambientIntensity: { value: 0.08 },
        surfaceDetail: { value: surfaceDetail },
      },
    })
  }, [textures, surfaceDetail])

  // Atmosphere material
  const atmosphereMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        glowColor: { value: new Color(0.8, 0.7, 0.6) },
        intensity: { value: 0.15 },
        sunDirection: { value: [1, 0.3, 0.5] },
      },
      transparent: true,
      blending: AdditiveBlending,
      side: 1, // BackSide
      depthWrite: false,
    })
  }, [])

  // Animation
  useFrame((_, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * rotationSpeed * 0.1
    }
    if (atmosphereRef.current && autoRotate) {
      atmosphereRef.current.rotation.y += delta * rotationSpeed * 0.1
    }

    // Update surface detail uniform
    if (materialRef.current) {
      materialRef.current.uniforms.surfaceDetail.value = surfaceDetail
    }
  })

  if (!textures || !mercuryMaterial) {
    return null
  }

  return (
    <group>
      {/* Main Mercury sphere */}
      <mesh ref={meshRef} material={mercuryMaterial}>
        <sphereGeometry args={[1, 256, 256]} />
      </mesh>

      {/* Atmospheric glow */}
      {showAtmosphere && (
        <mesh ref={atmosphereRef} material={atmosphereMaterial}>
          <sphereGeometry args={[1.02, 64, 64]} />
        </mesh>
      )}
    </group>
  )
}
