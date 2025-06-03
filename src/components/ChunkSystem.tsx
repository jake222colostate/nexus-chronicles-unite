
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
    const playerChunkX = Math.floor(playerPosition.x / chunkSize);
    const playerChunkZ = Math.floor(Math.abs(playerPosition.z) / chunkSize);
    
    // Much smaller chunk radius for 60fps performance
    const maxRenderDistance = Math.min(renderDistance, 200); // Cap render distance
    const chunkRadius = Math.ceil(maxRenderDistance / chunkSize);
    const farAheadChunks = Math.ceil(maxRenderDistance / chunkSize);
    
    // Limit total chunks for performance
    let chunkCount = 0;
    const maxChunks = 80; // Hard limit for 60fps
    
    // Generate chunks in a smaller pattern for performance
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius + farAheadChunks && chunkCount < maxChunks; z++) {
        if (z >= -Math.ceil(maxRenderDistance / chunkSize)) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          // More aggressive distance-based culling
          const distanceToPlayer = Math.sqrt(
            Math.pow(worldX - playerPosition.x, 2) + 
            Math.pow(worldZ - playerPosition.z, 2)
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
    
    console.log(`ChunkSystem: Generated ${chunks.length} chunks (max: ${maxChunks}) with render distance ${maxRenderDistance}`);
    
    return chunks;
  }, [
    Math.floor(playerPosition.x / chunkSize), 
    Math.floor(Math.abs(playerPosition.z) / chunkSize), 
    chunkSize, 
    Math.min(renderDistance, 200) // Cap for performance
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
