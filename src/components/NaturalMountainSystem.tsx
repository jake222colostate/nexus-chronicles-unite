
import React from 'react';
import { ChunkData } from './ChunkSystem';

interface NaturalMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const NaturalMountainSystem: React.FC<NaturalMountainSystemProps> = ({
  chunks,
  chunkSize
}) => {
  const generateMountainRidge = (chunk: ChunkData, side: 'left' | 'right') => {
    const mountains = [];
    const { worldZ, seed } = chunk;
    const sideMultiplier = side === 'left' ? -1 : 1;
    const baseX = sideMultiplier * 40; // Distance from path
    
    // Generate 2-3 connected mountain peaks per chunk
    const peakCount = 2 + Math.floor(seededRandom(seed + (side === 'left' ? 100 : 200)) * 2);
    
    for (let i = 0; i < peakCount; i++) {
      const peakSeed = seed + i * 50 + (side === 'left' ? 1000 : 2000);
      
      // Position along the chunk
      const z = worldZ - (i * (chunkSize / peakCount)) - seededRandom(peakSeed) * 10;
      const x = baseX + (seededRandom(peakSeed + 1) - 0.5) * 15;
      
      // Height variation for natural ridgeline
      const baseHeight = 15 + seededRandom(peakSeed + 2) * 20;
      const width = 8 + seededRandom(peakSeed + 3) * 6;
      const depth = 6 + seededRandom(peakSeed + 4) * 4;
      
      // Mountain peak
      mountains.push(
        <mesh key={`peak_${side}_${chunk.id}_${i}`} position={[x, baseHeight / 2, z]} castShadow receiveShadow>
          <coneGeometry args={[width, baseHeight, 8]} />
          <meshLambertMaterial color="#4A5568" />
        </mesh>
      );
      
      // Mountain base for connection
      mountains.push(
        <mesh key={`base_${side}_${chunk.id}_${i}`} position={[x, 2, z]} receiveShadow>
          <cylinderGeometry args={[width * 0.8, width * 1.2, 4, 8]} />
          <meshLambertMaterial color="#2D3748" />
        </mesh>
      );
      
      // Connecting ridge to next mountain
      if (i < peakCount - 1) {
        const nextZ = worldZ - ((i + 1) * (chunkSize / peakCount));
        const ridgeZ = (z + nextZ) / 2;
        const ridgeHeight = baseHeight * 0.6;
        
        mountains.push(
          <mesh key={`ridge_${side}_${chunk.id}_${i}`} position={[x, ridgeHeight / 2, ridgeZ]} receiveShadow>
            <boxGeometry args={[width * 0.6, ridgeHeight, chunkSize / peakCount]} />
            <meshLambertMaterial color="#4A5568" />
          </mesh>
        );
      }
    }
    
    return mountains;
  };

  return (
    <group>
      {chunks.map(chunk => (
        <group key={`mountains_${chunk.id}`}>
          {/* Left side mountains */}
          {generateMountainRidge(chunk, 'left')}
          {/* Right side mountains */}
          {generateMountainRidge(chunk, 'right')}
        </group>
      ))}
    </group>
  );
};
