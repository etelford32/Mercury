/**
 * Mercury Magnetosphere Visualization
 * Shows magnetic field lines and magnetosphere compression
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';

export function Magnetosphere() {
  const magnetosphereRef = useRef<THREE.Group>(null);
  const { solarWindPressure, showMagnetosphere } = useSimulationStore();

  // Field lines
  const fieldLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];

    // Generate dipole field lines
    for (let i = 0; i < 12; i++) {
      const phi = (i / 12) * Math.PI * 2;
      const line: THREE.Vector3[] = [];

      for (let t = -Math.PI / 2; t <= Math.PI / 2; t += 0.1) {
        const r = 3 * Math.cos(t) * Math.cos(t);
        const theta = t;

        const x = r * Math.sin(theta);
        const y = r * Math.cos(phi) * Math.cos(theta);
        const z = r * Math.sin(phi) * Math.cos(theta);

        line.push(new THREE.Vector3(x, y, z));
      }

      lines.push(line);
    }

    return lines;
  }, []);

  // Magnetopause boundary
  const magnetopauseMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        compression: { value: 1.0 },
        color: { value: new THREE.Color('#00AAFF') },
      },
      vertexShader: `
        uniform float time;
        uniform float compression;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;

          // Compress on sunward side
          vec3 pos = position;
          float sunwardFactor = smoothstep(-1.0, 1.0, position.x);
          pos.x *= (0.7 + 0.3 * compression) - sunwardFactor * (1.0 - compression) * 0.3;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 1.5);

          float pulse = sin(time * 2.0) * 0.2 + 0.8;

          vec3 finalColor = color * fresnel * pulse;
          float alpha = fresnel * 0.4;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Bow shock
  const bowShockMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        compression: { value: 1.0 },
      },
      vertexShader: `
        uniform float compression;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;

          vec3 pos = position;
          float sunwardFactor = smoothstep(-1.0, 1.0, position.x);
          pos.x *= (0.6 + 0.4 * compression) - sunwardFactor * (1.0 - compression) * 0.4;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * 1.5, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);

          float wave = sin(vPosition.x * 3.0 + time * 5.0) * 0.3 + 0.7;

          vec3 color = vec3(1.0, 0.5, 0.2) * fresnel * wave;
          float alpha = fresnel * 0.3 * wave;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (!showMagnetosphere) return;

    const time = state.clock.getElapsedTime();

    // Compression based on solar wind pressure
    const compressionFactor = Math.max(0.5, Math.min(1.2, 2.0 / solarWindPressure));

    if (magnetosphereRef.current) {
      (magnetosphereRef.current.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;
      ((magnetosphereRef.current.children[0] as THREE.Mesh).material as THREE.ShaderMaterial).uniforms.time.value = time;
      ((magnetosphereRef.current.children[0] as THREE.Mesh).material as THREE.ShaderMaterial).uniforms.compression.value = compressionFactor;

      ((magnetosphereRef.current.children[1] as THREE.Mesh).material as THREE.ShaderMaterial).uniforms.time.value = time;
      ((magnetosphereRef.current.children[1] as THREE.Mesh).material as THREE.ShaderMaterial).uniforms.compression.value = compressionFactor;
    }
  });

  if (!showMagnetosphere) return null;

  return (
    <group ref={magnetosphereRef}>
      {/* Magnetopause */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <primitive object={magnetopauseMaterial} attach="material" />
      </mesh>

      {/* Bow shock */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <primitive object={bowShockMaterial} attach="material" />
      </mesh>

      {/* Magnetic field lines */}
      {fieldLines.map((line, idx) => {
        const points = line.flatMap(v => [v.x, v.y, v.z]);
        return (
          <line key={idx}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={line.length}
                array={new Float32Array(points)}
                itemSize={3}
                args={[new Float32Array(points), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#4444FF"
              opacity={0.3}
              transparent
            />
          </line>
        );
      })}

      {/* Magnetotail */}
      <mesh position={[-5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 1.5, 10, 16, 1, true]} />
        <meshBasicMaterial
          color="#0066FF"
          opacity={0.2}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
