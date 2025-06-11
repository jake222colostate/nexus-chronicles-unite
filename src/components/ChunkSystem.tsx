
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
    
    // FIXED: Much less aggressive position rounding to prevent chunk gaps
    const roundedPlayerX = Math.round(playerPosition.x / 2) * 2; // Reduced from 5 to 2
    const roundedPlayerZ = Math.round(Math.abs(playerPosition.z) / 2) * 2; // Reduced from 5 to 2
    
    const playerChunkX = Math.floor(roundedPlayerX / chunkSize);
    const playerChunkZ = Math.floor(roundedPlayerZ / chunkSize);
    
    // FIXED: Increased render distance and chunk coverage for seamless rendering
    const maxRenderDistance = Math.max(renderDistance, 250); // Increased from 150
    const chunkRadius = Math.ceil(maxRenderDistance / chunkSize) + 2; // Added buffer
    const farAheadChunks = Math.ceil(maxRenderDistance / chunkSize) + 3; // Added buffer
    
    // FIXED: Increased chunk limit to prevent premature culling
    let chunkCount = 0;
    const maxChunks = 500; // Allow many more chunks for true infinite terrain
    
    // Generate chunks in a larger pattern with overlap for seamless coverage
    for (let x = playerChunkX - chunkRadius - 1; x <= playerChunkX + chunkRadius + 1 && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ - chunkRadius - 1; z <= playerChunkZ + chunkRadius + farAheadChunks + 1 && chunkCount < maxChunks; z++) {
        if (z >= -Math.ceil(maxRenderDistance / chunkSize) - 2) { // Added buffer
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          // FIXED: Much less aggressive distance-based culling
          const distanceToPlayer = Math.sqrt(
            Math.pow(worldX - roundedPlayerX, 2) + 
            Math.pow(worldZ - roundedPlayerZ, 2)
          );
          
          // FIXED: Increased tolerance and added buffer for seamless rendering
          if (distanceToPlayer <= maxRenderDistance + chunkSize) { // Added chunkSize buffer
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
    
    console.log(`ChunkSystem: Generated ${chunks.length} chunks with enhanced coverage for seamless rendering`);
    return chunks;
  }, [
    // FIXED: Even less aggressive recalculation frequency
    Math.floor(playerPosition.x / 5) * 5, // Reduced frequency
    Math.floor(Math.abs(playerPosition.z) / 5) * 5, // Reduced frequency
    chunkSize, 
    Math.max(renderDistance, 250)
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
