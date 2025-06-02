
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
}> = ({ position, seed }) => {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (particleRef.current) {
      // Move upward and float
      particleRef.current.position.y += delta * 0.1;
      particleRef.current.position.x += Math.sin(state.clock.elapsedTime + seed) * delta * 0.02;
      particleRef.current.position.z += Math.cos(state.clock.elapsedTime + seed) * delta * 0.02;
      
      // Reset when too high
      if (particleRef.current.position.y > 20) {
        particleRef.current.position.y = position[1];
      }
      
      // Opacity animation
      const time = state.clock.elapsedTime + seed;
      particleRef.current.material.opacity = 0.3 + Math.sin(time) * 0.2;
    }
  });

  return (
    <mesh ref={particleRef} position={position}>
      <sphereGeometry args={[0.05, 8, 6]} />
      <meshBasicMaterial 
        color="#9c27b0"
        transparent
        opacity={0.5}
      />
    </mesh>
  );
};

const AmbientLight: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
}> = ({ position, seed }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.elapsedTime + seed;
      lightRef.current.intensity = 0.15 + Math.sin(time * 0.5) * 0.05;
    }
  });

  return (
    <pointLight 
      ref={lightRef}
      position={position}
      color="#ffffff"
      intensity={0.2}
      distance={25}
    />
  );
};

export const FantasyAtmosphereSystem: React.FC<FantasyAtmosphereSystemProps> = ({
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
      
      // Generate floating particles
      const particleCount = 8 + Math.floor(seededRandom(seed + 400) * 12);
      
      for (let i = 0; i < particleCount; i++) {
        const particleSeed = seed + i * 97 + 4000;
        const x = worldX + (seededRandom(particleSeed) - 0.5) * chunkSize;
        const z = worldZ + (seededRandom(particleSeed + 1) - 0.5) * chunkSize;
        const y = 1 + seededRandom(particleSeed + 2) * 8;
        
        particles.push({
          position: [x, y, z] as [number, number, number],
          seed: particleSeed,
          chunkId: chunk.id,
          index: i
        });
      }
      
      // Generate ambient lights every 20 units in Z
      if (worldZ % 20 < chunkSize) {
        const lightZ = Math.floor(worldZ / 20) * 20;
        const lightSeed = seed + 5000;
        
        lights.push({
          position: [
            worldX + (seededRandom(lightSeed) - 0.5) * 15,
            3 + seededRandom(lightSeed + 1) * 5,
            lightZ
          ] as [number, number, number],
          seed: lightSeed,
          chunkId: chunk.id
        });
      }
      
      // Generate fog volumes
      const fogCount = 2 + Math.floor(seededRandom(seed + 500) * 3);
      
      for (let i = 0; i < fogCount; i++) {
        const fogSeed = seed + i * 113 + 5000;
        const x = worldX + (seededRandom(fogSeed) - 0.5) * chunkSize;
        const z = worldZ + (seededRandom(fogSeed + 1) - 0.5) * chunkSize;
        const y = 1 + seededRandom(fogSeed + 2) * 3;
        const scale = 8 + seededRandom(fogSeed + 3) * 15;
        
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
      {/* Floating particles */}
      {atmosphereElements.particles.map((particle) => (
        <FloatingParticle
          key={`particle_${particle.chunkId}_${particle.index}`}
          position={particle.position}
          seed={particle.seed}
        />
      ))}
      
      {/* Ambient lights */}
      {atmosphereElements.lights.map((light, index) => (
        <AmbientLight
          key={`light_${light.chunkId}_${index}`}
          position={light.position}
          seed={light.seed}
        />
      ))}
      
      {/* Fog volumes */}
      {atmosphereElements.fogVolumes.map((fog) => (
        <mesh
          key={`fog_${fog.chunkId}_${fog.index}`}
          position={fog.position}
          scale={[fog.scale, 3, fog.scale]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial 
            color="#45297f"
            transparent
            opacity={0.06}
          />
        </mesh>
      ))}
      
      {/* Global fog effect */}
      <fog attach="fog" args={['#45297f', 30, 100]} />
    </group>
  );
};
