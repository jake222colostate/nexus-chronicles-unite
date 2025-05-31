
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

export const ChunkSystem: React.FC<ChunkSystemProps> = ({
  playerPosition,
  chunkSize,
  renderDistance,
  children
}) => {
  const activeChunks = useMemo(() => {
    const chunks: ChunkData[] = [];
    const playerChunkX = Math.floor(playerPosition.x / chunkSize);
    const playerChunkZ = Math.floor(Math.abs(playerPosition.z) / chunkSize);
    
    const chunkRadius = Math.ceil(renderDistance / chunkSize);
    
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius; z++) {
        // Only generate chunks in front of and around the player
        if (z >= 0) {
          const worldX = x * chunkSize;
          const worldZ = -z * chunkSize; // Negative because we move forward in negative Z
          
          // Simple deterministic seed based on chunk coordinates
          const seed = (x * 1000 + z) % 10000;
          
          chunks.push({
            id: `chunk_${x}_${z}`,
            x,
            z,
            worldX,
            worldZ,
            seed
          });
        }
      }
    }
    
    return chunks;
  }, [playerPosition.x, playerPosition.z, chunkSize, renderDistance]);

  return <>{children(activeChunks)}</>;
};
