
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
    
    // Optimized chunk radius calculation
    const chunkRadius = Math.ceil(renderDistance / chunkSize);
    
    // Generate chunks in a more efficient pattern
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius + 2; z++) {
        // Always generate chunks ahead of player for seamless movement
        if (z >= -1) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          // Distance-based culling for better performance
          const distanceToPlayer = Math.sqrt(
            Math.pow(worldX - playerPosition.x, 2) + 
            Math.pow(worldZ - playerPosition.z, 2)
          );
          
          if (distanceToPlayer <= renderDistance + chunkSize) {
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
