
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyAtmosphereSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const FloatingParticle: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
}> = React.memo(({ position, seed }) => {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (particleRef.current) {
      // Optimized movement
      particleRef.current.position.y += delta * 0.08;
      particleRef.current.position.x += Math.sin(state.clock.elapsedTime * 0.5 + seed) * delta * 0.015;
      particleRef.current.position.z += Math.cos(state.clock.elapsedTime * 0.3 + seed) * delta * 0.015;
      
      // Reset when too high
      if (particleRef.current.position.y > 15) {
        particleRef.current.position.y = position[1];
      }
      
      // Reduced opacity animation frequency
      const time = state.clock.elapsedTime * 0.8 + seed;
      const material = particleRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.25 + Math.sin(time) * 0.15;
    }
  });

  return (
    <mesh ref={particleRef} position={position}>
      <sphereGeometry args={[0.04, 6, 4]} />
      <meshBasicMaterial 
        color="#9c27b0"
        transparent
        opacity={0.4}
      />
    </mesh>
  );
});

FloatingParticle.displayName = 'FloatingParticle';

const AmbientLight: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
}> = React.memo(({ position, seed }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.elapsedTime * 0.3 + seed;
      lightRef.current.intensity = 0.12 + Math.sin(time * 0.5) * 0.03;
    }
  });

  return (
    <pointLight 
      ref={lightRef}
      position={position}
      color="#ffffff"
      intensity={0.15}
      distance={20}
    />
  );
});

AmbientLight.displayName = 'AmbientLight';

export const FantasyAtmosphereSystem: React.FC<FantasyAtmosphereSystemProps> = React.memo(({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const atmosphereElements = useMemo(() => {
    const particles = [];
    const lights = [];
    const fogVolumes = [];
    
    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Reduced particle density for better performance
      const particleCount = 4 + Math.floor(seededRandom(seed + 400) * 6);
      
      for (let i = 0; i < particleCount; i++) {
        const particleSeed = seed + i * 97 + 4000;
        const x = worldX + (seededRandom(particleSeed) - 0.5) * chunkSize;
        const z = worldZ + (seededRandom(particleSeed + 1) - 0.5) * chunkSize;
        const y = 1 + seededRandom(particleSeed + 2) * 6;
        
        particles.push({
          position: [x, y, z] as [number, number, number],
          seed: particleSeed,
          chunkId: chunk.id,
          index: i
        });
      }
      
      // Reduced ambient light frequency
      if (worldZ % 30 < chunkSize) {
        const lightZ = Math.floor(worldZ / 30) * 30;
        const lightSeed = seed + 5000;
        
        lights.push({
          position: [
            worldX + (seededRandom(lightSeed) - 0.5) * 12,
            3 + seededRandom(lightSeed + 1) * 4,
            lightZ
          ] as [number, number, number],
          seed: lightSeed,
          chunkId: chunk.id
        });
      }
      
      // Fewer fog volumes
      const fogCount = 1 + Math.floor(seededRandom(seed + 500) * 2);
      
      for (let i = 0; i < fogCount; i++) {
        const fogSeed = seed + i * 113 + 5000;
        const x = worldX + (seededRandom(fogSeed) - 0.5) * chunkSize;
        const z = worldZ + (seededRandom(fogSeed + 1) - 0.5) * chunkSize;
        const y = 1 + seededRandom(fogSeed + 2) * 2;
        const scale = 6 + seededRandom(fogSeed + 3) * 10;
        
        fogVolumes.push({
          position: [x, y, z] as [number, number, number],
          scale,
          chunkId: chunk.id,
          index: i
        });
      }
    });
    
    return { particles, lights, fogVolumes };
  }, [chunks, chunkSize]);

  return (
    <group>
      {/* Reduced floating particles */}
      {atmosphereElements.particles.map((particle) => (
        <FloatingParticle
          key={`particle_${particle.chunkId}_${particle.index}`}
          position={particle.position}
          seed={particle.seed}
        />
      ))}
      
      {/* Optimized ambient lights */}
      {atmosphereElements.lights.map((light, index) => (
        <AmbientLight
          key={`light_${light.chunkId}_${index}`}
          position={light.position}
          seed={light.seed}
        />
      ))}
      
      {/* Simplified fog volumes */}
      {atmosphereElements.fogVolumes.map((fog) => (
        <mesh
          key={`fog_${fog.chunkId}_${fog.index}`}
          position={fog.position}
          scale={[fog.scale, 2, fog.scale]}
        >
          <sphereGeometry args={[1, 6, 4]} />
          <meshBasicMaterial 
            color="#45297f"
            transparent
            opacity={0.04}
          />
        </mesh>
      ))}
      
      {/* Optimized global fog */}
      <fog attach="fog" args={['#45297f', 25, 80]} />
    </group>
  );
});

FantasyAtmosphereSystem.displayName = 'FantasyAtmosphereSystem';
