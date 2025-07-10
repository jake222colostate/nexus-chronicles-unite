
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
    
    // INCREASED: Higher render distance for infinite mountain rendering
    const maxRenderDistance = Math.min(renderDistance, 200); // Increased from 80 to 200
    const chunkRadius = Math.min(Math.ceil(maxRenderDistance / chunkSize), 4); // Increased to 4 chunks radius
    const farAheadChunks = Math.min(Math.ceil(maxRenderDistance / chunkSize) + 3, 6); // Increased to 6 ahead
    
    // INCREASED: More chunks for infinite mountain rendering
    let chunkCount = 0;
    const maxChunks = 60; // Increased from 25 to 60
    
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
    // INCREASED RESPONSIVENESS: More frequent recalculation for infinite rendering
    Math.floor(playerPosition.x / 50) * 50, // Reduced from 100 to 50 for better responsiveness
    Math.floor(Math.abs(playerPosition.z) / 50) * 50, // Reduced from 100 to 50 for better responsiveness
    chunkSize, 
    Math.min(renderDistance, 200) // Updated to match new render distance
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
