
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
    
    // Much larger chunk radius for far terrain rendering
    const chunkRadius = Math.ceil(renderDistance / chunkSize);
    const farAheadChunks = Math.ceil(renderDistance / chunkSize) * 2; // Generate chunks much farther ahead
    
    // Generate chunks in a much larger pattern for far terrain
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius + farAheadChunks; z++) {
        // Generate chunks far ahead and behind the player
        if (z >= -Math.ceil(renderDistance / chunkSize)) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          // Much more generous distance-based culling for far terrain
          const distanceToPlayer = Math.sqrt(
            Math.pow(worldX - playerPosition.x, 2) + 
            Math.pow(worldZ - playerPosition.z, 2)
          );
          
          if (distanceToPlayer <= renderDistance + chunkSize * 2) {
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
          }
        }
      }
    }
    
    console.log(`ChunkSystem: Generated ${chunks.length} chunks with render distance ${renderDistance}`);
    
    return chunks;
  }, [
    Math.floor(playerPosition.x / chunkSize), 
    Math.floor(Math.abs(playerPosition.z) / chunkSize), 
    chunkSize, 
    renderDistance
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
