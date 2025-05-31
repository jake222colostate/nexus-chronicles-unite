
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
    
    // Generate cobblestone tiles along the path
    const tilesPerChunk = Math.floor(chunkSize / 3); // One tile every 3 units
    
    for (let i = 0; i < tilesPerChunk; i++) {
      const tileSeed = seed + i * 17;
      const z = worldZ - (i * 3);
      
      // Add slight randomness to tile positioning
      const xOffset = (seededRandom(tileSeed) - 0.5) * 0.8;
      const rotation = seededRandom(tileSeed + 1) * Math.PI / 8; // Slight rotation
      const scale = 0.9 + seededRandom(tileSeed + 2) * 0.2;
      
      tiles.push(
        <group key={`tile_${chunk.id}_${i}`} position={[xOffset, -0.45, z]} rotation={[0, rotation, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[2.5 * scale, 0.1, 2.5 * scale]} />
            <meshLambertMaterial color="#6B5B73" />
          </mesh>
          {/* Glowing moss edges */}
          <mesh position={[0, 0.06, 0]}>
            <ringGeometry args={[1.2 * scale, 1.4 * scale, 8]} />
            <meshBasicMaterial color="#4ADE80" transparent opacity={0.3} />
          </mesh>
        </group>
      );
    }
    
    return tiles;
  };

  return (
    <group>
      {/* Main stone path base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -1000]} receiveShadow>
        <planeGeometry args={[8, 4000]} />
        <meshLambertMaterial color="#5D4E75" />
      </mesh>
      
      {/* Individual cobblestone tiles */}
      {chunks.map(chunk => (
        <group key={`path_${chunk.id}`}>
          {generatePathTiles(chunk)}
        </group>
      ))}
      
      {/* Subtle glowing path particles */}
      {chunks.map(chunk => {
        const particles = [];
        const particleCount = 3;
        
        for (let i = 0; i < particleCount; i++) {
          const particleSeed = chunk.seed + i * 23;
          const x = (seededRandom(particleSeed) - 0.5) * 6;
          const z = chunk.worldZ - seededRandom(particleSeed + 1) * chunk.chunkSize;
          
          particles.push(
            <mesh key={`particle_${chunk.id}_${i}`} position={[x, 0.2, z]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#A78BFA" transparent opacity={0.6} />
            </mesh>
          );
        }
        
        return (
          <group key={`particles_${chunk.id}`}>
            {particles}
          </group>
        );
      })}
    </group>
  );
};
