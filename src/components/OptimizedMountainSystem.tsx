
import React, { useMemo } from 'react';
import { ChunkData } from './OptimizedChunkSystem';

interface OptimizedMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const OptimizedMountainSystem: React.FC<OptimizedMountainSystemProps> = ({
  chunks,
  chunkSize
}) => {
  const mountainMeshes = useMemo(() => {
    return chunks.map(chunk => {
      const { worldZ, seed } = chunk;
      const mountains = [];
      
      // Generate fewer, more efficient mountain peaks
      const peakCount = 2;
      
      for (let side of ['left', 'right'] as const) {
        const sideMultiplier = side === 'left' ? -1 : 1;
        const baseX = sideMultiplier * 35;
        
        for (let i = 0; i < peakCount; i++) {
          const peakSeed = seed + i * 67 + (side === 'left' ? 1000 : 2000);
          const z = worldZ - (i * (chunkSize / peakCount));
          const x = baseX + (seededRandom(peakSeed + 1) - 0.5) * 15;
          const height = 15 + seededRandom(peakSeed + 2) * 20;
          const width = 8 + seededRandom(peakSeed + 3) * 6;
          
          mountains.push(
            <group key={`peak_${side}_${chunk.id}_${i}`} position={[x, height / 2, z]}>
              <mesh castShadow receiveShadow>
                <coneGeometry args={[width, height, 8]} />
                <meshLambertMaterial color="#4A5568" />
              </mesh>
              <mesh position={[0, -height/4, 0]} receiveShadow>
                <cylinderGeometry args={[width * 0.8, width * 1.2, height/2, 8]} />
                <meshLambertMaterial color="#2D3748" />
              </mesh>
            </group>
          );
        }
      }
      
      return mountains;
    });
  }, [chunks, chunkSize]);

  return <group>{mountainMeshes}</group>;
};
