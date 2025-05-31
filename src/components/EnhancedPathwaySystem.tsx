
import React from 'react';
import { ChunkData } from './ChunkSystem';

interface EnhancedPathwaySystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

// Simple seeded random for consistent tile placement
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const EnhancedPathwaySystem: React.FC<EnhancedPathwaySystemProps> = ({
  chunks,
  chunkSize
}) => {
  const generatePathTiles = (chunk: ChunkData) => {
    const tiles = [];
    const { worldX, worldZ, seed } = chunk;
    
    // Generate clean cobblestone tiles along the path
    const tilesPerChunk = Math.floor(chunkSize / 4); // One tile every 4 units
    
    for (let i = 0; i < tilesPerChunk; i++) {
      const tileSeed = seed + i * 17;
      const z = worldZ - (i * 4);
      
      // Add slight randomness to tile positioning
      const xOffset = (seededRandom(tileSeed) - 0.5) * 0.6;
      const rotation = seededRandom(tileSeed + 1) * Math.PI / 12; // Slight rotation
      const scale = 0.95 + seededRandom(tileSeed + 2) * 0.1;
      
      tiles.push(
        <group key={`tile_${chunk.id}_${i}`} position={[xOffset, -0.45, z]} rotation={[0, rotation, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[3 * scale, 0.15, 3 * scale]} />
            <meshLambertMaterial color="#8B7355" />
          </mesh>
        </group>
      );
    }
    
    return tiles;
  };

  return (
    <group>
      {/* Main stone path base - wider and more visible */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -1000]} receiveShadow>
        <planeGeometry args={[10, 4000]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      
      {/* Clean cobblestone tiles */}
      {chunks.map(chunk => (
        <group key={`path_${chunk.id}`}>
          {generatePathTiles(chunk)}
        </group>
      ))}
    </group>
  );
};
