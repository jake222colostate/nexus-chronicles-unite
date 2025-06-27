
import React, { useMemo } from 'react';
import { Vector3 } from 'three';

interface ChunkSystemProps {
  playerPosition: Vector3;
  chunkSize: number;
  renderDistance: number;
  children: (chunkData: ChunkData[]) => React.ReactNode;
}

export interface ChunkData {
  id: string;
  x: number;
  z: number;
  worldX: number;
  worldZ: number;
  seed: number;
}

export const ChunkSystem: React.FC<ChunkSystemProps> = React.memo(({
  playerPosition,
  chunkSize,
  renderDistance,
  children
}) => {
  const activeChunks = useMemo(() => {
    const chunks: ChunkData[] = [];
    
    // OPTIMIZED: Much more aggressive position rounding to prevent excessive updates
    const roundedPlayerX = Math.round(playerPosition.x / 10) * 10;
    const roundedPlayerZ = Math.round(Math.abs(playerPosition.z) / 10) * 10;
    
    const playerChunkX = Math.floor(roundedPlayerX / chunkSize);
    const playerChunkZ = Math.floor(roundedPlayerZ / chunkSize);
    
    // OPTIMIZED: Reduced render distance and chunk coverage for better performance
    const maxRenderDistance = Math.min(renderDistance, 120); // Reduced from 250
    const chunkRadius = Math.ceil(maxRenderDistance / chunkSize);
    const farAheadChunks = Math.ceil(maxRenderDistance / chunkSize);
    
    // OPTIMIZED: Much lower chunk limit to prevent performance issues
    let chunkCount = 0;
    const maxChunks = 50; // Reduced from 500
    
    // Generate chunks in a smaller pattern
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + farAheadChunks && chunkCount < maxChunks; z++) {
        if (z >= -Math.ceil(maxRenderDistance / chunkSize)) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          // OPTIMIZED: More aggressive distance-based culling
          const distanceToPlayer = Math.sqrt(
            Math.pow(worldX - roundedPlayerX, 2) + 
            Math.pow(worldZ - roundedPlayerZ, 2)
          );
          
          if (distanceToPlayer <= maxRenderDistance) {
            // Optimized deterministic seed
            const seed = ((x & 0xFFFF) << 16) | (z & 0xFFFF);
            
            chunks.push({
              id: `chunk_${x}_${z}`,
              x,
              z,
              worldX,
              worldZ,
              seed: Math.abs(seed) % 10000
            });
            
            chunkCount++;
          }
        }
      }
    }
    
    return chunks;
  }, [
    // OPTIMIZED: Much more aggressive recalculation frequency to prevent updates
    Math.floor(playerPosition.x / 20) * 20,
    Math.floor(Math.abs(playerPosition.z) / 20) * 20,
    chunkSize, 
    Math.min(renderDistance, 120)
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
