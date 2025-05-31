
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';

interface ResourceParticlesProps {
  realm: 'fantasy' | 'scifi';
  manaPerSecond: number;
  energyPerSecond: number;
}

export const ResourceParticles: React.FC<ResourceParticlesProps> = ({
  realm,
  manaPerSecond,
  energyPerSecond
}) => {
  const pointsRef = useRef<Points>(null);

  const productionRate = realm === 'fantasy' ? manaPerSecond : energyPerSecond;
  const particleCount = Math.min(Math.max(productionRate * 2, 20), 100);

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 2;
      const theta = (i / particleCount) * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi) - 2;
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, [particleCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.005;
      
      // Update particle positions for orbital movement
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const time = state.clock.elapsedTime;
        const radius = 3 + Math.sin(time + i) * 0.5;
        const theta = (i / particleCount) * Math.PI * 2 + time * 0.5;
        const phi = Math.sin(time * 0.3 + i) * 0.5 + Math.PI / 2;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.cos(phi) - 2 + Math.sin(time + i) * 0.2;
        positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={realm === 'fantasy' ? '#a855f7' : '#22d3ee'}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};
