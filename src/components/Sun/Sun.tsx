/**
 * Enhanced Sun Component with Corona and Solar Activity Visualization
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';

export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { solarActivity } = useSimulationStore();

  // Sun texture and material
  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        activityLevel: { value: 0.5 },
        color1: { value: new THREE.Color('#FDB813') },
        color2: { value: new THREE.Color('#FF6B1A') },
        color3: { value: new THREE.Color('#FF3300') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float activityLevel;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          // Animated surface turbulence
          float noise1 = snoise(vUv * 3.0 + time * 0.2);
          float noise2 = snoise(vUv * 6.0 - time * 0.15);
          float noise3 = snoise(vUv * 12.0 + time * 0.3);

          float turbulence = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * activityLevel;

          // Solar granulation
          float granulation = snoise(vUv * 50.0 + time * 0.05) * 0.1;

          // Color mixing based on turbulence
          vec3 color = mix(color1, color2, turbulence * 0.5 + 0.5);
          color = mix(color, color3, max(0.0, turbulence + granulation));

          // Edge darkening (limb darkening)
          float edge = dot(vNormal, vec3(0.0, 0.0, 1.0));
          edge = pow(max(0.0, edge), 0.6);

          color *= (0.7 + 0.3 * edge);

          // Bright spots (solar flares)
          float flare = step(0.95, noise1 + noise2 * 0.5) * activityLevel;
          color += vec3(1.0, 0.9, 0.6) * flare * 2.0;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  // Corona material
  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        activityLevel: { value: 0.5 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float activityLevel;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);

          // Animated corona
          float pulse = sin(time * 0.5) * 0.3 + 0.7;

          vec3 coronaColor = vec3(1.0, 0.6, 0.2) * fresnel * pulse * activityLevel;

          float alpha = fresnel * 0.6 * pulse;

          gl_FragColor = vec4(coronaColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
  }, []);

  // Glow material
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color('#FFA500') },
      },
      vertexShader: `
        varying vec3 vNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float time;

        varying vec3 vNormal;

        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          float pulse = sin(time * 0.3) * 0.2 + 0.8;

          gl_FragColor = vec4(glowColor * intensity * pulse, intensity * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.05;
      (sunRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
      (sunRef.current.material as THREE.ShaderMaterial).uniforms.activityLevel.value =
        0.3 + solarActivity * 0.7;
    }

    if (coronaRef.current) {
      (coronaRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
      (coronaRef.current.material as THREE.ShaderMaterial).uniforms.activityLevel.value =
        0.5 + solarActivity * 0.5;
    }

    if (glowRef.current) {
      (glowRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
    }
  });

  return (
    <group position={[-50, 0, 0]}>
      {/* Sun core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[5, 128, 128]} />
        <primitive object={sunMaterial} attach="material" />
      </mesh>

      {/* Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[5.5, 64, 64]} />
        <primitive object={coronaMaterial} attach="material" />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[6.2, 64, 64]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>

      {/* Point light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={5000}
        color="#FDB813"
        decay={2}
        distance={200}
      />
    </group>
  );
}
