
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
    
    // PERFORMANCE FIX: Much more aggressive position rounding to prevent constant recalculation
    const roundedPlayerX = Math.round(playerPosition.x / 25) * 25; // Increased from 2 to 25
    const roundedPlayerZ = Math.round(Math.abs(playerPosition.z) / 25) * 25; // Increased from 2 to 25
    
    const playerChunkX = Math.floor(roundedPlayerX / chunkSize);
    const playerChunkZ = Math.floor(roundedPlayerZ / chunkSize);
    
    // EXTREME PERFORMANCE FIX: Minimal render distance for 60fps
    const maxRenderDistance = Math.min(renderDistance, 80); // Drastically reduced from 200
    const chunkRadius = Math.min(Math.ceil(maxRenderDistance / chunkSize), 2); // Max 2 chunks radius
    const farAheadChunks = Math.min(Math.ceil(maxRenderDistance / chunkSize) + 2, 3); // Max 3 ahead
    
    // Extreme chunk limit reduction for 60fps
    let chunkCount = 0;
    const maxChunks = 25; // Reduced from 100 to 25
    
    // Generate minimal chunks without overlap
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + farAheadChunks && chunkCount < maxChunks; z++) {
        if (z >= -Math.ceil(maxRenderDistance / chunkSize)) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          // PERFORMANCE FIX: Much more aggressive distance-based culling
          const distanceToPlayer = Math.sqrt(
            Math.pow(worldX - roundedPlayerX, 2) + 
            Math.pow(worldZ - roundedPlayerZ, 2)
          );
          
          // PERFORMANCE FIX: Strict distance check without buffer
          if (distanceToPlayer <= maxRenderDistance) {
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
    
    console.log(`ChunkSystem: Generated ${chunks.length} chunks (performance optimized)`);
    return chunks;
  }, [
    // EXTREME PERFORMANCE FIX: Ultra low frequency recalculation
    Math.floor(playerPosition.x / 100) * 100, // Increased from 50 to 100
    Math.floor(Math.abs(playerPosition.z) / 100) * 100, // Increased from 50 to 100
    chunkSize, 
    Math.min(renderDistance, 80) // Updated to match new render distance
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
