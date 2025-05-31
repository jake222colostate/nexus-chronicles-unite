
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface TreeFreeNaturalMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  excludeTrees?: boolean;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const TreeFreeNaturalMountainSystem: React.FC<TreeFreeNaturalMountainSystemProps> = ({
  chunks,
  chunkSize,
  excludeTrees = false
}) => {
  const mountainElements = useMemo(() => {
    const elements = [];
    
    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate rock formations and terrain features (no trees)
      const rockCount = 3 + Math.floor(seededRandom(seed + 300) * 4);
      
      for (let i = 0; i < rockCount; i++) {
        const rockSeed = seed + i * 89 + 3000;
        const x = worldX + (seededRandom(rockSeed) - 0.5) * chunkSize * 0.8;
        const z = worldZ + (seededRandom(rockSeed + 1) - 0.5) * chunkSize * 0.8;
        const y = seededRandom(rockSeed + 2) * 1.5;
        
        const scale = 0.8 + seededRandom(rockSeed + 3) * 1.2;
        const rotationY = seededRandom(rockSeed + 4) * Math.PI * 2;
        
        elements.push(
          <mesh
            key={`rock_${chunk.id}_${i}`}
            position={[x, y, z]}
            rotation={[0, rotationY, 0]}
            scale={[scale, scale * 0.6, scale]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#8B7355" roughness={0.9} metalness={0.1} />
          </mesh>
        );
      }
      
      // Generate mountain terrain without any tree-like objects
      const terrainCount = 2 + Math.floor(seededRandom(seed + 400) * 3);
      
      for (let i = 0; i < terrainCount; i++) {
        const terrainSeed = seed + i * 91 + 4000;
        const x = worldX + (seededRandom(terrainSeed) - 0.5) * chunkSize;
        const z = worldZ + (seededRandom(terrainSeed + 1) - 0.5) * chunkSize;
        const y = seededRandom(terrainSeed + 2) * 2;
        
        const scaleX = 2 + seededRandom(terrainSeed + 3) * 3;
        const scaleY = 1 + seededRandom(terrainSeed + 4) * 2;
        const scaleZ = 2 + seededRandom(terrainSeed + 5) * 3;
        
        elements.push(
          <mesh
            key={`terrain_${chunk.id}_${i}`}
            position={[x, y, z]}
            scale={[scaleX, scaleY, scaleZ]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[1, 2, 8]} />
            <meshStandardMaterial color="#A0522D" roughness={0.8} metalness={0.2} />
          </mesh>
        );
      }
    });
    
    return elements;
  }, [chunks, chunkSize, excludeTrees]);

  return <group>{mountainElements}</group>;
};
