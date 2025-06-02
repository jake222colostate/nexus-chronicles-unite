
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyDuskSkybox } from './FantasyDuskSkybox';
import { BoundaryMountainSystem } from './BoundaryMountainSystem';
import { CleanPathSystem } from './CleanPathSystem';
import { ImprovedFantasyLighting } from './ImprovedFantasyLighting';
import * as THREE from 'three';

interface FantasyReferenceEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: THREE.Vector3;
}

export const FantasyReferenceEnvironment: React.FC<FantasyReferenceEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new THREE.Vector3(0, 0, 0)
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Heavily optimized decorative elements for 60fps
  const decorativeElements = useMemo(() => {
    const elements = [];
    
    // Process only the closest chunks for performance
    const nearbyChunks = chunks.slice(0, 2);
    
    nearbyChunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Drastically reduced tree count for performance
      const treeCount = Math.floor(Math.sin(seed) * 1) + 1;
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (18 + Math.abs(Math.sin(treeSeed) * 8));
        const z = worldZ - (i * 40) - Math.abs(Math.sin(treeSeed + 1) * 20);
        const scale = 0.6 + Math.abs(Math.sin(treeSeed + 2) * 0.3);
        
        elements.push(
          <group key={`tree_${chunk.id}_${i}`} position={[x, -1, z]} scale={[scale, scale, scale]}>
            {/* Ultra-simplified tree for performance */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.3, 2.5, 4]} />
              <meshLambertMaterial color="#4a2c2a" />
            </mesh>
            <mesh position={[0, 3.5, 0]} castShadow>
              <sphereGeometry args={[1.8, 6, 4]} />
              <meshLambertMaterial color="#4CAF50" />
            </mesh>
          </group>
        );
      }
      
      // Minimal floating crystals for performance
      const crystalCount = 1 + Math.floor(Math.abs(Math.sin(seed + 100)) * 1);
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 73 + 1000;
        const x = (Math.sin(crystalSeed) * 0.4) * 16;
        const y = 6 + Math.abs(Math.sin(crystalSeed + 1)) * 8;
        const z = worldZ - (i * 30) - Math.abs(Math.sin(crystalSeed + 2) * 12);
        const scale = 0.25 + Math.abs(Math.sin(crystalSeed + 3)) * 0.4;
        
        elements.push(
          <group key={`crystal_${chunk.id}_${i}`} position={[x, y, z]}>
            <mesh>
              <octahedronGeometry args={[scale, 0]} />
              <meshStandardMaterial 
                color="#00FFFF"
                emissive="#00CCCC"
                emissiveIntensity={0.6}
                transparent
                opacity={0.7}
              />
            </mesh>
            <pointLight 
              position={[0, 0, 0]}
              color="#00FFFF"
              intensity={0.2}
              distance={8}
            />
          </group>
        );
      }
    });
    
    return elements;
  }, [chunks]);

  // Simplified ground plane with larger size
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -100]} receiveShadow>
        <planeGeometry args={[200, 600]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
    );
  }, []);

  return (
    <group>
      {/* Magical dusk skybox */}
      <FantasyDuskSkybox />
      
      {/* Ground plane */}
      {groundPlane}
      
      {/* Clean, unobstructed path system */}
      <CleanPathSystem chunks={chunks} chunkSize={chunkSize} realm={realm} />
      
      {/* Optimized boundary mountains with collision */}
      <BoundaryMountainSystem chunks={chunks} chunkSize={chunkSize} realm={realm} />
      
      {/* Lightweight lighting system */}
      <ImprovedFantasyLighting />
      
      {/* Minimal decorative elements for 60fps */}
      {decorativeElements}
    </group>
  );
};
