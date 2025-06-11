
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
    
    // Much more stable position tracking to prevent constant recalculation
    const roundedPlayerX = Math.round(playerPosition.x / 25) * 25;
    const roundedPlayerZ = Math.round(Math.abs(playerPosition.z) / 25) * 25;
    
    const playerChunkX = Math.floor(roundedPlayerX / chunkSize);
    const playerChunkZ = Math.floor(roundedPlayerZ / chunkSize);
    
    // Conservative render distance for stability
    const maxRenderDistance = Math.min(renderDistance, 200);
    const chunkRadius = Math.ceil(maxRenderDistance / chunkSize);
    
    // Stable chunk generation without rapid cleanup
    let chunkCount = 0;
    const maxChunks = 100; // Reduced for stability
    
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius + 2 && chunkCount < maxChunks; z++) {
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
    // Much less frequent recalculation to prevent ground flickering
    Math.floor(playerPosition.x / 50) * 50,
    Math.floor(Math.abs(playerPosition.z) / 50) * 50,
    chunkSize, 
    Math.min(renderDistance, 200)
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
