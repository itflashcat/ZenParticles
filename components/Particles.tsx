import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateParticles } from '../utils/geometry';
import { PARTICLE_COUNT } from '../constants';

interface ParticlesProps {
  shape: ShapeType;
  tension: number;
  color: string;
}

const Particles: React.FC<ParticlesProps> = ({ shape, tension, color }) => {
  const mesh = useRef<THREE.Points>(null);
  
  // Memoize target positions for the selected shape
  const targetPositions = useMemo(() => {
    return generateParticles(PARTICLE_COUNT, shape);
  }, [shape]);

  // Store current positions to interpolate from
  const currentPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Initialize positions on first load
  useEffect(() => {
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      // Initialize with random positions first time
      for(let i=0; i<positions.length; i++) {
        currentPositions.current[i] = (Math.random() - 0.5) * 10; 
      }
    }
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const lerpSpeed = 3 * delta; // Speed of morphing
    
    // Tension mapping:
    // Low tension (0) -> Particles form the shape clearly, maybe slightly expanded breathing
    // High tension (1) -> Particles compress/contract tightly or explode?
    // Let's do: Tension = Compression/Power accumulation.
    // 0 = Normal Shape.
    // 1 = Compressed to center (energy ball).
    
    // Actually prompt says "Expansion... by detecting tension".
    // Let's assume: Tension (Fists) -> Compress/Power up. Relax -> Expand/Release.
    // But user might expect "Closing hand = Smaller", "Opening hand = Bigger".
    // We'll scale the target position by a factor derived from tension.
    
    // Scale factor: 1.0 (normal) to 0.2 (compressed)
    const scale = 1.0 - (tension * 0.8); 
    
    // Add some noise based on tension (jitter)
    const noise = tension * 0.1;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      const tx = targetPositions[i3] * scale;
      const ty = targetPositions[i3 + 1] * scale;
      const tz = targetPositions[i3 + 2] * scale;

      // Jitter
      const jx = (Math.random() - 0.5) * noise;
      const jy = (Math.random() - 0.5) * noise;
      const jz = (Math.random() - 0.5) * noise;

      // Interpolate current to target
      positions[i3] += (tx + jx - positions[i3]) * lerpSpeed;
      positions[i3 + 1] += (ty + jy - positions[i3 + 1]) * lerpSpeed;
      positions[i3 + 2] += (tz + jz - positions[i3 + 2]) * lerpSpeed;
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the whole system slowly
    mesh.current.rotation.y += 0.1 * delta;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={new Float32Array(PARTICLE_COUNT * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Particles;
