
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
    
    // Much less aggressive position rounding for 60fps
    const roundedPlayerX = Math.round(playerPosition.x / 10) * 10;
    const roundedPlayerZ = Math.round(Math.abs(playerPosition.z) / 10) * 10;
    
    const playerChunkX = Math.floor(roundedPlayerX / chunkSize);
    const playerChunkZ = Math.floor(roundedPlayerZ / chunkSize);
    
    // Reduced render distance for 60fps
    const maxRenderDistance = Math.min(renderDistance, 150);
    const chunkRadius = Math.ceil(maxRenderDistance / chunkSize);
    const farAheadChunks = Math.ceil(maxRenderDistance / chunkSize);
    
    // Reduced chunk limit for 60fps
    let chunkCount = 0;
    const maxChunks = 200;
    
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius + farAheadChunks && chunkCount < maxChunks; z++) {
        if (z >= -Math.ceil(maxRenderDistance / chunkSize)) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize;
          
          const distanceToPlayer = Math.sqrt(
            Math.pow(worldX - roundedPlayerX, 2) + 
            Math.pow(worldZ - roundedPlayerZ, 2)
          );
          
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
    
    return chunks;
  }, [
    // Reduced recalculation frequency for 60fps
    Math.floor(playerPosition.x / 20) * 20,
    Math.floor(Math.abs(playerPosition.z) / 20) * 20,
    chunkSize, 
    Math.min(renderDistance, 150)
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
