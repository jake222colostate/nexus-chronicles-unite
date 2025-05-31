
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
    const baseX = sideMultiplier * 45; // Increased distance from path
    
    // Generate 3-4 connected mountain peaks per chunk for better coverage
    const peakCount = 3 + Math.floor(seededRandom(seed + (side === 'left' ? 100 : 200)) * 2);
    
    for (let i = 0; i < peakCount; i++) {
      const peakSeed = seed + i * 67 + (side === 'left' ? 1000 : 2000);
      
      // Position along the chunk with overlap for seamless connection
      const z = worldZ - (i * (chunkSize / (peakCount - 1))) - seededRandom(peakSeed) * 8;
      const x = baseX + (seededRandom(peakSeed + 1) - 0.5) * 20;
      
      // More varied height for organic look
      const baseHeight = 20 + seededRandom(peakSeed + 2) * 25;
      const width = 10 + seededRandom(peakSeed + 3) * 8;
      const depth = 8 + seededRandom(peakSeed + 4) * 6;
      
      // Main mountain peak with more organic shape
      mountains.push(
        <mesh key={`peak_${side}_${chunk.id}_${i}`} position={[x, baseHeight / 2, z]} castShadow receiveShadow>
          <coneGeometry args={[width, baseHeight, 12]} />
          <meshLambertMaterial color="#4A5568" />
        </mesh>
      );
      
      // Multiple base layers for more natural blending
      mountains.push(
        <mesh key={`base1_${side}_${chunk.id}_${i}`} position={[x, 3, z]} receiveShadow>
          <cylinderGeometry args={[width * 0.9, width * 1.4, 6, 12]} />
          <meshLambertMaterial color="#2D3748" />
        </mesh>
      );
      
      mountains.push(
        <mesh key={`base2_${side}_${chunk.id}_${i}`} position={[x, 0.5, z]} receiveShadow>
          <cylinderGeometry args={[width * 1.2, width * 1.8, 1, 8]} />
          <meshLambertMaterial color="#1A202C" />
        </mesh>
      );
      
      // Enhanced connecting ridges for seamless appearance
      if (i < peakCount - 1) {
        const nextZ = worldZ - ((i + 1) * (chunkSize / (peakCount - 1)));
        const ridgeZ = (z + nextZ) / 2;
        const ridgeHeight = baseHeight * 0.7;
        const ridgeWidth = width * 0.8;
        
        mountains.push(
          <mesh key={`ridge_${side}_${chunk.id}_${i}`} position={[x, ridgeHeight / 2, ridgeZ]} receiveShadow>
            <boxGeometry args={[ridgeWidth, ridgeHeight, Math.abs(nextZ - z) + 5]} />
            <meshLambertMaterial color="#4A5568" />
          </mesh>
        );
        
        // Additional ridge blending
        mountains.push(
          <mesh key={`ridge_base_${side}_${chunk.id}_${i}`} position={[x, 2, ridgeZ]} receiveShadow>
            <boxGeometry args={[ridgeWidth * 1.2, 4, Math.abs(nextZ - z) + 8]} />
            <meshLambertMaterial color="#2D3748" />
          </mesh>
        );
      }
      
      // Add some scattered rocks for detail
      for (let j = 0; j < 3; j++) {
        const rockSeed = peakSeed + j * 31;
        const rockX = x + (seededRandom(rockSeed) - 0.5) * width * 2;
        const rockZ = z + (seededRandom(rockSeed + 1) - 0.5) * depth * 2;
        const rockSize = 1 + seededRandom(rockSeed + 2) * 2;
        
        mountains.push(
          <mesh key={`rock_${side}_${chunk.id}_${i}_${j}`} position={[rockX, rockSize / 2, rockZ]} receiveShadow>
            <boxGeometry args={[rockSize, rockSize, rockSize]} />
            <meshLambertMaterial color="#5A6575" />
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
