/**
 * Solar Wind Particle System
 * GPU-accelerated visualization of solar wind particles
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';

const PARTICLE_COUNT = 50000;

export function SolarWindParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { solarWindSpeed, showSolarWind } = useSimulationStore();

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Start particles near the sun
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 6 + Math.random() * 2;

      positions[i3] = -50 + radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Velocity pointing away from sun
      const speed = 0.01 + Math.random() * 0.02;
      const direction = new THREE.Vector3(
        positions[i3] + 50,
        positions[i3 + 1],
        positions[i3 + 2]
      ).normalize();

      velocities[i3] = direction.x * speed;
      velocities[i3 + 1] = direction.y * speed;
      velocities[i3 + 2] = direction.z * speed;

      // Color based on particle energy (yellow to red)
      const energy = Math.random();
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.6 + energy * 0.4;
      colors[i3 + 2] = energy * 0.3;
    }

    return { positions, velocities, colors };
  }, []);

  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointSize: { value: 2.0 },
      },
      vertexShader: `
        uniform float time;
        uniform float pointSize;

        attribute vec3 color;
        varying vec3 vColor;

        void main() {
          vColor = color;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Size attenuation
          gl_PointSize = pointSize * (300.0 / -mvPosition.z);

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Circular particles
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) discard;

          // Soft edges
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !showSolarWind) return;

    const time = state.clock.getElapsedTime();
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speedFactor = (solarWindSpeed / 400) * 0.5; // Normalize to typical solar wind speed

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Update positions
      posArray[i3] += velocities[i3] * speedFactor;
      posArray[i3 + 1] += velocities[i3 + 1] * speedFactor;
      posArray[i3 + 2] += velocities[i3 + 2] * speedFactor;

      // Reset particles that are too far
      const distance = Math.sqrt(
        Math.pow(posArray[i3] + 50, 2) +
        Math.pow(posArray[i3 + 1], 2) +
        Math.pow(posArray[i3 + 2], 2)
      );

      if (distance > 60 || posArray[i3] > 10) {
        // Respawn at sun
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 6 + Math.random() * 2;

        posArray[i3] = -50 + radius * Math.sin(phi) * Math.cos(theta);
        posArray[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i3 + 2] = radius * Math.cos(phi);

        // Update velocity
        const speed = 0.01 + Math.random() * 0.02;
        const direction = new THREE.Vector3(
          posArray[i3] + 50,
          posArray[i3 + 1],
          posArray[i3 + 2]
        ).normalize();

        velocities[i3] = direction.x * speed;
        velocities[i3 + 1] = direction.y * speed;
        velocities[i3 + 2] = direction.z * speed;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
  });

  if (!showSolarWind) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <primitive object={particleMaterial} attach="material" />
    </points>
  );
}
