
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyMagicalTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const MagicalTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  seed: number;
}> = React.memo(({ position, scale, seed }) => {
  const treeRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (treeRef.current) {
      const time = state.clock.elapsedTime * 0.3 + seed;
      treeRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
      treeRef.current.rotation.z = Math.cos(time * 0.3) * 0.015;
    }
    
    if (glowRef.current) {
      const time = state.clock.elapsedTime * 0.5 + seed;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(time * 1.5) * 0.08;
    }
  });

  // Reduced canopy complexity
  const canopyCount = 2 + Math.floor(seededRandom(seed) * 2);

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.18, 1.5]} />
        <meshLambertMaterial color="#5c3d2e" />
      </mesh>
      
      {/* Simplified canopy layers */}
      {Array.from({ length: canopyCount }, (_, i) => {
        const layerY = 1.2 + i * 0.3;
        const layerScale = 1.2 - i * 0.1;
        const layerSeed = seed + i * 47;
        
        return (
          <mesh
            key={i}
            position={[
              (seededRandom(layerSeed) - 0.5) * 0.2,
              layerY,
              (seededRandom(layerSeed + 1) - 0.5) * 0.2
            ]} 
            castShadow 
            receiveShadow
            scale={[layerScale, layerScale, layerScale]}
          >
            <icosahedronGeometry args={[0.7, 1]} />
            <meshLambertMaterial color="#2e7d32" />
          </mesh>
        );
      })}
      
      {/* Optimized magical glow */}
      <mesh 
        ref={glowRef}
        position={[0, 1.6, 0]} 
        scale={[1.2, 1.2, 1.2]}
      >
        <sphereGeometry args={[1.0]} />
        <meshBasicMaterial 
          color="#64ffda" 
          transparent 
          opacity={0.2}
        />
      </mesh>
      
      {/* Reduced intensity point light */}
      <pointLight 
        color="#64ffda" 
        intensity={0.2} 
        distance={6}
        position={[0, 1.8, 0]}
      />
    </group>
  );
});

MagicalTree.displayName = 'MagicalTree';

export const FantasyMagicalTreeSystem: React.FC<FantasyMagicalTreeSystemProps> = React.memo(({
  chunks,
  chunkSize,
  realm
}) => {
  // DISABLED FOR PERFORMANCE - Trees removed
  console.log('FantasyMagicalTreeSystem: Disabled for performance');
  return null;
});

FantasyMagicalTreeSystem.displayName = 'FantasyMagicalTreeSystem';
