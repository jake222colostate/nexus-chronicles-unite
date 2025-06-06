
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
    
    // Round player position to reduce chunk calculation frequency
    const roundedPlayerX = Math.round(playerPosition.x / 5) * 5;
    const roundedPlayerZ = Math.round(Math.abs(playerPosition.z) / 5) * 5;
    
    const playerChunkX = Math.floor(roundedPlayerX / chunkSize);
    const playerChunkZ = Math.floor(roundedPlayerZ / chunkSize);
    
    // Smaller chunk radius for better performance
    const maxRenderDistance = Math.min(renderDistance, 150); // Reduced from 200
    const chunkRadius = Math.ceil(maxRenderDistance / chunkSize);
    const farAheadChunks = Math.ceil(maxRenderDistance / chunkSize);
    
    // Hard limit for performance
    let chunkCount = 0;
    const maxChunks = 60; // Reduced from 80
    
    // Generate chunks in a smaller pattern for performance
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius + farAheadChunks && chunkCount < maxChunks; z++) {
        if (z >= -Math.ceil(maxRenderDistance / chunkSize)) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          // More aggressive distance-based culling
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
    // Use rounded values to reduce recalculation frequency
    Math.floor(playerPosition.x / 10) * 10, 
    Math.floor(Math.abs(playerPosition.z) / 10) * 10, 
    chunkSize, 
    Math.min(renderDistance, 150)
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
