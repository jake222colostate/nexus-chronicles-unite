
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
    // MASSIVELY REDUCED: Only 1 chunk for 60 FPS performance
    const chunks: ChunkData[] = [];
    
    // Single chunk at player position
    const playerChunkX = Math.floor(playerPosition.x / chunkSize);
    const playerChunkZ = Math.floor(Math.abs(playerPosition.z) / chunkSize);
    
    const worldX = playerChunkX * chunkSize;
    const worldZ = -playerChunkZ * chunkSize;
    const seed = ((playerChunkX & 0xFFFF) << 16) | (playerChunkZ & 0xFFFF);
    
    chunks.push({
      id: `chunk_${playerChunkX}_${playerChunkZ}`,
      x: playerChunkX,
      z: playerChunkZ,
      worldX,
      worldZ,
      seed: Math.abs(seed) % 10000
    });
    
    console.log(`ChunkSystem: Ultra-lightweight - only 1 chunk for 60 FPS`);
    return chunks;
  }, [
    // REDUCED: Less frequent updates
    Math.floor(playerPosition.x / 50),
    Math.floor(Math.abs(playerPosition.z) / 50),
    chunkSize
  ]);

  return <>{children(activeChunks)}</>;
});

ChunkSystem.displayName = 'ChunkSystem';
