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
    
    // Generate evenly spaced cobblestone tiles
    const tilesPerChunk = Math.floor(chunkSize / 6); // One tile every 6 units for better spacing
    
    for (let i = 0; i < tilesPerChunk; i++) {
      const tileSeed = seed + i * 23;
      const z = worldZ - (i * 6) - 3; // Evenly spaced with offset
      
      // Minimal randomness for natural look while keeping alignment
      const xOffset = (seededRandom(tileSeed) - 0.5) * 0.8;
      const rotation = seededRandom(tileSeed + 1) * Math.PI / 16;
      const scale = 0.95 + seededRandom(tileSeed + 2) * 0.1;
      
      // Main cobblestone tile
      tiles.push(
        <group key={`tile_${chunk.id}_${i}`} position={[xOffset, -0.48, z]} rotation={[0, rotation, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[4 * scale, 0.2, 4 * scale]} />
            <meshLambertMaterial color="#8B7355" />
          </mesh>
          {/* Small detail stones around main tile */}
          <mesh position={[1.5 * scale, 0.05, 1.5 * scale]} receiveShadow>
            <boxGeometry args={[0.8, 0.1, 0.8]} />
            <meshLambertMaterial color="#6B5B55" />
          </mesh>
          <mesh position={[-1.3 * scale, 0.05, -1.3 * scale]} receiveShadow>
            <boxGeometry args={[0.9, 0.1, 0.9]} />
            <meshLambertMaterial color="#7B6355" />
          </mesh>
        </group>
      );
    }
    
    return tiles;
  };

  return (
    <group>
      {/* Main stone path base - perfectly centered and wider */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, -1000]} receiveShadow>
        <planeGeometry args={[12, 4000]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      
      {/* Enhanced cobblestone tiles with better alignment */}
      {chunks.map(chunk => (
        <group key={`path_${chunk.id}`}>
          {generatePathTiles(chunk)}
        </group>
      ))}
    </group>
  );
};
