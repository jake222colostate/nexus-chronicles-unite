
import React, { useMemo } from 'react';

export interface ChunkData {
  id: string;
  worldX: number;
  worldZ: number;
  seed: number;
}

interface OptimizedChunkSystemProps {
  playerPosition: { x: number; y: number; z: number };
  chunkSize: number;
  renderDistance: number;
  children: (chunks: ChunkData[]) => React.ReactNode;
}

export const OptimizedChunkSystem: React.FC<OptimizedChunkSystemProps> = ({
  playerPosition,
  chunkSize,
  renderDistance,
  children
}) => {
  const chunks = useMemo(() => {
    const chunksToRender: ChunkData[] = [];
    const playerChunkZ = Math.floor(playerPosition.z / chunkSize);
    
    // Only generate chunks within render distance
    for (let z = playerChunkZ - renderDistance; z <= playerChunkZ + renderDistance; z++) {
      const worldZ = z * chunkSize;
      const chunkId = `chunk_0_${z}`;
      
      chunksToRender.push({
        id: chunkId,
        worldX: 0,
        worldZ,
        seed: z * 1000 + 12345
      });
    }
    
    return chunksToRender;
  }, [playerPosition.z, chunkSize, renderDistance]);

  return <>{children(chunks)}</>;
};
